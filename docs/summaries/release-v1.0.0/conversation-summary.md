# USMS – Conversation Summary (Auth, Structure, Login UI)

## 1. Project & Architecture Decisions

- **Single app, role-based**
  - Use a **single Next.js App Router app** with route groups for different surfaces:
    - `(auth)` for login flows.
    - `(dashboard)` for staff/admin/teacher areas.
    - `(scanner)` for SEMS scanning.
    - `(parent)` for parent portal.
  - Root path `/` currently redirects to `/login`.

- **High-level folder structure**
  - `src/core/` – cross-cutting concerns (config, db, auth, http, errors, logger, offline, types).
  - `src/modules/` – domain modules per project phase:
    - `sis`, `sems`, `academics`, `exams`, `finance`, `hr`, `transport`, `library`, `communication`.
    - Each module structured as `domain/`, `application/`, `infrastructure/`, `ui/`.
  - `src/shared/` – reusable UI and utilities:
    - `components/{ui,layout,data-display,feedback,forms}`, `hooks/`.
  - `src/app/roadmap/page.tsx` – moved the original USMS Modules Roadmap page here.
  - `src/app/page.tsx` – now a simple redirect to `/login`.

## 2. Auth & Login System Design

- **Documentation**
  - Created `docs/AUTH_LOGIN_SYSTEM.md` describing the full auth/login design for the Unified School Management System.

- **Key elements**
  - Supabase Auth for email/password and sessions.
  - Two Supabase clients:
    - Browser client in `core/db/supabase-client.browser.ts`.
    - Admin/server client in `core/db/supabase-client.admin.ts`.
  - Client-side abstractions:
    - `AuthService` for `login`, `logout`, `getCurrentUser`, role helpers.
    - `SessionService` for session lifecycle and activity tracking.
    - `AuthContext` + `useAuth` for React state and role-aware helpers.
  - API routes (to be implemented):
    - `POST /api/auth/login` – validate credentials, set HTTP-only cookies (`auth-token`, `user-id`, `user-roles`, optional `school-id`).
    - `POST /api/auth/logout` – clear cookies.
    - `GET /api/auth/session` – validate token and return canonical `AuthUser`.
  - API auth helpers in `core/auth/api-auth.ts`:
    - `getAuthenticatedUser`, `requireAuth`, `requireRole` + role-specific guards.
  - Route protection via `middleware.ts` + `core/auth/routeAccess.ts`:
    - Configurable route → allowed roles mapping.
    - Default routes per role (e.g. admin → `/dashboard/admin`, scanner → `/scanner`, parent → `/parent`).

- **Roles**
  - Core roles defined as **arrays** on `AuthUser`:
    - `SUPER_ADMIN`, `ADMIN`, `SCANNER`, `TEACHER`, `STAFF`, `PARENT`.

## 3. Login UI Design

- **Location**
  - Layout: `src/app/(auth)/layout.tsx`.
  - Page: `src/app/(auth)/login/page.tsx`.

- **Visual design**
  - Based on the **SSC logo** color scheme:
    - Primary deep green (`#1B4D3E`) for headings and primary button.
    - Academic gold (`#F4B400`) for card top border and focus highlights.
    - Soft mint background (`#f0fdf4`) for the auth layout.
  - Centered card with:
    - School logo image (`/basic-ed-logo.png`).
    - Heading: "Welcome Back".
    - Subheading: "Unified School Management System".
  - Form fields:
    - Email/Username field with `User` icon.
    - Password field with `Lock` icon and show/hide toggle (`Eye` / `EyeOff`).
    - Sign-in button with loading spinner (UI only; no auth wired yet).

- **Copy & messaging**
  - Restricted access notice:
    - "Access is restricted to authorized staff and parents. Contact the Super Admin for account issues."
  - Footer text:
    - "© {current year} Green Valley College Foundation Inc. All rights reserved."

## 4. Branding & Meta Updates

- **Tab titles**
  - Global metadata in `src/app/layout.tsx`:
    - `title: "GVCFI-SSC"`.
    - `description: "Green Valley College Foundation Inc. – Supreme Student Council Systems"`.
  - Auth layout metadata in `src/app/(auth)/layout.tsx`:
    - `title: "Login | GVCFI-SSC"`.
    - Description mentioning Green Valley College Foundation Inc.

- **Logo usage**
  - Login page uses `public/basic-ed-logo.png` as the header logo.

- **Favicon / tab icon**
  - Metadata `icons.icon` set to `"/gvcfi.ico"`.
  - `public/gvcfi.ico` copied to `src/app/favicon.ico` so that the Next.js default favicon is replaced.

## 5. Current State & Next Steps

- **Current state**
  - Project has a **domain-driven folder structure** and **auth design spec** documented.
  - Login page UI is implemented visually and set as the default entry point via `/` → `/login` redirect.
  - Branding (titles, logo, favicon, footer school name) uses **GVCFI-SSC / Green Valley College Foundation Inc.**.

- **Recommended next steps**
  - Implement Supabase client utilities in `core/db`.
  - Implement auth services and context (`AuthService`, `SessionService`, `AuthContext`, `useAuth`).
  - Implement `/api/auth/login`, `/api/auth/logout`, `/api/auth/session` according to `AUTH_LOGIN_SYSTEM.md`.
  - Add `middleware.ts` + `routeAccess` config for role-based route protection.
  - Start with a vertical slice (e.g. SEMS event creation + scanner sync) using the new `modules/` structure.
