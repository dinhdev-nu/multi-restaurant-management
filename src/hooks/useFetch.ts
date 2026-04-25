import { useEffect, useState } from "react"

interface UseFetchOptions {
  enabled?: boolean
}

interface UseFetchResult<TData> {
  data: TData | null
  isLoading: boolean
  error: unknown | null
}

export function useFetch<TArgs extends unknown[], TData>(
  fetcher: (...args: TArgs) => Promise<TData>,
  args: TArgs,
  options: UseFetchOptions = {}
): UseFetchResult<TData> {
  const { enabled = true } = options

  const [data, setData] = useState<TData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    let isActive = true

    async function runFetch() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetcher(...args)
        if (!isActive) return

        setData(response)
      } catch {
        if (!isActive) return
        setError("Không thể tải dữ liệu.")
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    runFetch()

    return () => {
      isActive = false
    }
  }, [enabled, fetcher, ...args])

  return { data, isLoading, error }
}