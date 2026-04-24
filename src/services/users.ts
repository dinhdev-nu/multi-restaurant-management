import { apiClient, unwrapResponseData } from "./client"
import type { ApiSuccessResponse } from "./types"
import type { UpdatePreferencesPayload, UpdateProfilePayload, UserProfile } from "@/types/user-type"

export interface UiPreferences {
  language: "en" | "vi"
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    phone: boolean
    push: boolean
  }
}

export function mapPreferencesToUi(profile: UserProfile): UiPreferences {
  // Guard: preferences có thể thiếu nếu user mới hoặc API trả thiếu field
  const prefs = profile.preferences
  return {
    language: prefs?.language ?? "vi",
    theme: prefs?.theme ?? "light",
    notifications: {
      email: Boolean(prefs?.notifications?.email),
      phone: Boolean(prefs?.notifications?.sms),
      push: Boolean(prefs?.notifications?.push),
    },
  }
}

export async function getMe(): Promise<UserProfile> {
  // NOTE: /users/me trả thẳng object user, không bọc trong { data: ... }
  const response = await apiClient.get<ApiSuccessResponse<UserProfile>>("/users/me")
  return unwrapResponseData(response)
}

export async function updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await apiClient.patch<ApiSuccessResponse<{ updated: true; user: UserProfile }>>("/users/me", payload)
  return unwrapResponseData(response).user
}

export async function updateMyPreferences(payload: UpdatePreferencesPayload): Promise<UiPreferences> {
  const response = await apiClient.patch<ApiSuccessResponse<{
    updated: true
    preferences: {
      language: "en" | "vi"
      theme: "light" | "dark" | "system"
      notifications: {
        email: boolean
        sms: boolean
        push: boolean
      }
    }
  }>>("/users/me/preferences", payload)
  const data = unwrapResponseData(response)

  return {
    language: data.preferences.language,
    theme: data.preferences.theme,
    notifications: {
      email: Boolean(data.preferences.notifications.email),
      phone: Boolean(data.preferences.notifications.sms),
      push: Boolean(data.preferences.notifications.push),
    },
  }
}
