# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- `artifacts/api-server` — Express 5 API
- `artifacts/mafia-x` — Expo/React Native mobile app ("Mafia X" — Georgian mafia social game with multilingual UI: ka/en/ru/uk)
- `artifacts/mockup-sandbox` — UI mockup canvas

## Mafia X notes

- AsyncStorage-backed users, sessions, balances, rooms (no backend yet).
- Pages: `/` login (with language picker), `/register`, `/rooms` (list + create), `/lobby` (11-seat camera grid + chat + host moderation + drag-swap), `/shop` (X coin packs + SALE badge), `/profile` (avatar upload, 800×800 JPEG via expo-image-manipulator stored as base64 in AsyncStorage on the user record).
- i18n in `lib/i18n.ts` + `contexts/LanguageContext.tsx`. Default lang: ka. Switcher in login top-left and persistable across sessions (`@mafia-x/lang`).
- Avatar tap inside `ProfilePanel` → navigates to `/profile`.
- Lobby: long-press an occupied seat to arm swap → tap any other seat to swap occupants. "+ Add player" demo button in chat header fills next empty seat. When all 11 seats are occupied, a translucent green "get redy ! ! !" watermark renders behind the chat list.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo Router, expo-camera, expo-image-picker, expo-image-manipulator, expo-image, AsyncStorage

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/mafia-x run typecheck` — typecheck mobile app
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
