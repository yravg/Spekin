# App click paths, one file per board

The state gate (`npm run harness`) reads every `*.json` here. One file per board, owned by whoever owns that board's task card, so two agents never edit the same file.

```json
{
  "board": "S35-project-shell.dc.html",
  "states": {
    "backend": { "status": "checked", "steps": [{ "goto": "/" }, { "click": "[data-stage=\"backend\"]" }, { "wait": "[data-stage=\"backend\"][aria-current=\"page\"]" }] }
  }
}
```

Rules (canvas-to-app rule 16; Clausarium lessons):
- Click paths that reach each board state in the running app (canvas-to-app rule 16). One entry per board state in canvas-states.json.
- Steps: {"goto": "/path"} only as the FIRST step (the start page); then {"click": "<css>"}, {"dblclick": "<css>"}, {"press": "Key"}, {"type": ["<css>", "text"]}, {"hover": "<css>"}, {"wait": "<css>"}. End every path with a wait for something only that state shows, so the capture never races the render.
- No URL shortcuts after the first step: a state reached by goto alone does not count (Clausarium lesson: drafted paths were wrong until tried in the app).
- status: "draft" = written from the board Entry text, not yet tried; "checked" = the harness reached it in the app and a person saw the screenshot.
- Selectors: prefer data-stage, data-feature, aria-label, role and visible text (text=Backend). Never a CSS class that only the board has.
- A state counts only when `status` is `checked`: the harness reached it in the app and a person (or a second agent) looked at the three PNGs in tools/harness/out.
- When the start page changes (S27 Projects home replaces the redirect), every path's first steps change with it. The S27 card owner updates all files in one commit.
