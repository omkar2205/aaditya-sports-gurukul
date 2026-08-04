# Sports Gurukul

Customer-facing coach matching website for Sports Gurukul.

## Website files

- `index.html` contains the page structure and KhelSaathi chat interface.
- `styles.css` contains the responsive website and chatbot styling.
- `script.js` contains coach matching, counters, KhelSaathi frontend behaviour and the backend URL setting.
- `assets/logo.svg` is the current replaceable logo asset.
- `apps-script/Code.gs` is the Google Apps Script backend for Groq, conversation logging and lead capture.
- `.github/workflows/deploy-pages.yml` publishes the website to GitHub Pages.

## KhelSaathi backend setup

1. Open the Google Sheet named `Sports Gurukul - KhelSaathi Backend`.
2. Open **Extensions > Apps Script**.
3. Replace `Code.gs` with the complete code from `apps-script/Code.gs`.
4. Open **Project Settings > Script Properties**.
5. Add a property named `GROQ_API_KEY` and paste the Groq API key as its value.
6. Deploy the Apps Script as a Web App.
7. Set **Execute as** to yourself and access to **Anyone**.
8. Copy the `/exec` deployment URL.
9. Paste that URL into `KHELSAATHI_API_URL` at the top of `script.js`.

The spreadsheet ID is already configured in `apps-script/Code.gs`.

## Current sheets

- `Setup`
- `AI_Config`
- `Leads`
- `Coach_Directory`
- `Conversations`
- `Knowledge_Base`
- `Reviews`

## Membership plans

- Explorer: Free
- Progress: ₹499/month
- Performance: ₹1,999/month
