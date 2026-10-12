# Production Deployment Checklist

Use this checklist for releases of the Lobnos web application and its backend
proxy changes. Do not mark a step complete until it has been verified on the
target environment.

## Before deployment

- [ ] Confirm the release scope, target facility/environment, deploy owner, and
  maintenance window.
- [ ] Review and approve the release diff; confirm no unrelated local changes or
  secrets are included.
- [ ] Configure `PRODUCTION_BASEURL`, `DEVELOPMENT_BASEURL` where needed,
  `PSL_INVEN_ROUTE` where inventory is enabled, and `JWT_SECRET_KEY` in the
  server's environment. Configure the optional `PLS_BACKEND_ACCESS_TOKEN` only
  if the backend deployment requires a service bearer token; ordinary tenant
  requests authenticate using their session credentials. Never put secret values in
  `next.config.js`, `NEXT_PUBLIC_*` variables, source control, or browser code.
- [ ] Rotate credentials that were previously committed or bundled into client
  builds. Provision the replacement backend token through the approved secret
  store and confirm it is available to the running Node.js process.
- [ ] Confirm `.env` is present on the server, ignored by Git, backed up securely,
  and excluded from release artifacts.
- [ ] Run `pnpm install --frozen-lockfile`, `pnpm run test`, and `pnpm run build`
  against the exact release revision.
- [ ] Verify the build contains no backend bearer token and that the API proxy
  strips caller-supplied `Authorization` headers, forwards session credentials,
  and adds a service token only when explicitly configured server-side.
- [ ] Confirm no database migration is required. If the release is paired with a
  backend migration, verify its tested backup and rollback procedure before
  proceeding.
- [ ] Record the currently deployed revision and confirm the previous release
  artifact and secure environment backup are available for rollback.
- [ ] Notify the on-call operator and stakeholders of the deployment window.

## Deployment

- [ ] Deploy to staging or a representative facility first.
- [ ] Install dependencies from the lockfile and run the test suite and
  production build.
- [ ] Start/restart the frontend service and confirm it is healthy. For Windows
  services, use `npm run service:restart:win` and
  `npm run service:status:win`; for the Linux script, use the approved PM2
  process rather than restarting unrelated applications where possible.
- [ ] Smoke-test login, authenticated tenant API reads and writes, file upload
  or download paths, inventory access when enabled, and logout/session expiry.
- [ ] Check frontend and backend service logs for proxy `401`, `500`, or `502`
  responses, missing environment configuration, and unexpected redirects.
- [ ] Verify tenant scoping is preserved on standard API requests and omitted
  only for marketplace routes that derive tenant identity from authentication.
- [ ] Promote to production using the facility's approved rollout procedure.

## After deployment

- [ ] Confirm the running application is serving the intended release revision.
- [ ] Verify login and critical lab workflows with an authorized test account;
  do not use patient data for smoke tests.
- [ ] Monitor service health, API error rates, response times, and logs for at
  least 15 minutes and through one normal workflow cycle.
- [ ] Confirm inventory requests reach the inventory service when enabled.
- [ ] Record the release revision, deploy time, test results, and any follow-up
  work; notify stakeholders when deployment is complete.

## Rollback triggers and steps

Roll back if authentication fails broadly, tenant-scoped requests return data
for the wrong tenant, critical workflows are unavailable, or the API proxy
returns sustained `5xx` errors. Use existing service logs and pre-deploy
baselines; do not invent thresholds during an incident.

- [ ] Stop promotion and notify the incident/on-call owner.
- [ ] Restore the previous application build/revision and restart only the
  affected service.
- [ ] Restore environment configuration only from its secure backup; never
  restore the committed historical `.env` file or a `next.config.js` containing
  embedded credentials.
- [ ] Re-run login, tenant isolation, and critical workflow smoke tests.
- [ ] Preserve logs and record the rollback reason and outcome before resuming
  normal deployment.
