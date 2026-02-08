# CPSC 3750 — Solo Project 2
## Cloud Book Collection Manager (Netlify + Flask API + JSON Persistence)

### Student
- **Name:** Owen Schuyler
- **GitHub:** owen-schuyler

---

## Live Site (Netlify)
- **Netlify URL:** https://gregarious-boba-467012.netlify.app

---

## Backend
- **Language/Framework:** Python (Flask)
- **API Base URL:** https://oschuyl.pythonanywhere.com
- **Persistence:** Server-side JSON files on PythonAnywhere

### JSON Persistence Explanation
All book records are stored on the server in a JSON file (`books.json`).  
The frontend does not use localStorage for data storage. Instead, it sends HTTP requests to the backend API for all Create/Read/Update/Delete operations. The backend reads/writes the JSON file for persistence, so data remains across refreshes and across different devices.

---

## Features Implemented
- Full CRUD through backend API routes (no client-owned data)
- Server-side validation (required fields + numeric ranges)
- Delete confirmation before removal
- Stats view computed from the full dataset (total, finished count, avg rating)
- Paging required: **10 records per page** with Next/Previous and page indicator
- Clean UI with basic responsiveness

---

## How It Works (High-Level)
- Frontend (Netlify) calls:
  - `GET /api/books?page=1` (paging)
  - `POST /api/books`
  - `PUT /api/books/<id>`
  - `DELETE /api/books/<id>`
  - `GET /api/stats`
- Backend (PythonAnywhere Flask) persists to JSON files on the server.

---

## Repo Structure
- `frontend/` = static site deployed to Netlify
- `backend/` = Flask API source code + JSON data files (server-side)
