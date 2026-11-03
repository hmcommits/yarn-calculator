# 🧵 YarnCalc Pro • Textile Yarn Count Converter

A lightweight, modern, mobile-first **Progressive Web App (PWA)** for calculating and converting yarn count numbering systems. Designed for textile engineers, spinning lab technicians, quality checkers, weavers, and fashion designers.

Built according to direct textile industry count formulas:
- **Weight of yarn in grams:** $g$
- **Length of yarn in meters:** $L$
- **Tex:** $\text{Tex} = \left(\frac{g}{L}\right) \times 1000$
- **English Count (Cotton $N_e$):** $\text{eng} = \frac{590.5}{\text{Tex}}$
- **Denier ($D$):** $\text{Denier} = \frac{5315}{\text{eng}}$
- **Metric Count ($N_m$):** $\text{Metric} = \frac{\text{eng}}{0.59}$

---

## ✨ Key Features

- **📱 Mobile-First Ergonomics:** Large finger-friendly touch targets, numeric keypads, tactile micro-feedback (Web Audio clicks + haptic vibration).
- **⚡ Instant Real-Time Calculation:** Results update immediately as you type without needing to tap "Calculate".
- **💾 Progressive Web App (PWA):**
  - Installable like a native app on Android, iOS (Safari "Add to Home Screen"), and Desktop (Chrome / Edge).
  - 100% offline functionality via `sw.js` (Service Worker caching).
  - Web App Manifest with high-resolution icons (192px, 512px, SVG vector, apple-touch-icon).
- **🎨 Modern Glassmorphic Textile UI:**
  - 4 High-impact glowing result cards (Tex, English Ne, Denier, Metric Nm).
  - One-tap copy buttons on each card with instant visual confirmation.
  - Interactive Yarn Classification Gauge (Microfiber, Fine Count, Medium Apparel, Heavy Denim, Carpet/Cordage).
- **🧪 Lab Presets:** One-tap presets for 100m Wrap Reel, 120-yd Lea test (109.73m), 150D Filament, 10s Denim, and 10m Micro test.
- **🔄 Reverse Calculator:** Switch tabs to calculate the required weight given a target yarn count and package length.
- **📜 Calculation History & CSV Export:** Automatically stores test logs in `localStorage`. One-tap to reload past inputs, export to `.csv` spreadsheet, or clear.
- **📤 Share & Copy Report:** One-click WhatsApp-ready text summary report with timestamps, inputs, counts, and classification.
- **🌓 Dark / Light Mode:** High-contrast OLED dark mode and clean studio light mode.
- **🎯 Precision Control:** Switch between 2 decimals (standard), 3 decimals, 4 decimals, or exact numbers.

---

## 🚀 Quick Start

### Option 1: Run with Node.js
```bash
npm start
# or
node server.js
```
Open your browser at `http://localhost:3000`.

### Option 2: Run with Python
```bash
python -m http.server 3000
```
Open `http://localhost:3000`.

### Option 3: Direct File
You can also open `index.html` directly in any web browser. *(Note: Service Worker and PWA install prompt require HTTP/HTTPS or localhost).*

---

## 📐 Formulas Reference

| System | Symbol | Type | Definition | Formula |
| :--- | :--- | :--- | :--- | :--- |
| **Tex** | tex | Direct | Weight in grams of 1,000 meters of yarn | $\text{Tex} = \left(\frac{g}{L}\right) \times 1000$ |
| **English Count** | $N_e$ / NeC | Indirect | Number of 840-yard hanks weighing 1 lb | $\text{eng} = \frac{590.5}{\text{Tex}}$ |
| **Denier** | Den / D | Direct | Weight in grams of 9,000 meters of yarn | $\text{Denier} = \frac{5315}{\text{eng}}$ |
| **Metric Count** | $N_m$ | Indirect | Meters of yarn weighing 1 gram | $\text{Metric} = \frac{\text{eng}}{0.59}$ |

> **Note on Direct vs Indirect Systems:**
> - In **Direct systems** (Tex, Denier): The length is fixed, weight varies. A higher number indicates a **thicker/heavier** yarn.
> - In **Indirect systems** (English Ne, Metric Nm): The weight is fixed, length varies. A higher number indicates a **finer/thinner** yarn.

---

## 🌐 Where & How to Deploy (Free & Instant HTTPS)

Because **YarnCalc Pro** is a Progressive Web App (PWA), it requires **HTTPS** for mobile devices to install it to the home screen and enable offline mode. All of the options below provide **free automatic HTTPS** and take under 2 minutes:

### 🌟 Option 1: Netlify Drop (Easiest — No Git or Terminal Needed)
1. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the `yarn-calculator` folder into the upload box on the webpage.
3. Your web app is immediately live with a free secure HTTPS link (e.g. `https://yarn-calculator-xyz.netlify.app`)!

---

### 🌟 Option 2: GitHub Pages (Free Forever)
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of YarnCalc Pro PWA"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
4. On GitHub, go to **Settings** > **Pages** > Under "Branch", select `main` and `/ (root)` > Click **Save**.
5. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

---

### 🌟 Option 3: Vercel (1-Command Deploy)
Run from the project folder:
```bash
npx vercel
```
Follow the prompts (defaults are fine). It will deploy your site in ~15 seconds and give you a production HTTPS URL.

---

### 🌟 Option 4: Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Upload assets**.
3. Upload the `yarn-calculator` directory.
4. Instant deployment with unlimited global bandwidth.

---

## 📁 Project Structure

```
yarn-calculator/
├── index.html           # Responsive HTML5 PWA container with accessibility
├── manifest.json        # Web App Manifest for standalone installation
├── sw.js                # Offline Service Worker cache engine
├── server.js            # Zero-dependency local Node server
├── package.json         # Scripts and project metadata
├── css/
│   └── styles.css       # Mobile-first CSS design tokens, glassmorphism, responsive grid
├── js/
│   ├── app.js           # UI logic, tactile sound, history, sharing, and event bindings
│   ├── calculator.js    # Strict calculation engine & classifications
│   └── pwa.js           # PWA registration, lifecycle, and install banner prompts
├── icons/
│   ├── icon.svg         # High-resolution vector icon
│   ├── icon-192.png     # Android & Chrome 192x192 PNG
│   ├── icon-512.png     # Splash screen 512x512 PNG
│   ├── apple-touch-icon.png # iOS Home screen icon
│   └── favicon-32.png   # Browser favicon
└── test_calculator.js   # Automated unit test suite
```
