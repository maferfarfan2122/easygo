# Easy Go

> Create stunning websites in minutes with AI - Now with AI-powered CV Builder!

Easy Go is an AI-powered website builder that allows users to create full websites automatically by simply describing what they want. Built with React, Vite, and powered by OpenAI GPT-4.

## ✨ Features

- **🚀 AI Website Builder** - Turn words into websites instantly
- **📝 AI CV Builder** - Create optimized CVs tailored to job descriptions (NEW!)
- **💡 Smart Content Generator** - Let AI write your copy and create your visuals
- **👁️ Instant Preview** - See your site live as you create it
- **🔐 User Authentication** - Secure login with Supabase
- **📤 Export & Publish** - Deploy or download with one click

## 🆕 NEW: AI-Powered CV Builder

Create professional, ATS-friendly CVs optimized with GPT-4:

- **6-step intuitive form** with progress tracking
- **AI-powered suggestions** based on job descriptions
- **CV optimization** with OpenAI GPT-4
- **Professional PDF generation** with custom templates
- **Two modes**: AI-optimized or standard (faster)
- **Protected route** requiring authentication

### Quick Start for CV Builder

1. **Configure OpenAI API Key:**
   ```bash
   # Edit backend/.env and add your OpenAI API key
   nano backend/.env
   # Add: OPENAI_API_KEY=your-key-here
   ```

2. **Start both servers:**
   ```bash
   ./start-dev.sh
   ```

3. **Access CV Builder:**
   - Frontend: http://localhost:5173
   - CV Builder: http://localhost:5173/tools/cv-builder
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

📖 **Full Documentation:** See `LEEME_PRIMERO.md` and `CV_BUILDER_GUIDE.md`

## 📋 Prerequisites

### Frontend
- Node.js v20 or higher (recommended: v24)
- npm v11 or higher

### Backend (for CV Builder)
- Python 3.8 or higher
- pip (Python package manager)
- OpenAI API key (get it from https://platform.openai.com/api-keys)

## 🛠️ Installation

### Frontend Setup

1. Install Node.js using nvm (if not already installed):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Load nvm
\. "$HOME/.nvm/nvm.sh"

# Install Node.js v24
nvm install 24

# Use Node.js v24
nvm use 24
```

2. Install dependencies:
```bash
npm install
```

### Backend Setup (for CV Builder)

1. Create virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## 🏃‍♂️ Running the Project

### Option 1: Automated Start (Recommended)
```bash
./start-dev.sh
```

This script will:
- Start the Python backend (port 8000)
- Start the React frontend (port 5173)
- Configure everything automatically

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24
npm run dev
```

### Using VS Code Task:
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Run Task"
3. Select "Start Dev Server"

## 📁 Project Structure

```
easygowebapp/
├── backend/                     # Python/FastAPI backend (NEW!)
│   ├── main.py                 # API server
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (add OPENAI_API_KEY)
│   ├── models/
│   │   └── cv_models.py       # Pydantic models
│   ├── services/
│   │   ├── openai_service.py  # GPT-4 integration
│   │   └── pdf_generator.py   # PDF generation
│   └── README.md              # Backend documentation
│
├── src/
│   ├── components/
│   │   ├── CVBuilder.jsx      # CV Builder component (NEW!)
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── Hero.jsx           # Hero section
│   │   ├── Tools.jsx          # Features section
│   │   ├── Pricing.jsx        # Pricing plans
│   │   ├── SignIn.jsx         # Authentication form
│   │   ├── Dashboard.jsx      # User dashboard
│   │   ├── CTA.jsx            # Call to action
│   │   └── Footer.jsx         # Footer
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── lib/
│   │   └── supabase.js        # Supabase client
│   ├── i18n/
│   │   └── en.js              # English text dictionary
│   ├── App.tsx                # Main app component with routes
│   ├── App.css                # App styles
│   ├── index.css              # Global styles
│   └── main.tsx               # App entry point
│
├── LEEME_PRIMERO.md           # Quick start guide (Spanish)
├── CV_BUILDER_GUIDE.md        # CV Builder technical guide
├── CV_BUILDER_COMPLETE.md     # Implementation summary
├── RESUMEN_CV_BUILDER.md      # CV Builder summary (Spanish)
├── STATUS.txt                 # Visual checklist
├── start-dev.sh               # Automated start script
├── .env.local                 # Frontend environment variables
└── package.json               # Dependencies
```

## 🌐 Internationalization

All text content is stored in `src/i18n/en.js` for easy translation. Each component imports only the texts it needs from this dictionary.

To add a new language:
1. Create a new file like `src/i18n/es.js`
2. Copy the structure from `en.js`
3. Translate all text values
4. Update components to use the new language file

## 🎨 Styling

The project uses plain CSS (no Tailwind or CSS-in-JS). Styles are structured as:
- `index.css` - Global styles and CSS variables
- `App.css` - Component styles including CV Builder
- Modern, clean design with indigo primary color

## 🔒 Authentication

User authentication is handled by Supabase:
- Sign up with email/password
- Email verification
- Password reset
- Protected routes for authenticated users
- Session management with AuthContext

## 🤖 AI Integration

### OpenAI GPT-4
- **CV Optimization:** Rewrites CV content to match job descriptions
- **Smart Suggestions:** Provides personalized recommendations
- **ATS-Friendly:** Optimizes for Applicant Tracking Systems
- **Model:** `gpt-4-turbo-preview`
- **Cost:** ~$0.03-0.10 USD per CV

### PDF Generation
- **ReportLab:** Professional PDF creation
- **Custom Templates:** Branded design
- **Responsive Layout:** Optimized for printing and viewing

## 📦 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `python main.py` - Start API server
- `uvicorn main:app --reload` - Start with auto-reload

### Combined
- `./start-dev.sh` - Start both frontend and backend

## 🧪 API Endpoints

```
GET  /                                     - API info
GET  /health                               - Health check
POST /api/cv/suggestions                   - Get AI suggestions
POST /api/cv/optimize                      - Optimize CV with AI
POST /api/cv/generate                      - Generate optimized PDF
POST /api/cv/generate-without-optimization - Generate standard PDF
```

**API Documentation:** http://localhost:8000/docs (Swagger UI)

## 🔧 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 7.1.12** - Build tool
- **React Router DOM** - Client-side routing
- **Supabase** - Authentication and database
- **ESLint** - Code linting

### Backend
- **Python 3.8+** - Programming language
- **FastAPI 0.115.0** - API framework
- **OpenAI 1.54.0** - GPT-4 integration
- **ReportLab 4.2.5** - PDF generation
- **Pydantic 2.9.2** - Data validation
- **Uvicorn 0.32.0** - ASGI server

## 🌍 Environment Variables

### Frontend (`.env.local`)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
OPENAI_API_KEY=your-openai-api-key
PORT=8000
DEBUG=True
```

## 🐛 Troubleshooting

### "OPENAI_API_KEY no configurada"
- Edit `backend/.env` and add your OpenAI API key
- Get key from: https://platform.openai.com/api-keys

### "Failed to fetch" in CV Builder
- Ensure backend is running: http://localhost:8000/health
- Check CORS configuration in `backend/main.py`

### Frontend doesn't start
- Use Node.js v24: `nvm use 24`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Backend errors
- Activate venv: `source backend/venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

## 📖 Documentation

Read in this order:

1. **LEEME_PRIMERO.md** - Quick start guide (Spanish) ⭐ START HERE
2. **STATUS.txt** - Visual checklist
3. **CV_BUILDER_GUIDE.md** - Complete technical guide
4. **backend/README.md** - Backend documentation and deployment

## 💰 Costs

- **OpenAI API:** ~$0.03-0.10 per CV (GPT-4)
- **Supabase:** Free tier available
- **Hosting:** Free on Vercel/Netlify (frontend) + IONOS VPS (backend)
- **Estimated:** ~$3-10/month for 100 CVs

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to Vercel or Netlify
```

### Backend (IONOS VPS)
See `backend/README.md` for detailed deployment instructions.

## 📄 License

© 2025 Easy Go. All rights reserved.

---

**Built for creators, powered by AI.**

**New: Create professional CVs in minutes with AI optimization!** 🎉
