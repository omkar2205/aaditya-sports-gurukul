# Sports Gurukul

Customer-facing coach matching website for Sports Gurukul.

## Website files

- `index.html` contains the page structure and KhelSaathi chat interface.
- `styles.css` contains the responsive website and chatbot styling.
- `script.js` contains the original website and chatbot behaviour.
- `khelsaathi-connect.js` handles backend health checks, cross-origin fallback transport and visible connection status.
- `assets/logo.svg` is the current logo asset.
- `apps-script/Code.gs` is the Google Apps Script backend for Groq, diagnostics, conversation logging and lead capture.
- `.github/workflows/deploy-pages.yml` publishes the website to GitHub Pages.

## KhelSaathi backend setup

1. Open the Google Sheet named `Sports Gurukul - KhelSaathi Backend`.
2. Open **Extensions > Apps Script**.
3. Replace the complete contents of `Code.gs` with `apps-script/Code.gs` from this repository.
4. Open **Project Settings > Script Properties**.
5. Confirm that `GROQ_API_KEY` exists and contains the Groq API key.
6. Run `testKhelSaathiSetup` once from the Apps Script editor and approve the requested permissions.
7. Open **Deploy > Manage deployments**.
8. Edit the existing Web App deployment.
9. Select **New version** and deploy it again.
10. Keep **Execute as** set to yourself and access set to **Anyone**.

Saving `Code.gs` alone does not update an existing versioned Web App deployment. A new deployment version is required.

## Diagnostics

The backend supports:

- `?action=health` to check the spreadsheet, configuration and API-key presence.
- `?action=diagnostics` to also run a small Groq completion test.
- `testKhelSaathiSetup()` to test the complete setup from the Apps Script editor.
- `testGroqConnection()` to test only the Groq connection.

Results and errors are written to the `Diagnostics` sheet with a request ID, backend version and response time.

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
