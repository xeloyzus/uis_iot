# NanitesLab — Coming Soon kiosk preview

A Vue 3 + TypeScript + Vite preview for displays while the real NanitesLab sensor network/backend is being deployed.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

A Pages workflow is included at `.github/workflows/deploy.yml`.

1. Push this project to GitHub.
2. Open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow manually.

`vite.config.ts` uses `base: './'`, so assets remain portable on a GitHub Pages project path.

## Adding campus videos

Put MP4 files in [`src/assets/videos/`](src/assets/videos/). They are discovered automatically at build time, shown in the campus media player, and played in filename order. The player advances to the next video when one finishes.

## Moving from preview to live data

The UI currently uses explicit placeholder values and an illustrative chart labeled **DEMO DATA / NOT LIVE**.
Later, replace the local metric/demo arrays in `src/App.vue` with API calls to the FastAPI backend. Keep the UI contract numeric and normalized; payload decoding should stay in the ingestion/backend layer.
