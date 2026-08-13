# mark-ui

Admin UI for uploading logos and icons to [mark-api](https://github.com/ArminDashti/mark-api). Vue 3, Tailwind, Inter, and Shadcn-style components. Installable PWA.

Version: **1.0.0**

## Local run

```bash
npm install
npm run dev
```

- UI: `http://127.0.0.1:5180`
- Proxies `/api` and `/m` to `http://127.0.0.1:8130`
- Default login: `armin` / `dopadopa123`

## Pages

| Path | Purpose |
|------|---------|
| `/login` | Sign in |
| `/logos` | Upload and manage logos |
| `/icons` | Upload and manage icons |
| `/about-me` | About Armin Dashti |

Public image URL copied from a card: `/m/{kind}/{slug}?size=128`.
