# MO Marketplace Web

Frontend application for a marketplace product catalog with authentication, product management, variants, and quick-buy flows.

## Live URLs

- Frontend deployment: `https://mo-marketplace-2n64b2zgx-shimaras-projects.vercel.app`
- Frontend domain: `https://mo-marketplace-web-two.vercel.app`
- Backend API: `https://mo-marketplace-api-production.up.railway.app`
- Backend Swagger: `https://mo-marketplace-api-production.up.railway.app/api`

## Stack

- Next.js App Router
- React 18
- TypeScript
- Tailwind CSS
- Zustand for auth state
- Axios for API communication
- Zod + React Hook Form for validation and forms
- `react-hot-toast` for notifications
- `lucide-react` for icons

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment file

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=https://mo-marketplace-api-production.up.railway.app
API_URL=https://mo-marketplace-api-production.up.railway.app
```

Notes:

- `NEXT_PUBLIC_API_URL` is used by client-side requests and as a fallback base URL.
- `API_URL` is used by Next.js route handlers for server-side proxying.

### 3. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### 4. Validate before shipping

```bash
npm run lint
npm run build
```

## Available Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Features

- Public product catalog
- Public product detail page
- User registration and login
- Protected product creation
- Protected product update and delete
- Protected variant add, update, and delete
- Quick buy action for a selected variant
- Product image selection from the browser file picker
- Custom `react-hot-toast` notifications for success, delete, and error states
- Next.js route handlers under `/api/...` for browser-facing requests

## Project Structure

```text
src/
  app/
    (auth)/           auth pages
    api/              Next.js route handlers for backend endpoints
    products/         product listing, detail, and create pages
  components/
    auth/             auth UI and guards
    layout/           shared layout components
    products/         catalog, detail, create, and variant UI
  lib/
    api.ts            axios clients and API helpers
    notify.tsx        shared react-hot-toast renderers
    proxy.ts          upstream proxy helper for route handlers
    products.ts       product presentation helpers
    validations.ts    zod schemas
  store/
    authStore.ts      persisted auth state
  types/
    index.ts          shared API types
```

## Backend API Surface Used

Products:

- `GET /products`
- `POST /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /products/{id}/variants`
- `PUT /products/{id}/variants/{variantId}`
- `DELETE /products/{id}/variants/{variantId}`
- `POST /products/{id}/quick-buy`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Reference:

- Swagger UI: `https://mo-marketplace-api-production.up.railway.app/api`

## Assumptions

- The Railway backend above is the source of truth for request and response contracts.
- Product reads can be public, while create/update/delete flows depend on JWT auth.
- Variant creation accepts `attributes`, `price`, `stock`, and optional `sku`.
- Variant update only supports `price`, `stock`, and optional `sku`.
- The app stores auth state in browser storage using Zustand.
- Image selection currently submits image data through the existing `imageUrl` field.

## Known Limitations

- Auth is stored client-side rather than using secure httpOnly cookies.
- There are no automated tests yet for auth, product flows, or route handlers.
- Browser-selected product images are sent as string data in `imageUrl`; this is practical for demo use but not ideal for large files or production media handling.

