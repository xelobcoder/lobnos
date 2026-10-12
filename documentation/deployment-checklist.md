# Production Deployment Checklist

Use this checklist for releases of the PLS web application and its backend
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

## Optional Office-inspired ribbon layout

The fourth workspace layout is `ribbon`. Classic, Zoho Books-inspired, and
Claude-inspired layouts remain available; nothing changes until an authorized
facility administrator saves the new choice.

- [ ] Deploy the companion `lobnos-server` changes first. The backend accepts
  `ribbon` through the existing authenticated, owner-only
  `PATCH /api/v1/applicationsettings/workspace-layout` endpoint.
- [ ] Back up tenant settings and run the normal tenant bootstrap/migration
  process. `20261012_workspace_ribbon` widens an existing MySQL
  `applicationsettings.workspaceLayout` enum without resetting saved layouts.
  New tenants receive all four values from the initial layout migration.
  Repeated bootstrap skips schemas that already support `ribbon`.
- [ ] In Settings > Application settings > Facility Workspace Layout, choose
  **Office-inspired ribbon** and Save. This is a facility-wide setting, not a
  browser-only preview. Confirm it survives sign-out/sign-in and refresh.
- [ ] Verify an administrator, scientist, and any other deployed role see only
  their existing authorized section links and enabled modules. Super-admin
  navigation retains the platform hierarchy.
- [ ] Check tab switching (it changes commands, not the open page), nested
  command groups, command links, direct detail URLs, browser back/forward,
  ribbon collapse, small screens, light/dark mode, and print. Confirm the
  ribbon layout has no sidebar or sidebar toggles.

Ribbon tabs come from the current section's sidebar groups. Standalone sidebar
links appear under Workspace; nested groups become labeled command groups.
All applications continues to switch modules using existing role links.
The ribbon layout is sidebar-free: navigation hierarchy is represented by
tabs and labeled command groups, leaving the workspace full width. The other
three layouts retain their existing sidebars.
Commands use existing routes and never perform alternate clinical, payment,
inventory, or result-authorization operations. Selecting a tab or collapsing
the ribbon does not remount the page. Actual route navigation retains the
application's existing unsaved-work safeguards; no new global dirty-form
detector or record-specific actions are introduced.

The ribbon uses theme tokens, keyboard-operable tabs (Left/Right, Home/End),
a skip-to-workspace link, and breadcrumbs
derived from the closest configured route. It introduces no stored patient or
record context. Tab selection and ribbon collapse are transient UI state;
the chosen facility layout is persisted by the existing settings endpoint.
Tabs and command groups scroll within the ribbon on small screens, and the
entire command strip can be collapsed to reclaim workspace height.
The ribbon follows Word-style command placement: 32px icons above centered,
wrapping labels in a single command row, with group captions below and vertical
separators between groups. Segoe UI is scoped to this layout (including its
form controls), with Arial as the non-Windows fallback. The command surface
uses the theme's body background; tabs and workspace use its soft neutral
tertiary background. Dark mode uses the same semantic tokens. Existing layouts
keep their own typography and backgrounds.

To restore the previous interface, save Classic (or the previous layout).
If rolling back the database migration, its `down` step first converts only
`ribbon` selections to `classic` before narrowing the enum. MySQL DDL is not
transactional: use the approved maintenance window and backup procedure.
Do not roll back the original migration, which drops the layout column.

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
