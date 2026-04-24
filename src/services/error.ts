import axios from "axios"
import type { ApiErrorResponse, AppError } from "./types"

export function toAppError(error: unknown, fallbackMessage = "Something went wrong"): AppError {
  let appError: AppError

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status
    const body = error.response?.data
    appError = {
      status,
      errorCode: body?.errorCode,
      message: body?.message || error.message || fallbackMessage,
      details: body?.details,
    }
  } else if (error instanceof Error) {
    appError = { message: error.message }
  } else {
    appError = { message: fallbackMessage }
  }

  console.error("[AppError]", appError.errorCode ?? "", appError.message, error)
  return appError
}

