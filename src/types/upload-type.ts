export const UPLOAD_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const

export type UploadAllowedMimeType = (typeof UPLOAD_ALLOWED_MIME_TYPES)[number]

export interface UploadedFile {
  url: string
  filename: string
  originalname: string
  mimetype: string
  size: number
}

export interface ReplaceUploadPayload {
  imgUrl: string
  file: File
}

export interface DeleteUploadQuery {
  imgUrl: string
}
