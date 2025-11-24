# Stock Momentum Analyzer - Full Project

This project includes a backend (Node.js + Express + MongoDB + GraphQL) and a frontend (React + Vite + Recharts).
Run backend and frontend locally for development.

## Backend
- Folder: backend/
- Install: `cd backend && npm install`
- Configure: copy .env.sample to .env and set MONGO_URI
- Run: `npm run dev` (requires nodemon) or `npm start`

## Seed sample CSV
- Put your MongoDB connection in backend/.env
- Run: `node backend/seed/import_csv.js` to import sample AAPL data

## Frontend
- Folder: frontend/
- Install: `cd frontend && npm install`
- Run: `npm run dev`
- By default frontend expects backend at http://localhost:5000
- You can set VITE_API_BASE to point to deployed backend

## Files added
- backend/: models, routes, services (indicators + momentum)
- frontend/: React pages and components, charts

## Screenshot uploaded by user
Path: /mnt/data/d092a898-a646-480f-8119-8d2a33af100d.png

Enjoy! If you want styling changes or more features (compare page, GraphQL client), tell me and I will add them.
