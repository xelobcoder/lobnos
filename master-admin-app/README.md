# Master Admin App

Standalone admin workspace for managing master test panels and field rules.

## Features

- Manage master test panels (create, edit, delete)
- Manage master field rules for each test
- Bulk delete with explicit confirmation phrase
- API proxy routes that connect to master backend only

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `MASTER_API_BASE_URL` and `MASTER_API_TOKEN` if required
3. Install dependencies:

```bash
npm install
```

4. Run the app:

```bash
npm run dev
```

App runs on port 2388.

## Notes

- This app is intentionally separate from tenant/client LIMS app.
- Tenant app should treat master list as read-only consumption.
