// Simple in-memory rate limiter
// For production, use Redis or a dedicated service

interface RateLimitStore {
  [key: string]: number[]
}

const store: RateLimitStore = {}

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; reset: Date } {
  const now = Date.now()
  const windowStart = now - windowMs

  // Get or create request history
  if (!store[identifier]) {
    store[identifier] = []
  }

  // Remove old requests outside the window
  store[identifier] = store[identifier].filter((timestamp) => timestamp > windowStart)

  // Check if limit exceeded
  if (store[identifier].length >= maxRequests) {
    const oldestRequest = Math.min(...store[identifier])
    const resetTime = new Date(oldestRequest + windowMs)

    return {
      success: false,
      remaining: 0,
      reset: resetTime,
    }
  }

  // Add current request
  store[identifier].push(now)

  return {
    success: true,
    remaining: maxRequests - store[identifier].length,
    reset: new Date(now + windowMs),
  }
}

// Cleanup old entries periodically (optional, for memory management)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].length === 0) {
        delete store[key]
      }
    })
  }, 60000) // Clean every minute
}















