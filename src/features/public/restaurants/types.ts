import type { SelectOption } from "@/features/new/constants"

export type FeedFilter =
  | "all"
  | "promotion"
  | "new_menu"
  | "feedback"
  | "event"
  | "experience"

export interface FeedLocationSelection {
  province: SelectOption
  district: SelectOption | null
}

export interface FeedUser {
  full_name?: string | null
  user_name?: string | null
  email?: string | null
  avatar_url?: string | null
  avatar?: string | null
  profileImage?: string | null
}

export interface NearbyRestaurant {
  id: string
  name: string
  image: string
  rating: number
  distance: string
  verified: boolean
  provinceCode: number
  districtCode?: number
}

export interface PostRestaurant {
  name: string
  avatar: string
  verified: boolean
  location: string
  provinceCode: number
  districtCode?: number
}

export interface PromotionInfo {
  discount: string
  validUntil: string
}

export interface EventInfo {
  price: string
  time: string
  special: string
}

export interface CustomerFeedback {
  name: string
  avatar: string
  rating: number
  comment: string
}

export interface FeedPost {
  id: string
  type: Exclude<FeedFilter, "all">
  restaurant: PostRestaurant
  timestamp: string
  content: string
  tags?: string[]
  promotion?: PromotionInfo
  event?: EventInfo
  customerFeedback?: CustomerFeedback
  images?: string[]
  liked: boolean
  bookmarked: boolean
  likes: number
  comments: number
  shares: number
}
