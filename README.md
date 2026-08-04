# Sports Gurukul

Customer-facing sports coaching, athlete development and coach matching website.

## Website files

- `index.html` contains the complete page structure, coach form, reviews, About, Contact and KhelSaathi interface.
- `styles.css` loads the modular responsive design files.
- `base.css`, `sections.css`, `forms.css` and `responsive.css` contain the website styling.
- `script.js` contains navigation, video controls, counters, scroll interactions and coach matching.
- `chatbot.css` and `chatbot.js` contain the standalone KhelSaathi interface and connection.
- `assets/logo.svg` is the current logo asset.
- `apps-script/Code.gs` is the Google Apps Script backend for Groq, diagnostics, conversation logging and lead capture.
- `.github/workflows/deploy-pages.yml` publishes the website to GitHub Pages.

## Media

The website uses remotely hosted stock media from Pexels and Unsplash. Replace the remote URLs in `index.html` when final brand photography and video are available.

## KhelSaathi backend setup

1. Open the Google Sheet named `Sports Gurukul - KhelSaathi Backend`.
2. Open **Extensions > Apps Script**.
3. Replace the complete contents of `Code.gs` with `apps-script/Code.gs` from this repository.
4. Confirm `GROQ_API_KEY` exists in Apps Script Project Settings.
5. Deploy a new version of the existing Web App.

## Current sheets

- `Setup`
- `AI_Config`
- `Leads`
- `Coach_Directory`
- `Conversations`
- `Knowledge_Base`
- `Reviews`
- `Diagnostics`

## Membership plans

- Explorer: Free
- Progress: ₹499/month
- Performance: ₹1,999/month
