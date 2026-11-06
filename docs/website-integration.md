# Public website and application integration

The public website now belongs to the `lobnos` Next.js application. The original `primelaboratorysystems` source remains available as a reference; the running application does not import or depend on that folder.

## Routes and boundaries

- `/` is the public website. Marketing pages live in `app/(website)` and share their own header/footer.
- `/facility-login` has a same-origin **Client login** link to `/authentications/login`. The existing full facility username identifies the organization; existing login, role selection, MFA and tenant/session checks still apply.
- `/patient-portal` has a same-origin **Patient login** link to `/patient-access/login`.
- Public facility listings may offer additional approved destinations. They are public opt-in listings, not the private tenant registry. No facility directory entry is required for full-username login.
- Website Analytics moved to `/website/analytics` because `/analytics` is already the protected staff application.
- Website APIs are namespaced under `/api/site/lead`, `/api/site/marketplace/*` and `/api/site/health`. Existing application APIs and backend routes retain their paths.
- Website styles are scoped to `.public-website`; assets live under `/website-assets`. Staff themes, fonts and navigation retain their existing implementation.
- Public HTML receives a fresh CSP nonce and no-store cache headers. Staff routes retain their authorization and no-store checks. Do not apply a Cloudflare Cache Everything rule to login, staff pages, APIs or nonce-bearing HTML. Versioned static assets can be cached normally.

## Deployment configuration

Build and serve `lobnos` as the single frontend for the public domain. Keep the existing backend service and HTTPS configuration. Point the desired website domain to this frontend deployment; no DNS or production deployment was performed by this local change.

Set `NEXT_PUBLIC_SITE_URL` to the canonical public HTTPS origin before building. Configure `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CONTACT_PHONE` for the website's public contact details.

Public catalogue calls default to the origin of the application's existing `PRODUCTION_BASEURL` (or `DEVELOPMENT_BASEURL` locally). If the public marketplace uses a different backend, set both `CORE_PLATFORM_API_URL` and `CORE_PLATFORM_ALLOWED_ORIGIN` to the same approved HTTPS origin. Do not include `/api/v1` in those two overrides. Production plain HTTP remains rejected unless an explicitly permitted loopback backend is being used.

The source website's demo/contact form still uses `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_TOKEN`. Transfer those server-side settings from the current website deployment if already configured. Missing delivery configuration displays a clear unavailable message; it does not falsely claim the enquiry was sent. No synthetic enquiries were sent during testing.

Optional external portal links use `PLS_FACILITY_PORTAL_URL`, `PLS_PATIENT_PORTAL_URL` and `PLS_PORTAL_ALLOWED_HOSTS`. Same-site staff and patient login links work independently of those optional settings. Do not copy secrets into public variables or commit environment files.

## Verification

- Production build completed with strict TypeScript enabled using a separate verification output directory.
- Anonymous HTTP checks: website, facility entry, login, facilities and marketing analytics return 200; CRM and inventory redirect to the application login.
- Browser walkthrough: homepage renders and Client login returns the signed-in user to the existing role workspace.
- Regression suite: manual content and permissions, session replacement handling, cache protection, department access, role navigation, super-admin restrictions, backend origin policy and public catalogue validation.

The standard build remains `pnpm build`; the verification output is not the production deployment directory.
