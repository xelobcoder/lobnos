import { apiPath } from './apiBaseUrl';

/** No default tenant: an unknown facility must never display an installation logo. */
export function companyImageUrl(tenantId: unknown): string {
     if (typeof tenantId !== 'number' || !Number.isSafeInteger(tenantId) || tenantId <= 0) return '';
     return `${apiPath('settings/companyprofile/images')}?tenantId=${tenantId}`;
}

/** Report URLs come from the backend; do not revive old, unscoped logo URLs. */
export function scopedCompanyImageUrl(logo: string | null | undefined): string {
     if (!logo) return '';
     try {
          const url = new URL(logo, 'http://image.local');
          const tenant = url.searchParams.getAll('tenantId');
          if (!['http:', 'https:'].includes(url.protocol) ||
               url.pathname !== '/api/v1/settings/companyprofile/images' ||
               tenant.length !== 1 || !/^[1-9]\d*$/.test(tenant[0]) ||
               !Number.isSafeInteger(Number(tenant[0]))) return '';
          // Use the browser's backend proxy, not an internal server hostname.
          return companyImageUrl(Number(tenant[0]));
     } catch {
          return '';
     }
}
