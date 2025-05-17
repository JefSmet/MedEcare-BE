process.env.DB_URL = 'file:./dev.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8000';
process.env.ACCESS_TOKEN_EXPIRY_WEB = process.env.ACCESS_TOKEN_EXPIRY_WEB || '1h';
process.env.REFRESH_TOKEN_EXPIRY_WEB = process.env.REFRESH_TOKEN_EXPIRY_WEB || '2d';
process.env.ACCESS_TOKEN_EXPIRY_MOBILE = process.env.ACCESS_TOKEN_EXPIRY_MOBILE || '1h';
process.env.REFRESH_TOKEN_EXPIRY_MOBILE = process.env.REFRESH_TOKEN_EXPIRY_MOBILE || '2d';
