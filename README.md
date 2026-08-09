# LayerLive: Multiplayer Design Studio Prototype

Static-first website prototype for a realtime collaborative design product, inspired by the old Ice Scribble idea but positioned as a pro creative workflow tool.

## What this version includes

- Landing page for the product concept
- Interactive browser drawing canvas
- Simulated teammate cursors and room presence
- Tool palette: brush, eraser, color, size, undo, clear, PNG export
- Team/chat/layers UI mock
- Competitor positioning matrix
- Roadmap for going from static prototype to realtime MVP

## Why this can run on GitHub Pages

This version is plain HTML, CSS, and JavaScript. There is no build step and no server runtime. GitHub Pages can host it directly from the repo root.

## Local preview

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## GitHub Pages deployment

1. Create a public GitHub repo.
2. Push these files to the repo root.
3. In GitHub: Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. Live URL will be:

```text
https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME/
```

## Realtime roadmap

Static GitHub Pages can host the frontend, but realtime collaboration needs an external realtime service. Best options:

- Yjs + y-websocket on a small VPS or Fly.io
- Yjs + Supabase Realtime
- Yjs + Firebase
- Yjs + Ably or Liveblocks for faster production launch

## Product thesis

Figma dominates collaborative UI design. Canva dominates templates. Miro dominates whiteboarding. Photopea brings Photoshop-like editing to the browser. The open lane is collaborative raster production: image editing, drawing, layers, comments, version history, references, and handoff in a shared creative room.
