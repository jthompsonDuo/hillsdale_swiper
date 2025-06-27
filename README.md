# Website Swiper

A Tinder-like interface for swiping on websites with Google Sheets integration.

## Features

- 🃏 **Card-based Interface**: Swipe through websites like Tinder
- 👆 **Three Actions**: Kill (left/red), Maybe Later (up/yellow), Keep (right/green)
- 📊 **Google Sheets Integration**: Automatically track user responses
- 🎨 **Smooth Animations**: Powered by Framer Motion
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode Support**: Built-in theme switching

## Installation

### Option 1: Standard Install (Recommended)
```bash
npm install
npm run dev
```

### Option 2: If you encounter dependency conflicts
```bash
npm run install:legacy
npm run dev
```

### Option 3: Manual legacy install
```bash
npm install --legacy-peer-deps
npm run dev
```

## Deployment

### Netlify Deployment

1. **Push to GitHub/GitLab**
2. **Connect to Netlify**
3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (in Environment Variables)

4. **Environment Variables** (for Google Sheets):
   ```
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   ```

### Local Development

The app will run in development mode and log results to console instead of sending to Google Sheets until you configure the environment variables.

## Google Sheets Setup

1. **Create a Google Sheet**
2. **Enable Google Sheets API**
3. **Get API Key**
4. **Set Environment Variables**
5. **Run the app with production environment variables**

Headers will be automatically created:
- Timestamp
- Session ID  
- Kept Websites
- Killed Websites
- Skipped Websites
- Total Time (seconds)
- Summary (Keep/Kill/Skip)
- User Agent

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run install:legacy` - Install with legacy peer deps
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Google Sheets API** - Data Storage

## Project Structure

```
├── App.tsx                 # Main application component
├── components/
│   ├── SwipeCard.tsx      # Individual swipeable card
│   └── ui/                # Reusable UI components
├── services/
│   └── googleSheets.ts    # Google Sheets integration
├── styles/
│   └── globals.css        # Global styles and CSS variables
└── src/
    └── main.tsx           # Application entry point
```