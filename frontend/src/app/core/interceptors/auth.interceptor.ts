import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      const canRefresh =
        error.status === 401 &&
        !!authService.getRefreshToken() &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh');

      if (!canRefresh) {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          authService.logout();
        }
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap(({ accessToken }) => {
          const retryReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
