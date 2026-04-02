# EDITH Frontend (minimal)

This is a tiny React + Vite frontend meant for demoing EDITH.

Quick start (from the `frontend/` directory):

```bash
# install deps
npm install

# start dev server
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Configuration:
- Backend base URL is configurable. You can set it in the browser console before the app loads:

```js
window.EDITH_API_BASE = 'http://127.0.0.1:8000'
```

Or set `VITE_API_BASE` in your environment and reference it in code if you adopt an env-based build.

Notes:
- Tailwind is included via CDN in `index.html` for simplicity.
- If you want a production-ready build with Tailwind processing, add PostCSS/Tailwind build steps.
