import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { RestaurantFormData } from './constants';
import { REQUIRED_FIELDS, DEFAULT_DAY_HOURS } from './constants';

interface CreateRestaurantContextType {
  formData: RestaurantFormData;
  errors: Partial<Record<keyof RestaurantFormData, string>>;
  logoPreview: string | null;
  coverPreview: string | null;
  galleryPreviews: string[];
  tagInput: string;
  
  progress: number;
  
  setTagInput: (val: string) => void;
  set: (name: keyof RestaurantFormData, value: unknown) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleToggle: (field: 'workingDays' | 'services' | 'paymentMethods', value: string) => void;
  handleDayHour: (dayId: string, key: 'open' | 'close', value: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover' | 'gallery') => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveTag: (tag: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CreateRestaurantContext = createContext<CreateRestaurantContextType | undefined>(undefined);

export function CreateRestaurantProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<RestaurantFormData>({
    restaurantName: '', email: '', phone: '', website: '',
    instagram: '', facebook: '', tiktok: '',
    address: '', city: '', district: '', slug: '',
    cuisine: '', priceRange: '', capacity: '', minOrder: '', deliveryRadius: '',
    dayHours: {},
    workingDays: [], services: [], paymentMethods: [],
    description: '', specialties: '', tags: [],
  });

  const [errors] = useState<Partial<Record<keyof RestaurantFormData, string>>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const progress = useMemo(() => {
    const filled = REQUIRED_FIELDS.filter((f) => {
      const v = formData[f];
      return typeof v === 'string' ? v.trim().length > 0 : (v as string[]).length > 0;
    }).length;
    return Math.round((filled / REQUIRED_FIELDS.length) * 100);
  }, [formData]);

  const set = useCallback((name: keyof RestaurantFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    set(e.target.name as keyof RestaurantFormData, e.target.value);
  }, [set]);

  const handleToggle = useCallback((field: 'workingDays' | 'services' | 'paymentMethods', value: string) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      const extra: Partial<RestaurantFormData> = {};
      if (field === 'workingDays') {
        const nextHours = { ...prev.dayHours };
        if (!arr.includes(value)) nextHours[value] = { ...DEFAULT_DAY_HOURS };
        else delete nextHours[value];
        extra.dayHours = nextHours;
      }
      return { ...prev, [field]: next, ...extra };
    });
  }, []);

  const handleDayHour = useCallback((dayId: string, key: 'open' | 'close', value: string) => {
    setFormData((prev) => ({
      ...prev,
      dayHours: { ...prev.dayHours, [dayId]: { ...prev.dayHours[dayId], [key]: value } },
    }));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover' | 'gallery') => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') setLogoPreview(result);
        else if (type === 'cover') setCoverPreview(result);
        else setGalleryPreviews((prev) => prev.length < 6 ? [...prev, result] : prev);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleAddTag = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag && !formData.tags.includes(tag)) {
        set('tags', [...formData.tags, tag]);
      }
      setTagInput('');
    }
  }, [formData.tags, tagInput, set]);

  const handleRemoveTag = useCallback((tag: string) => {
    set('tags', formData.tags.filter((t) => t !== tag));
  }, [formData.tags, set]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Do something
  }, []);

  return (
    <CreateRestaurantContext.Provider
      value={{
        formData, errors, logoPreview, coverPreview, galleryPreviews, tagInput, setTagInput, progress,
        set, handleChange, handleToggle, handleDayHour, handleImageUpload, handleAddTag, handleRemoveTag, handleSubmit
      }}
    >
      {children}
    </CreateRestaurantContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateRestaurant() {
  const context = useContext(CreateRestaurantContext);
  if (context === undefined) {
    throw new Error('useCreateRestaurant must be used within a CreateRestaurantProvider');
  }
  return context;
}
