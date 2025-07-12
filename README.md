# 🧠 Prompt-to-3D Generator using Meshy API

A full-stack web app that lets users generate 3D models from text prompts using the [Meshy API](https://meshy.ai). The app supports preview and textured `.glb` models and renders them directly in the browser using [`@google/model-viewer`](https://www.npmjs.com/package/@google/model-viewer) inside a React (JSX) UI.

## ✨ Features

- 🔤 **Prompt to 3D**: Input a prompt and get a 3D model.
- ⏱ **Real-time Updates**: View status like queued, generating, and completed.
- 🖼 **In-browser Model Viewer**: Uses `@google/model-viewer` for seamless `.glb` rendering.
- 🧵 **Textured Models**: Supports refined, fully textured output.
- ⚛️ **Frontend**: React + Vite + Tailwind CSS  
- 🐍 **Backend**: Flask API to securely handle Meshy API requests

## 🗂 Folder Structure

```
MESHYAI/
│
├── api/                      # Flask backend
│   ├── venv/                 # Virtual environment
│   ├── api.py                # Backend logic for Meshy API calls
│   ├── preview_model.glb     # Preview model output
│   ├── refined_model.glb     # Textured model output
│   ├── requirements.txt      # Python dependencies
│
├── src/                      # React frontend
│   ├── Animations/           # Animation components
│   ├── assets/               # Icons/images
│   ├── Backgrounds/          # Background effects
│   ├── pages/                # Main page components
│   ├── App.jsx               # Main app file
│   ├── main.jsx              # React root entry
│   ├── App.css
│   ├── index.css
│
├── .env                      # Environment variables
├── .flaskenv                 # Flask environment configuration
├── .gitignore
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── package-lock.json
```

## 🚀 Getting Started

### 🔧 Backend (Flask API)

```bash
cd api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api.py
```
## ▶️ Start the Flask Server

```bash
python api.py
```

The backend will start at: [http://localhost:5000](http://localhost:5000)

---

## ⚛️ Set Up the Frontend (React + Vite)

Open a new terminal at the project root and run:

```bash
npm install
npm run dev
```

The app will run at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Test It Out

1. Enter a prompt like:
   ```
   "A robot dog with metallic legs and red eyes"
   ```

2. Click **Generate**

3. Watch status updates in real-time

4. View the preview and final textured 3D model using `<model-viewer>`

   

<p align="center">
  Made with ❤️ using Flask, React, and Vite  
</p>

