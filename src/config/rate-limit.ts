/**
 * @description
 * Provides configuration and instances of rate limiting middleware
 * using the 'express-rate-limit' library.
 *
 * Key features:
 * - Limits the number of requests within a given timeframe (in this case, for login attempts).
 * - Helps mitigate brute-force attacks on login.
 *
 * @dependencies
 * - express-rate-limit: The primary library for request rate limiting
 *
 * @notes
 * - Currently, only a single rate limiter is defined for login attempts.
 * - You can create additional limiters for other endpoints as needed.
 * - If you need more flexible logic (e.g., different limits for different roles),
 *   you can define multiple rate-limiters or custom logic in this file.
 * - Rate-limiting is most effective when used behind a properly configured server
 *   that respects IP addresses (or uses X-Forwarded-For, if behind a load balancer).
 */

import rateLimit from 'express-rate-limit';

/**
 * @constant loginRateLimiter
 * @description
 * A rate limiter for login attempts to mitigate brute-force attacks.
 * 
 * Configuration details:
 * - windowMs: 15 minutes (15 * 60 * 1000 ms)
 * - max: 10 attempts
 * - standardHeaders: true -> Include RateLimit-* headers in the response
 * - legacyHeaders: false -> Disable the deprecated X-RateLimit-* headers
 * - message: A generic error message returned when user hits the rate limit
 *
 * @usage
 * router.post('/login', loginRateLimiter, (req, res) => {...});
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the deprecated X-RateLimit-* headers
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
});

