import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize and validate input data
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for NoSQL injection patterns in request body
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body);
    
    // Check for NoSQL injection patterns
    const nosqlPatterns = [
      /\$ne\b/i,
      /\$gt\b/i,
      /\$lt\b/i,
      /\$regex\b/i,
      /\$where\b/i,
      /\$or\b/i,
      /\$and\b/i,
      /\$in\b/i,
      /\$nin\b/i
    ];
    
    for (const pattern of nosqlPatterns) {
      if (pattern.test(bodyStr)) {
        res.status(400).json({ error: 'Invalid request format.' });
        return;
      }
    }
    
    // Recursively sanitize strings in the request body
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Recursively sanitize an object by escaping potentially dangerous characters
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Remove potential XSS patterns
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous MongoDB operators
      if (typeof key === 'string' && key.startsWith('$')) {
        continue;
      }
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
