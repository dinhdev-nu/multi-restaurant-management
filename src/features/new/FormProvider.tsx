import React, { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkRestaurantSlug, createRestaurant } from '@/services/restaurants';
import { toAppError } from '@/services/error';
import { uploadMultipleFiles, uploadSingleFile } from '@/services/uploads';
import { UPLOAD_ALLOWED_MIME_TYPES } from '@/types/upload-type';
import {
    DAY_KEYS,
    DEFAULT_OPERATING_HOURS,
    REQUIRED_FIELDS,
    isOperatingHoursComplete,
    isFieldFilled,
} from './constants';
import type { DayKey, RestaurantDTO } from './constants';
import type { AppError } from '@/services/types';

type NumberFieldName = 'latitude' | 'longitude';
type OperatingTimeKey = 'open' | 'close';
type ImageUploadType = 'logo_url' | 'cover_image_url' | 'gallery_urls';
export type SlugCheckStatus = 'idle' | 'checking' | 'available' | 'taken';

const MAX_GALLERY_ITEMS = 8;
const SLUG_CHECK_DEBOUNCE_MS = 500;

export interface CreateRestaurantState {
    formData: RestaurantDTO;
    errors: Partial<Record<keyof RestaurantDTO, string>>;
    progress: number;
}

export interface CreateRestaurantActions {
    setField: (name: keyof RestaurantDTO, value: RestaurantDTO[keyof RestaurantDTO]) => void;
    changeTextField: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    changeNumberField: (name: NumberFieldName, value: string) => void;
    changeOperatingClosed: (dayId: DayKey, closed: boolean) => void;
    changeOperatingTime: (dayId: DayKey, key: OperatingTimeKey, value: string) => void;
    requestCurrentLocation: () => void;
    uploadImage: (event: React.ChangeEvent<HTMLInputElement>, type: ImageUploadType) => void;
    submit: () => Promise<void>;
    submitForm: (event: React.FormEvent<HTMLFormElement>) => void;
    setImagePreviews?: (logoUrl?: string | null, coverUrl?: string | null, galleryUrls?: string[]) => void;
}

export interface CreateRestaurantMeta {
    logoPreview: string | null;
    coverPreview: string | null;
    galleryPreviews: string[];
    isSubmitting: boolean;
    isUploadingAssets: boolean;
    slugCheckStatus: SlugCheckStatus;
    isLocating: boolean;
    locationError: string | null;
}

interface CreateRestaurantContextValue {
    state: CreateRestaurantState;
    actions: CreateRestaurantActions;
    meta: CreateRestaurantMeta;
}

const CreateRestaurantContext = createContext<CreateRestaurantContextValue | undefined>(undefined);

function createDefaultOperatingHours() {
    return {
        mon: { ...DEFAULT_OPERATING_HOURS.mon },
        tue: { ...DEFAULT_OPERATING_HOURS.tue },
        wed: { ...DEFAULT_OPERATING_HOURS.wed },
        thu: { ...DEFAULT_OPERATING_HOURS.thu },
        fri: { ...DEFAULT_OPERATING_HOURS.fri },
        sat: { ...DEFAULT_OPERATING_HOURS.sat },
        sun: { ...DEFAULT_OPERATING_HOURS.sun },
    };
}

function normalizeOptionalString(value: string | undefined) {
    if (!value) return undefined;

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : undefined;
}

function buildPayload(formData: RestaurantDTO): RestaurantDTO {
    return {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        slug: normalizeOptionalString(formData.slug),
        description: normalizeOptionalString(formData.description),
        logo_url: normalizeOptionalString(formData.logo_url),
        cover_image_url: normalizeOptionalString(formData.cover_image_url),
        gallery_urls: formData.gallery_urls && formData.gallery_urls.length > 0 ? formData.gallery_urls : undefined,
        website: normalizeOptionalString(formData.website),
        cuisine_type: normalizeOptionalString(formData.cuisine_type),
        district: normalizeOptionalString(formData.district),
        ward: normalizeOptionalString(formData.ward),
        phone: normalizeOptionalString(formData.phone),
        email: normalizeOptionalString(formData.email),
        timezone: normalizeOptionalString(formData.timezone),
        latitude: typeof formData.latitude === 'number' ? formData.latitude : undefined,
        longitude: typeof formData.longitude === 'number' ? formData.longitude : undefined,
    };
}

function hasAtLeastOneOpenDay(formData: RestaurantDTO): boolean {
    return DAY_KEYS.some((day) => !formData.operating_hours[day].closed);
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('Cannot read file preview'));
        };
        reader.onerror = () => reject(new Error('Cannot read file preview'));
        reader.readAsDataURL(file);
    });
}

function getSlugCheckErrorMessage(appError: AppError): string {
    switch (appError.errorCode) {
        case 'INVALID_SLUG_FORMAT':
            return 'Slug không đúng định dạng (chỉ chữ thường, số và dấu gạch ngang)';
        case 'TOO_MANY_REQUESTS':
            return 'Bạn đang kiểm tra slug quá nhanh, vui lòng thử lại sau ít giây';
        default:
            return 'Không thể kiểm tra slug lúc này';
    }
}

function getUploadErrorMessage(appError: AppError): string {
    switch (appError.errorCode) {
        case 'UPLOAD_002':
            return 'Định dạng file không hợp lệ';
        case 'UPLOAD_003':
            return 'File vượt kích thước cho phép';
        case 'RATELIMIT_001':
            return 'Bạn thao tác quá nhanh, vui lòng thử lại sau';
        case 'AUTH_001':
        case 'AUTH_003':
            return 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        case 'UPLOAD_001':
            return 'Tải ảnh thất bại, vui lòng thử lại';
        default:
            return appError.message || 'Không thể tải ảnh lên máy chủ';
    }
}

function getCreateRestaurantErrorMessage(appError: AppError): string {
    switch (appError.errorCode) {
        case 'VALIDATION_ERROR':
            return 'Thông tin nhà hàng chưa hợp lệ, vui lòng kiểm tra lại';
        case 'CONFLICT_ERROR':
            return 'Slug đã tồn tại hoặc dữ liệu bị xung đột';
        case 'TOO_MANY_REQUESTS':
            return 'Bạn đã vượt giới hạn tạo nhà hàng, vui lòng thử lại sau';
        case 'UNAUTHORIZED':
        case 'TOKEN_EXPIRED':
        case 'AUTH_001':
        case 'AUTH_003':
            return 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        default:
            if (appError.status === 403) {
                return 'Bạn không có quyền tạo thêm nhà hàng hoặc đã vượt giới hạn tài khoản';
            }

            return appError.message || 'Không thể tạo nhà hàng';
    }
}

async function uploadByCount(files: File[]) {
    if (files.length === 1) {
        const item = await uploadSingleFile(files[0]);
        return [item];
    }

    return uploadMultipleFiles(files);
}

export interface CreateRestaurantProviderProps {
    children: React.ReactNode;
    isEditing?: boolean;
    restaurantId?: string;
}

export function CreateRestaurantProvider({ children, isEditing = false }: CreateRestaurantProviderProps) {
    const navigate = useNavigate();
    const hasAttemptedAutoLocationRef = useRef(false);
    const slugCheckRequestIdRef = useRef(0);

    const [formData, setFormData] = useState<RestaurantDTO>({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        cover_image_url: '',
        gallery_urls: [],
        website: '',
        cuisine_type: '',
        price_range: undefined,
        address: '',
        city: '',
        district: '',
        ward: '',
        latitude: undefined,
        longitude: undefined,
        phone: '',
        email: '',
        timezone: 'Asia/Ho_Chi_Minh',
        operating_hours: createDefaultOperatingHours(),
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RestaurantDTO, string>>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeUploadCount, setActiveUploadCount] = useState(0);
    const [slugCheckStatus, setSlugCheckStatus] = useState<SlugCheckStatus>('idle');
    const [lastCheckedSlug, setLastCheckedSlug] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const isUploadingAssets = activeUploadCount > 0;

    const requestCurrentLocation = useCallback((showErrorToast = true) => {
        if (!navigator.geolocation) {
            const message = 'Thiết bị không hỗ trợ lấy vị trí tự động';
            setLocationError(message);
            if (showErrorToast) {
                toast.error(message);
            }
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setFormData((prev) => ({
                    ...prev,
                    latitude: Number(latitude.toFixed(6)),
                    longitude: Number(longitude.toFixed(6)),
                }));
                setLocationError(null);
                setIsLocating(false);
            },
            (error) => {
                let message = 'Không thể lấy vị trí hiện tại';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Bạn đã từ chối quyền vị trí. Hãy bấm "Lấy lại vị trí" để thử lại';
                }
                if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Không xác định được vị trí hiện tại';
                }
                if (error.code === error.TIMEOUT) {
                    message = 'Yêu cầu lấy vị trí bị quá thời gian';
                }

                setLocationError(message);
                setIsLocating(false);
                if (showErrorToast) {
                    toast.error(message);
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 1000 * 60 * 5,
            }
        );
    }, []);

    useEffect(() => {
        if (hasAttemptedAutoLocationRef.current) return;

        hasAttemptedAutoLocationRef.current = true;
        requestCurrentLocation(false);
    }, [requestCurrentLocation]);

    useEffect(() => {
        // Skip slug checking if we're in edit mode
        if (isEditing) {
            setSlugCheckStatus('idle');
            return;
        }

        const normalizedSlug = (formData.slug ?? '').trim();

        if (!normalizedSlug) {
            setSlugCheckStatus('idle');
            setLastCheckedSlug(null);
            setErrors((prev) => {
                if (!prev.slug) return prev;

                const next = { ...prev };
                delete next.slug;
                return next;
            });
            return;
        }

        setSlugCheckStatus('checking');
        const requestId = slugCheckRequestIdRef.current + 1;
        slugCheckRequestIdRef.current = requestId;

        const timeoutId = window.setTimeout(async () => {
            try {
                const result = await checkRestaurantSlug({ slug: normalizedSlug });

                if (slugCheckRequestIdRef.current !== requestId) return;

                setLastCheckedSlug(normalizedSlug);

                if (result.available) {
                    setSlugCheckStatus('available');
                    setErrors((prev) => {
                        if (!prev.slug) return prev;

                        const next = { ...prev };
                        delete next.slug;
                        return next;
                    });
                    return;
                }

                setSlugCheckStatus('taken');
                setErrors((prev) => ({
                    ...prev,
                    slug: 'Slug đã được sử dụng, vui lòng chọn slug khác',
                }));
            } catch (error) {
                if (slugCheckRequestIdRef.current !== requestId) return;

                const appError = toAppError(error, 'Không thể kiểm tra slug lúc này');
                const message = getSlugCheckErrorMessage(appError);

                setSlugCheckStatus(appError.errorCode === 'INVALID_SLUG_FORMAT' ? 'taken' : 'idle');
                setErrors((prev) => ({
                    ...prev,
                    slug: message,
                }));
            }
        }, SLUG_CHECK_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [formData.slug]);

    const progress = useMemo(() => {
        const filled = REQUIRED_FIELDS.filter((field) => isFieldFilled(formData, field)).length;

        return Math.round((filled / REQUIRED_FIELDS.length) * 100);
    }, [formData]);

    const beginUpload = useCallback(() => {
        setActiveUploadCount((prev) => prev + 1);
    }, []);

    const endUpload = useCallback(() => {
        setActiveUploadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const setField = useCallback((name: keyof RestaurantDTO, value: RestaurantDTO[keyof RestaurantDTO]) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;

            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const changeTextField = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setField(event.target.name as keyof RestaurantDTO, event.target.value);
    }, [setField]);

    const changeNumberField = useCallback((name: NumberFieldName, value: string) => {
        const normalized = value.trim();
        const parsed = normalized === '' ? undefined : Number(normalized);

        setFormData((prev) => {
            if (parsed !== undefined && Number.isNaN(parsed)) {
                return prev;
            }

            return {
                ...prev,
                [name]: parsed,
            };
        });
    }, []);

    const changeOperatingClosed = useCallback((dayId: DayKey, closed: boolean) => {
        setFormData((prev) => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [dayId]: {
                    ...prev.operating_hours[dayId],
                    closed,
                },
            },
        }));
    }, []);

    const changeOperatingTime = useCallback((dayId: DayKey, key: OperatingTimeKey, value: string) => {
        setFormData((prev) => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [dayId]: {
                    ...prev.operating_hours[dayId],
                    [key]: value,
                },
            },
        }));
    }, []);

    const setImagePreviews = useCallback((logoUrl?: string | null, coverUrl?: string | null, galleryUrls?: string[]) => {
        if (logoUrl) setLogoPreview(logoUrl);
        if (coverUrl) setCoverPreview(coverUrl);
        if (galleryUrls && galleryUrls.length > 0) setGalleryPreviews(galleryUrls);
    }, []);

    const uploadImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, type: ImageUploadType) => {
        const files = Array.from(event.target.files ?? []);

        if (!files.length) return;

        const invalidFile = files.find((file) => !UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as (typeof UPLOAD_ALLOWED_MIME_TYPES)[number]));

        if (invalidFile) {
            toast.error('Chỉ hỗ trợ ảnh JPEG hoặc PNG');
            event.target.value = '';
            return;
        }

        if (type === 'logo_url' || type === 'cover_image_url') {
            const file = files[0];

            try {
                const preview = await readFileAsDataUrl(file);

                if (type === 'logo_url') {
                    setLogoPreview(preview);
                } else {
                    setCoverPreview(preview);
                }

                beginUpload();
                const [uploaded] = await uploadByCount([file]);

                setFormData((prev) => ({
                    ...prev,
                    [type]: uploaded.url,
                }));
                toast.success(type === 'logo_url' ? 'Logo đã được tải lên' : 'Ảnh bìa đã được tải lên');
            } catch (error) {
                setFormData((prev) => ({
                    ...prev,
                    [type]: '',
                }));
                if (type === 'logo_url') {
                    setLogoPreview(null);
                } else {
                    setCoverPreview(null);
                }
                const appError = toAppError(error, 'Không thể tải ảnh lên máy chủ');
                toast.error(getUploadErrorMessage(appError));
            } finally {
                endUpload();
                event.target.value = '';
            }

            return;
        }

        const availableSlots = Math.max(0, MAX_GALLERY_ITEMS - (formData.gallery_urls?.length ?? 0));
        const nextFiles = files.slice(0, availableSlots);

        if (!nextFiles.length) {
            event.target.value = '';
            return;
        }

        try {
            const nextPreviews = await Promise.all(nextFiles.map((file) => readFileAsDataUrl(file)));
            setGalleryPreviews((prev) => [...prev, ...nextPreviews]);

            beginUpload();
            const uploadedItems = await uploadByCount(nextFiles);

            setFormData((prev) => ({
                ...prev,
                gallery_urls: [...(prev.gallery_urls ?? []), ...uploadedItems.map((item) => item.url)],
            }));
            toast.success(`Đã tải lên ${uploadedItems.length} ảnh trong thư viện`);
        } catch (error) {
            setGalleryPreviews((prev) => prev.slice(0, Math.max(0, prev.length - nextFiles.length)));
            const appError = toAppError(error, 'Không thể tải một số ảnh trong thư viện lên máy chủ');
            toast.error(getUploadErrorMessage(appError));
        } finally {
            endUpload();
            event.target.value = '';
        }
    }, [beginUpload, endUpload, formData.gallery_urls]);

    const validateBeforeSubmit = useCallback((payload: RestaurantDTO): boolean => {
        const nextErrors: Partial<Record<keyof RestaurantDTO, string>> = {};

        REQUIRED_FIELDS.forEach((field) => {
            if (!isFieldFilled(payload, field)) {
                nextErrors[field] = 'Trường này là bắt buộc';
            }
        });

        if (!isOperatingHoursComplete(payload.operating_hours)) {
            nextErrors.operating_hours = 'Giờ hoạt động không hợp lệ (định dạng HH:mm)';
        }

        if (!hasAtLeastOneOpenDay(payload)) {
            nextErrors.operating_hours = 'Nhà hàng phải mở ít nhất 1 ngày trong tuần';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            toast.error('Vui lòng kiểm tra lại thông tin bắt buộc');
            return false;
        }

        return true;
    }, []);

    const validateSlugAvailability = useCallback(async (slug?: string): Promise<boolean> => {
        // Skip slug validation in edit mode
        if (isEditing) return true;

        if (!slug) return true;

        const normalizedSlug = slug.trim();
        if (!normalizedSlug) return true;

        if (lastCheckedSlug === normalizedSlug) {
            if (slugCheckStatus === 'available') return true;

            if (slugCheckStatus === 'taken') {
                setSlugCheckStatus('taken');
                setErrors((prev) => ({
                    ...prev,
                    slug: 'Slug đã được sử dụng, vui lòng chọn slug khác',
                }));
                return false;
            }
        }

        try {
            const result = await checkRestaurantSlug({ slug: normalizedSlug });
            if (result.available) {
                setSlugCheckStatus('available');
                setErrors((prev) => {
                    if (!prev.slug) return prev;

                    const next = { ...prev };
                    delete next.slug;
                    return next;
                });
                return true;
            }

            setSlugCheckStatus('taken');
            setErrors((prev) => ({
                ...prev,
                slug: 'Slug đã được sử dụng, vui lòng chọn slug khác',
            }));
            return false;
        } catch (error) {
            const appError = toAppError(error, 'Không thể kiểm tra slug lúc này');
            const message = getSlugCheckErrorMessage(appError);

            setSlugCheckStatus(appError.errorCode === 'INVALID_SLUG_FORMAT' ? 'taken' : 'idle');
            setErrors((prev) => ({
                ...prev,
                slug: message,
            }));

            return false;
        }
    }, [lastCheckedSlug, slugCheckStatus]);

    const submit = useCallback(async () => {
        if (isSubmitting) return;

        if (isUploadingAssets) {
            toast.info('Đang tải ảnh lên, vui lòng đợi hoàn tất');
            return;
        }

        try {
            const payload = buildPayload(formData);

            const isValidPayload = validateBeforeSubmit(payload);
            if (!isValidPayload) return;

            const isSlugAvailable = await validateSlugAvailability(payload.slug);
            if (!isSlugAvailable) return;

            setIsSubmitting(true);

            const createdRestaurant = await createRestaurant(payload);

            toast.success('Tạo nhà hàng thành công');
            navigate('/restaurants', {
                replace: true,
                state: {
                    createdRestaurantId: createdRestaurant._id,
                },
            });
        } catch (error) {
            const appError = toAppError(error, 'Không thể tạo nhà hàng');
            if (appError.errorCode === 'CONFLICT_ERROR') {
                setSlugCheckStatus('taken');
                setErrors((prev) => ({
                    ...prev,
                    slug: 'Slug đã được sử dụng, vui lòng chọn slug khác',
                }));
            }

            toast.error(getCreateRestaurantErrorMessage(appError));
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isSubmitting, isUploadingAssets, navigate, validateBeforeSubmit, validateSlugAvailability]);

    const submitForm = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submit();
    }, [submit]);

    const state = useMemo<CreateRestaurantState>(() => ({
        formData,
        errors,
        progress,
    }), [formData, errors, progress]);

    const actions = useMemo<CreateRestaurantActions>(() => ({
        setField,
        changeTextField,
        changeNumberField,
        changeOperatingClosed,
        changeOperatingTime,
        requestCurrentLocation: () => requestCurrentLocation(true),
        uploadImage,
        submit,
        submitForm,
        setImagePreviews: setImagePreviews as any,
    }), [
        setField,
        changeTextField,
        changeNumberField,
        setImagePreviews,
        changeOperatingClosed,
        changeOperatingTime,
        requestCurrentLocation,
        uploadImage,
        submit,
        submitForm,
    ]);

    const meta = useMemo<CreateRestaurantMeta>(() => ({
        logoPreview,
        coverPreview,
        galleryPreviews,
        isSubmitting,
        isUploadingAssets,
        slugCheckStatus,
        isLocating,
        locationError,
    }), [logoPreview, coverPreview, galleryPreviews, isSubmitting, isUploadingAssets, slugCheckStatus, isLocating, locationError]);

    const value = useMemo<CreateRestaurantContextValue>(() => ({
        state,
        actions,
        meta,
    }), [state, actions, meta]);

    return (
        <CreateRestaurantContext.Provider value={value}>
            {children}
        </CreateRestaurantContext.Provider>
    );
}

function useCreateRestaurantContextValue() {
    const context = use(CreateRestaurantContext);

    if (context === undefined) {
        throw new Error('useCreateRestaurant must be used within a CreateRestaurantProvider');
    }

    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateRestaurantState() {
    return useCreateRestaurantContextValue().state;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateRestaurantActions() {
    return useCreateRestaurantContextValue().actions;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateRestaurantMeta() {
    return useCreateRestaurantContextValue().meta;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateRestaurant() {
    const { state, actions, meta } = useCreateRestaurantContextValue();

    return {
        state,
        actions,
        meta,
        ...state,
        ...meta,
        set: actions.setField,
        handleChange: actions.changeTextField,
        handleNumberChange: actions.changeNumberField,
        handleOperatingClosedChange: actions.changeOperatingClosed,
        handleOperatingTimeChange: actions.changeOperatingTime,
        handleImageUpload: actions.uploadImage,
        handleSubmit: actions.submitForm,
    };
}
