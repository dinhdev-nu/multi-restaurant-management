import { create } from "zustand"
import type { AppError, UpdatePreferencesPayload, UpdateProfilePayload, UserProfile } from "@/lib/api/types"
import { toAppError } from "@/lib/api/error"
import { getMe, mapPreferencesToUi, updateMe, updateMyPreferences, type UiPreferences } from "@/lib/api/users"

const PROFILE_STORAGE_KEY = "gigi_profile"
const PREFERENCES_STORAGE_KEY = "gigi_preferences"

function readStoredProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    return null
  }
}

function readStoredPreferences(): UiPreferences | null {
  const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UiPreferences
  } catch {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY)
    return null
  }
}

function persistUserState(profile: UserProfile | null, preferences: UiPreferences | null): void {
  if (profile) localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  else localStorage.removeItem(PROFILE_STORAGE_KEY)

  if (preferences) localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  else localStorage.removeItem(PREFERENCES_STORAGE_KEY)
}

interface UserState {
  profile: UserProfile | null
  preferences: UiPreferences | null
  isLoadingProfile: boolean
  isSavingProfile: boolean
  error: AppError | null
  fetchProfile: () => Promise<void>
  saveProfile: (payload: UpdateProfilePayload) => Promise<void>
  savePreferences: (payload: UpdatePreferencesPayload) => Promise<void>
  clear: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: readStoredProfile(),
  preferences: readStoredPreferences(),
  isLoadingProfile: false,
  isSavingProfile: false,
  error: null,
  fetchProfile: async () => {
    if (get().isLoadingProfile) return
    set({ isLoadingProfile: true, error: null })
    try {
      const profile = await getMe()
      const preferences = mapPreferencesToUi(profile)
      persistUserState(profile, preferences)
      set({ profile, preferences })
    } catch (error) {
      set({ error: toAppError(error, "Failed to load user profile") })
      throw error
    } finally {
      set({ isLoadingProfile: false })
    }
  },
  saveProfile: async (payload) => {
    set({ isSavingProfile: true, error: null })
    try {
      const profile = await updateMe(payload)
      const preferences = mapPreferencesToUi(profile)
      persistUserState(profile, preferences)
      set({ profile, preferences })
    } catch (error) {
      set({ error: toAppError(error, "Failed to update profile") })
      throw error
    } finally {
      set({ isSavingProfile: false })
    }
  },
  savePreferences: async (payload) => {
    set({ isSavingProfile: true, error: null })
    try {
      const preferences = await updateMyPreferences(payload)
      set((prev) => ({
        ...(() => {
          const nextProfile = prev.profile
            ? {
                ...prev.profile,
                preferences: {
                  language: preferences.language,
                  theme: preferences.theme,
                  // Guard: prev.profile.preferences có thể undefined ở user mới
                  notifications: prev.profile.preferences?.notifications
                    ? {
                        ...prev.profile.preferences.notifications,
                        email: preferences.notifications.email,
                        sms: preferences.notifications.phone,
                        push: preferences.notifications.push,
                      }
                    : {
                        email: preferences.notifications.email,
                        sms: preferences.notifications.phone,
                        push: preferences.notifications.push,
                      },
                },
              }
            : prev.profile

          persistUserState(nextProfile, preferences)
          return { profile: nextProfile }
        })(),
        preferences,
      }))
    } catch (error) {
      set({ error: toAppError(error, "Failed to update preferences") })
      throw error
    } finally {
      set({ isSavingProfile: false })
    }
  },
  clear: () => {
    persistUserState(null, null)
    set({ profile: null, preferences: null, error: null })
  },
}))
