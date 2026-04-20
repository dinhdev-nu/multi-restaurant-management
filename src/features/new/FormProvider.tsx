import React, { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    DEFAULT_OPERATING_HOURS,
    REQUIRED_FIELDS,
    isFieldFilled,
} from './constants';
import type { DayKey, RestaurantDTO } from './constants';

type NumberFieldName = 'latitude' | 'longitude';
type OperatingTimeKey = 'open' | 'close';
type ImageUploadType = 'logo_url' | 'cover_image_url' | 'gallery_urls';

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
    uploadImage: (event: React.ChangeEvent<HTMLInputElement>, type: ImageUploadType) => void;
    submit: () => void;
    submitForm: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface CreateRestaurantMeta {
    logoPreview: string | null;
    coverPreview: string | null;
    galleryPreviews: string[];
}

interface CreateRestaurantContextValue {
    state: CreateRestaurantState;
    actions: CreateRestaurantActions;
    meta: CreateRestaurantMeta;
}

const CreateRestaurantContext = createContext<CreateRestaurantContextValue | undefined>(undefined);

const MAX_GALLERY_ITEMS = 8;

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

export function CreateRestaurantProvider({ children }: { children: React.ReactNode }) {
    const hasAttemptedAutoLocationRef = useRef(false);

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

    useEffect(() => {
        if (hasAttemptedAutoLocationRef.current) return;

        hasAttemptedAutoLocationRef.current = true;

        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setFormData((prev) => {
                    const hasLatitude = typeof prev.latitude === 'number';
                    const hasLongitude = typeof prev.longitude === 'number';

                    if (hasLatitude && hasLongitude) return prev;

                    return {
                        ...prev,
                        latitude: hasLatitude ? prev.latitude : Number(latitude.toFixed(6)),
                        longitude: hasLongitude ? prev.longitude : Number(longitude.toFixed(6)),
                    };
                });
            },
            () => {
                // Ignore permission errors and keep manual input as fallback.
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 1000 * 60 * 5,
            }
        );
    }, []);

    const [errors] = useState<Partial<Record<keyof RestaurantDTO, string>>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const progress = useMemo(() => {
        const filled = REQUIRED_FIELDS.filter((field) => isFieldFilled(formData, field)).length;

        return Math.round((filled / REQUIRED_FIELDS.length) * 100);
    }, [formData]);

    const setField = useCallback((name: keyof RestaurantDTO, value: RestaurantDTO[keyof RestaurantDTO]) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const uploadImage = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: ImageUploadType) => {
        const files = Array.from(event.target.files ?? []);

        if (!files.length) return;

        if (type === 'logo_url' || type === 'cover_image_url') {
            const file = files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;

                if (type === 'logo_url') {
                    setLogoPreview(result);
                } else {
                    setCoverPreview(result);
                }

                setFormData((prev) => ({
                    ...prev,
                    [type]: result,
                }));
            };

            reader.readAsDataURL(file);

            return;
        }

        files.forEach((file) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;

                setGalleryPreviews((prev) => {
                    if (prev.length >= MAX_GALLERY_ITEMS) return prev;

                    return [...prev, result];
                });

                setFormData((prev) => {
                    const current = prev.gallery_urls ?? [];

                    if (current.length >= MAX_GALLERY_ITEMS) return prev;

                    return {
                        ...prev,
                        gallery_urls: [...current, result],
                    };
                });
            };

            reader.readAsDataURL(file);
        });
    }, []);

    const submit = useCallback(() => {
        const payload = buildPayload(formData);

        // TODO: call create restaurant API.
        console.log('RestaurantDTO payload:', payload);
    }, [formData]);

    const submitForm = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
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
        uploadImage,
        submit,
        submitForm,
    }), [
        setField,
        changeTextField,
        changeNumberField,
        changeOperatingClosed,
        changeOperatingTime,
        uploadImage,
        submit,
        submitForm,
    ]);

    const meta = useMemo<CreateRestaurantMeta>(() => ({
        logoPreview,
        coverPreview,
        galleryPreviews,
    }), [logoPreview, coverPreview, galleryPreviews]);

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