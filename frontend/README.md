# CPSC 3750 — Solo Project 1  
## Book Collection Manager (Local CRUD Application)

### Student
- **Name:** Owen Schuyler  
- **Course:** CPSC 3750  

---

## Project Overview
This project is a local-only Collection Manager web application that allows a user to **Create, Read, Update, and Delete (CRUD)** records for a personal book collection.

The application runs **entirely on localhost** using **XAMPP Apache**, stores data in **JavaScript objects/arrays**, and persists data using **localStorage**. No external libraries or frameworks are used.

---

## Folder Placement (IMPORTANT)
Place the entire project folder named:

collection_manager

scss

inside XAMPP’s `htdocs` directory.

Example (macOS):
/Applications/XAMPP/htdocs/collection_manager

---

## How to Run the Application
1. Open **XAMPP**
2. Start **Apache Web Server**
3. Open a browser and go to:

http://localhost/collection_manager/

The application should load immediately.

---

## Features Implemented
- Full **CRUD functionality**
  - Add new books
  - View all books
  - Edit existing books
  - Delete books (with confirmation)
- **localStorage persistence**
  - Data is retained across page refreshes
  - App initializes with **30+ seed records**
- **Validation**
  - Required fields enforced
  - Numeric ranges validated
- **Stats View**
  - Total number of books
  - Count of finished books
  - Average rating (derived statistic)
- Clean, readable UI using basic CSS

---

## Technology Used
- HTML
- CSS
- JavaScript (no frameworks)
- XAMPP (Apache)
- Browser localStorage

---

## Notes
This project runs locally only and is not deployed to the public internet, per assignment requirements.

