### GitLab Live Relative Time (Firefox/Chrome)

GitLab renders relative timestamps ("just now", "3 hours ago") once and never updates them, so a comment posted hours ago still says "just now" if the tab stayed open. This extension rewrites them from the real timestamp so they stay accurate.

### How it works

- Every GitLab relative timestamp is a `<time datetime="...">` element. The `datetime` attribute holds the exact time, the same one the hover tooltip shows.
- Every 5 seconds (only while the tab is visible), and whenever the page changes, the extension recomputes each one and rewrites only the relative phrase.
- Wording, units, and rounding match GitLab's own (timeago.js steps): "just now", "13 seconds ago", "1 minute ago", "3 hours ago", "2 weeks ago", "in 2 days".
- It edits GitLab's existing text node in place, so Vue keeps ownership of the node. If Vue resets the text, the `MutationObserver` corrects it on the next frame.
- Absolute dates and non-English text are left alone. Only English relative phrases are rewritten.

### Install for development

**Firefox / Zen:** open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and pick this folder's `manifest.json`. Temporary add-ons are removed on restart; sign it for a permanent install (below).

**Chrome:** open `chrome://extensions`, turn on Developer mode, click "Load unpacked", and pick this folder. Chrome warns about the Firefox-only `browser_specific_settings` key; ignore it.

### Permanent install in Firefox / Zen (sign with AMO)

Zen ignores `xpinstall.signatures.required`, so signing is the only way to keep it across restarts. Unlisted signing is free and publishes nothing.

1. Get API credentials at <https://addons.mozilla.org/developers/addon/api/key/>.
2. `npm install`
3. `WEB_EXT_API_KEY="<jwt issuer>" WEB_EXT_API_SECRET="<jwt secret>" npm run sign` (bump `version` in `manifest.json` and `package.json` first if this version was already signed).
4. `about:addons` → gear icon → "Install Add-on From File…" → pick `web-ext-artifacts/*.xpi`.

### Scripts

```bash
npm test        # formatter unit tests (node:test)
npm run lint    # web-ext lint
npm run build   # unsigned zip in web-ext-artifacts/
npm run start   # temporary Firefox profile with the extension loaded
```

### Self-hosted GitLab

The content script runs only on `https://gitlab.com/*`. Add your instance's origin to `content_scripts[].matches` in `manifest.json`.
