# GitHub Pages Deployment Notes

## Fastest path

This project is static. No npm install, no build, no backend.

```bash
cd /Users/Vancito/Documents/collab-canvas-mvp
git init
git add -A
git commit -m "Initial LayerLive static prototype"
```

Create the GitHub repo:

```bash
gh repo create layerlive-prototype --public --source . --push
```

If `gh` is unavailable, create the repo in the GitHub UI, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/layerlive-prototype.git
git branch -M main
git push -u origin main
```

Then enable Pages:

GitHub repo → Settings → Pages → Source: Deploy from branch → Branch: main → Folder: / root → Save.

## Why there is a .nojekyll file

GitHub Pages runs Jekyll by default. `.nojekyll` disables that behavior so all static files are served exactly as committed.

## What is not included yet

- Real multi-user sync
- Login/accounts
- Persistent cloud rooms
- File storage
- PSD import/export
- Payment/waitlist backend

## Recommended next technical step

Build the realtime MVP as a Vite app with:

- `yjs` for collaborative document state
- `perfect-freehand` or `fabric.js` for better vector stroke primitives
- `supabase` for auth, rooms, persistence, and waitlist
- `liveblocks` or `ably` if speed to production matters more than owning infra

GitHub Pages can still host the frontend if the realtime API is external.
