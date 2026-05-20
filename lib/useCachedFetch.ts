"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const CACHE_TTL = 5 * 60 * 1000

const cache = new Map<string, CacheEntry<any>>()

function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache<T>(key: string, data: T) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  })
}

function invalidateCache(key: string) {
  cache.delete(key)
}

interface UseCachedFetchOptions<T> {
  cacheKey: string
  fetcher: () => Promise<T>
  enabled?: boolean
  ttl?: number
}

interface UseCachedFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  invalidate: () => void
}

export function useCachedFetch<T>({
  cacheKey,
  fetcher,
  enabled = true,
  ttl = CACHE_TTL,
}: UseCachedFetchOptions<T>): UseCachedFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const execute = useCallback(async (forceRefresh = false) => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const cached = getCache<T>(cacheKey)
    if (cached && !forceRefresh) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    abortRef.current = false

    try {
      const result = await fetcher()
      if (!abortRef.current) {
        setCache(cacheKey, result)
        setData(result)
        setLoading(false)
      }
    } catch (err: any) {
      if (!abortRef.current) {
        setError(err.message || "Failed to fetch")
        setLoading(false)
      }
    }
  }, [cacheKey, fetcher, enabled])

  const refetch = useCallback(() => execute(true), [execute])

  const invalidate = useCallback(() => {
    invalidateCache(cacheKey)
  }, [cacheKey])

  useEffect(() => {
    execute()
    return () => {
      abortRef.current = true
    }
  }, [execute])

  return { data, loading, error, refetch, invalidate }
}

export { invalidateCache, setCache, getCache }
