import { apiClient, unwrapResponseData } from "./client"
import type { ApiSuccessResponse } from "./types"
import type { UploadedFile } from "@/types/upload-type"

function buildSingleFileFormData(file: File): FormData {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

function buildMultipleFilesFormData(files: File[]): FormData {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append("files", file)
  })
  return formData
}

function buildReplaceFileFormData(imgUrl: string, file: File): FormData {
  const formData = new FormData()
  formData.append("imgUrl", imgUrl)
  formData.append("file", file)
  return formData
}

export async function uploadSingleFile(file: File): Promise<UploadedFile> {
  const formData = buildSingleFileFormData(file)
  const response = await apiClient.post<ApiSuccessResponse<UploadedFile>>("/upload/single", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return unwrapResponseData(response)
}

export async function uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
  const formData = buildMultipleFilesFormData(files)
  const response = await apiClient.post<ApiSuccessResponse<UploadedFile[]>>("/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return unwrapResponseData(response)
}

export async function replaceUploadedFile(imgUrl: string, file: File): Promise<UploadedFile> {
  const formData = buildReplaceFileFormData(imgUrl, file)
  const response = await apiClient.post<ApiSuccessResponse<UploadedFile>>("/upload/replace", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return unwrapResponseData(response)
}

export async function deleteUploadedFile(imgUrl: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null | Record<string, never>>>("/upload", {
    params: { imgUrl },
  })
}
