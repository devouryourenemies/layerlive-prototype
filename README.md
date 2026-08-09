# LayerLive: Multiplayer Design Studio Prototype

Static-first website prototype for a realtime collaborative design product, inspired by the old Ice Scribble idea but positioned as a pro creative workflow tool.

## What this version includes

- Landing page with product story and positioning
- Interactive browser drawing canvas with HiDPI support
- Simulated teammate cursors and room presence
- Tool palette: brush, eraser, color, size, undo, clear, PNG export
- Keyboard shortcuts: B (brush), E (eraser), Ctrl/Cmd+Z (undo)
- Team/chat/layers UI mock
- Competitor positioning matrix
- Roadmap for going from static prototype to realtime MVP
- Skip-to-content link, aria-labels, focus-visible, and reduced-motion support
- Open Graph meta tags for social sharing
- SVG favicon
- Mobile responsive with touch support
- Print styles

## Why this can run on GitHub Pages

This version is plain HTML, CSS, and JavaScript. There is no build step and no server runtime. GitHub Pages can host it directly from the repo root.

## Local preview

```bash
cd /Users/Vancito/Documents/collab-canvas-mvp
python3 -m http.server 4173
```

Then open: http://127.0.0.1:4173/

## Live deployment

- **GitHub Pages:** https://devouryourenemies.github.io/layerlive-prototype/
- **Source:** https://github.com/devouryourenemies/layerlive-prototype

## Realtime roadmap

Static GitHub Pages can host the frontend, but realtime collaboration needs an external realtime service. Best options:

- Yjs + y-websocket on a small VPS or Fly.io
- Yjs + Supabase Realtime
- Yjs + Firebase
- Yjs + Ably or Liveblocks for faster production launch

## Product thesis

Figma dominates collaborative UI design. Canva dominates templates. Miro dominates whiteboarding. Photopea brings Photoshop-like editing to the browser. The open lane is collaborative raster production: image editing, drawing, layers, comments, version history, references, and handoff in a shared creative room.
