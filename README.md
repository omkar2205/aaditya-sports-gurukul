# Sports Gurukul

Customer-facing sports coaching and coach matching website.

## Public pages

- `index.html` contains the shorter homepage.
- `find-coach.html` contains the full athlete profile and coach matching flow.
- `platform.html` contains the athlete dashboard, mobile recording and match previews.
- `about.html` contains separate profiles and portrait areas for Aaditya Ghosalkar and Aliza Khatri.
- `contact.html` contains placeholder contact details and the enquiry form.

## Founder photographs

Upload the two founder photographs into `assets/founders` using these exact filenames:

- `aaditya-ghosalkar.jpg`
- `aliza-khatri.jpg`

Both portrait areas use a 4:5 aspect ratio. A recommended image size is 1200 x 1500 pixels. The About page shows a placeholder until the matching JPG is uploaded.

## Website files

- `styles.css` imports the shared CSS modules and contains the separate founder card layout.
- `base.css` contains shared layout, navigation, hero, footer and component styles.
- `sections.css` contains homepage and secondary page sections.
- `forms.css` contains coach matching and contact form styles.
- `responsive.css` contains tablet and mobile layouts.
- `script.js` contains shared navigation, counters, media controls, animations and placeholder contact behaviour.
- `find-coach.js` contains the athlete profile, coach matching and lead logging behaviour.
- `chatbot.js` and `chatbot.css` contain the KhelSaathi interface and Apps Script connection.
- `assets/logo.svg` is the current Sports Gurukul logo.
- `apps-script/Code.gs` is the Google Apps Script backend for Groq, diagnostics, conversations and leads.
- `.github/workflows/deploy-pages.yml` publishes the site and the complete assets folder to GitHub Pages.

## KhelSaathi backend

The Apps Script deployment URL is configured in `chatbot.js` and `find-coach.js`.
The Groq key must remain in Apps Script Properties as `GROQ_API_KEY`.

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
