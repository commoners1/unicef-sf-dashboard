# Backend Implementation Guide: httpOnly Cookies

This document provides the backend implementation requirements for httpOnly cookie-based authentication.

## 🎯 Overview

The frontend has been updated to use httpOnly cookies for authentication. The backend must be updated to:
1. Set httpOnly cookies on login
2. Read cookies from requests (instead of Authorization headers)
3. Clear cookies on logout
4. Configure CORS to allow credentials

## 📋 Required Backend Changes

### 1. Login Endpoint (`POST /auth/login`)

**Before (JWT in response body):**
```javascript
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await validateUser(email, password);
  const token = generateJWT(user);
  
  res.json({
    access_token: token,
    user: user
  });
});
```

**After (httpOnly cookie):**
```javascript
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await validateUser(email, password);
  const token = generateJWT(user);
  
  // Set httpOnly cookie
  res.cookie('auth_token', token, {
    httpOnly: true,        // JavaScript cannot access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: 3600000,       // 1 hour (adjust as needed)
    path: '/',
  });
  
  // Return user data only (no token in response)
  res.json({
    user: user
  });
});
```

### 2. Authentication Middleware

**Before (Authorization header):**
```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

**After (Cookie-based):**
```javascript
const authenticate = (req, res, next) => {
  // Read token from cookie instead of header
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 3. Refresh Token Endpoint (`POST /auth/refresh`)

**Before:**
```javascript
app.post('/auth/refresh', authenticate, async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const newToken = refreshJWT(token);
  
  res.json({
    access_token: newToken
  });
});
```

**After:**
```javascript
app.post('/auth/refresh', authenticate, async (req, res) => {
  const token = req.cookies?.auth_token;
  const newToken = refreshJWT(token);
  
  // Update the cookie with new token
  res.cookie('auth_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/',
  });
  
  res.json({ success: true });
});
```

### 4. Logout Endpoint (`POST /auth/logout`)

**Before:**
```javascript
app.post('/auth/logout', authenticate, async (req, res) => {
  // Token invalidation logic
  res.json({ success: true });
});
```

**After:**
```javascript
app.post('/auth/logout', authenticate, async (req, res) => {
  // Clear the httpOnly cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  res.json({ success: true });
});
```

### 5. CORS Configuration

**Critical**: CORS must be configured to allow credentials.

**Before:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
}));
```

**After:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,  // REQUIRED: Allow cookies to be sent
}));
```

**Express.js Example:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));
```

### 6. Cookie Parser Middleware

Ensure cookie parser is installed and configured:

```bash
npm install cookie-parser
```

```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

## 🔒 Security Configuration

### Cookie Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `secure` | `true` (production) | HTTPS only in production |
| `sameSite` | `'strict'` | CSRF protection |
| `maxAge` | `3600000` (1 hour) | Token expiry |
| `path` | `'/'` | Cookie path |

### Environment Variables

```env
# Production
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
COOKIE_SECURE=true

# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
COOKIE_SECURE=false
```

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt -v
```

Check for `Set-Cookie` header in response.

### Test Authenticated Request
```bash
curl -X GET http://localhost:3000/user/profile \
  -b cookies.txt -v
```

### Test Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt -v
```

Check that cookie is cleared.

## ⚠️ Important Notes

1. **Cookie Name**: Use `auth_token` as the cookie name (or update frontend if different)
2. **Domain**: Don't set `domain` unless using subdomains
3. **SameSite**: Use `'strict'` for maximum CSRF protection
4. **Secure Flag**: Always `true` in production (HTTPS required)
5. **CORS**: Must have `credentials: true` for cookies to work

## 🔄 Migration Checklist

- [ ] Update login endpoint to set httpOnly cookie
- [ ] Update authentication middleware to read from cookies
- [ ] Update refresh endpoint to update cookie
- [ ] Update logout endpoint to clear cookie
- [ ] Configure CORS with `credentials: true`
- [ ] Install and configure cookie-parser
- [ ] Update environment variables
- [ ] Test login flow
- [ ] Test authenticated requests
- [ ] Test logout flow
- [ ] Test token refresh
- [ ] Verify cookies in browser DevTools (should see httpOnly flag)

## 🐛 Troubleshooting

### Cookies Not Being Sent

1. Check CORS configuration (`credentials: true`)
2. Verify frontend URL matches CORS origin
3. Check browser console for CORS errors
4. Verify `withCredentials: true` in axios config (already done in frontend)

### Cookies Not Being Set

1. Check cookie settings (httpOnly, secure, sameSite)
2. Verify cookie parser is installed and configured
3. Check response headers for `Set-Cookie`
4. Verify domain/path settings

### 401 Unauthorized Errors

1. Verify authentication middleware reads from `req.cookies.auth_token`
2. Check JWT validation logic
3. Verify cookie is being sent with requests
4. Check cookie expiry settings

## 📚 Additional Resources

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Secure Cookie Flags](https://owasp.org/www-community/HttpOnly)
- [Express.js: Cookie Parser](https://expressjs.com/en/resources/middleware/cookie-parser.html)

