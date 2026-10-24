# Legacy site

The hand-written site that was live before the redesign (`index.html`,
`css/`, `js/`) and its tests, moved here unchanged in phase 1 of
`REDESIGN.md`. It stays for reference until phase 6, then it is deleted.

- Its images moved to `public/assets/`, so the `assets/...` paths in
  `index.html` no longer resolve from this folder. To see the old site as
  it was, check out `main`, which still has it at the root.
- The tests here (`tests/`, `playwright.config.js`, `lighthouserc.json`)
  are no longer run by CI.
- The design prototypes read their content from `index.html` here
  (`design-explorations/_scripts/extract.mjs`).
