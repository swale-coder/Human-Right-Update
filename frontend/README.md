# Human Right Protection Council of Gujarat — Website (React)

A React + Vite version of the MVP website, built from the same design system as the
static HTML version.

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This outputs a static, deployable site into the `dist/` folder, which you can host on
Netlify, Vercel, GitHub Pages, or any static host.

## Project structure

```
src/
  components/
    Header.jsx     – top navigation + logo
    Hero.jsx        – headline + registration seal panel
    Mandate.jsx     – "sewa / suraksha / sangathan" pillars
    Services.jsx    – four areas of work
    About.jsx       – registration credentials
    Involve.jsx     – internship/volunteer form (demo only)
    Footer.jsx       – contact details
  App.jsx           – assembles all sections
  main.jsx          – React entry point
  index.css         – global design system (colors, type, layout)
  logo.jpg          – Council seal/logo
```

## Notes

- The "Submit request" form in `Involve.jsx` is currently a **demo only** — it logs to
  the browser console and shows a confirmation state, but is not wired to a real email
  service or backend. To make it live, connect the `handleSubmit` function to an API
  endpoint (e.g. Formspree, a serverless function, or your own backend).
- All organisation details (registration numbers, address, contact) were taken directly
  from the Council's internship confirmation letter — double-check them against your
  official records before publishing live.
