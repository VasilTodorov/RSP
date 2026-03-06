import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Grab the token from local storage
  const token = localStorage.getItem('access_token');

  // 2. If the token exists, clone the request and add the Authorization header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // 3. Pass the "cloned" request with the token to the next handler
    return next(cloned);
  }

  // 4. If no token, just pass the original request through
  return next(req);
};