// frontend/js/app.js
// Solo Project 2: Cloud Collection Manager
// Frontend talks to backend API (Flask) for ALL CRUD + paging + stats

(() => {
  "use strict";

  // ✅ IMPORTANT: set your backend base URL here
  const API_BASE = "https://oschuyl.pythonanywhere.com";
  const PAGE_SIZE = 10; // required fixed page size

  // ---------- DOM refs ----------
  const viewList = document.getElementById("view-list");
  const viewForm = document.getElementById("view-form");
  const viewStats = document.getElementById("view-stats");

  const navListBtn = document.getElementById("nav-list");
  const navAddBtn = document.getElementById("nav-add");
  const navStatsBtn = document.getElementById("nav-stats");

  const tbody = document.getElementById("books-tbody");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search");

  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  const form = document.getElementById("book-form");
  const formTitle = document.getElementById("form-title");
  const formHint = document.getElementById("form-hint");

  const idInput = document.getElementById("book-id");
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const yearInput = document.getElementById("year");
  const genreInput = document.getElementById("genre");
  const statusInput = document.getElementById("status");
  const ratingInput = document.getElementById("rating");

  const cancelBtn = document.getElementById("cancel-btn");
  const deleteBtn = document.getElementById("delete-btn");

  const statTotal = document.getElementById("stat-total");
  const statFinished = document.getElementById("stat-finished");
  const statAvgRating = document.getElementById("stat-avg-rating");

  // Error fields
  const errTitle = document.getElementById("err-title");
  const errAuthor = document.getElementById("err-author");
  const errYear = document.getElementById("err-year");
  const errGenre = document.getElementById("err-genre");
  const errStatus = document.getElementById("err-status");
  const errRating = document.getElementById("err-rating");

  // ---------- app state ----------
  let currentPage = 1;
  let totalPages = 1;
  let totalCount = 0;

  // current page’s items from server (10 max)
  let pageItems = [];

  // Search is client-side filtering of the current page (keeps backend simple)
  let searchTerm = "";

  // ---------- UI helpers ----------
  function showView(which) {
    viewList.classList.add("hidden");
    viewForm.classList.add("hidden");
    viewStats.classList.add("hidden");

    if (which === "list") viewList.classList.remove("hidden");
    if (which === "form") viewForm.classList.remove("hidden");
    if (which === "stats") viewStats.classList.remove("hidden");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clearErrors() {
    errTitle.textContent = "";
    errAuthor.textContent = "";
    errYear.textContent = "";
    errGenre.textContent = "";
    errStatus.textContent = "";
    errRating.textContent = "";
  }

  function showServerErrors(errObj) {
    clearErrors();
    const errors = (errObj && errObj.errors) ? errObj.errors : {};

    if (errors.title) errTitle.textContent = errors.title;
    if (errors.author) errAuthor.textContent = errors.author;
    if (errors.year) errYear.textContent = errors.year;
    if (errors.genre) errGenre.textContent = errors.genre;
    if (errors.status) errStatus.textContent = errors.status;
    if (errors.rating) errRating.textContent = errors.rating;
  }

  function updatePagerUI() {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  // ---------- API helpers ----------
  async function apiFetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const resp = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    // Try to parse JSON always
    let data = null;
    try {
      data = await resp.json();
    } catch (_) {
      data = null;
    }

    if (!resp.ok) {
      // throw object containing status + parsed data
      const err = new Error("API error");
      err.status = resp.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // ---------- data loading ----------
  async function loadPage(page) {
    // Fetch page from backend (required: 10 per page)
    const data = await apiFetch(`/api/books?page=${encodeURIComponent(page)}`);

    currentPage = data.page;
    totalPages = data.total_pages;
    totalCount = data.total;
    pageItems = Array.isArray(data.items) ? data.items : [];

    updatePagerUI();
    renderList();
  }

  async function loadStats() {
    const data = await apiFetch("/api/stats");
    statTotal.textContent = String(data.total ?? 0);
    statFinished.textContent = String(data.finished ?? 0);

    const avg = data.avg_rating;
    statAvgRating.textContent = (avg === null || avg === undefined) ? "—" : String(avg);
  }

  // ---------- rendering ----------
  function getFilteredPageItems() {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pageItems;

    return pageItems.filter(b => {
      const t = (b.title || "").toLowerCase();
      const a = (b.author || "").toLowerCase();
      return t.includes(term) || a.includes(term);
    });
  }

  function renderList() {
    const list = getFilteredPageItems();
    tbody.innerHTML = "";

    if (list.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    for (const b of list) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(b.title)}</td>
        <td>${escapeHtml(b.author)}</td>
        <td>${escapeHtml(String(b.year ?? ""))}</td>
        <td>${escapeHtml(b.genre)}</td>
        <td>${escapeHtml(b.status)}</td>
        <td>${(b.rating === null || b.rating === "" || b.rating === undefined) ? "—" : escapeHtml(String(b.rating))}</td>
        <td>
          <button class="secondary" data-action="edit" data-id="${escapeHtml(b.id)}">Edit</button>
          <button class="danger" data-action="delete" data-id="${escapeHtml(b.id)}">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    }
  }

  // ---------- form helpers ----------
  function openAddForm() {
    formTitle.textContent = "Add Book";
    formHint.textContent = "Fill out all required fields.";
    deleteBtn.classList.add("hidden");

    idInput.value = "";
    titleInput.value = "";
    authorInput.value = "";
    yearInput.value = "";
    genreInput.value = "";
    statusInput.value = "";
    ratingInput.value = "";

    clearErrors();
    showView("form");
  }

  function openEditForm(bookId) {
    const book = pageItems.find(b => b.id === bookId);
    if (!book) {
      // If user tries to edit something not on current page (rare),
      // just return to list.
      showView("list");
      return;
    }

    formTitle.textContent = "Edit Book";
    formHint.textContent = "Update fields and click Save.";
    deleteBtn.classList.remove("hidden");

    idInput.value = book.id;
    titleInput.value = book.title ?? "";
    authorInput.value = book.author ?? "";
    yearInput.value = book.year ?? "";
    genreInput.value = book.genre ?? "";
    statusInput.value = book.status ?? "";
    ratingInput.value = (book.rating === null || book.rating === undefined) ? "" : String(book.rating);

    clearErrors();
    showView("form");
  }

  function buildPayloadFromForm() {
    return {
      title: titleInput.value.trim(),
      author: authorInput.value.trim(),
      year: yearInput.value.trim(),     // let server validate/convert
      genre: genreInput.value.trim(),
      status: statusInput.value,
      rating: ratingInput.value.trim()  // optional; server validates
    };
  }

  // ---------- CRUD actions ----------
  async function createBook() {
    const payload = buildPayloadFromForm();
    await apiFetch("/api/books", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    // After create, go to page 1 so user sees the newly inserted item.
    searchTerm = "";
    searchInput.value = "";
    await loadPage(1);
    await loadStats();
    showView("list");
  }

  async function updateBook(bookId) {
    const payload = buildPayloadFromForm();
    await apiFetch(`/api/books/${encodeURIComponent(bookId)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    await loadPage(currentPage);
    await loadStats();
    showView("list");
  }

  async function deleteBook(bookId) {
    const book = pageItems.find(b => b.id === bookId);
    const title = book ? book.title : "this book";

    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;

    await apiFetch(`/api/books/${encodeURIComponent(bookId)}`, {
      method: "DELETE"
    });

    // Paging boundary handling:
    // If we deleted the last item on the last page, go back a page if needed.
    // We don’t know new totalPages until we reload, so:
    // - try reload current page
    // - if it comes back empty and we’re not on page 1, go back one page
    await loadPage(currentPage);
    if (pageItems.length === 0 && currentPage > 1) {
      await loadPage(currentPage - 1);
    }

    await loadStats();
    showView("list");
  }

  // ---------- events ----------
  navListBtn.addEventListener("click", async () => {
    await loadPage(currentPage);
    showView("list");
  });

  navAddBtn.addEventListener("click", () => {
    openAddForm();
  });

  navStatsBtn.addEventListener("click", async () => {
    await loadStats();
    showView("stats");
  });

  cancelBtn.addEventListener("click", () => {
    showView("list");
  });

  prevPageBtn.addEventListener("click", async () => {
    if (currentPage > 1) {
      await loadPage(currentPage - 1);
    }
  });

  nextPageBtn.addEventListener("click", async () => {
    if (currentPage < totalPages) {
      await loadPage(currentPage + 1);
    }
  });

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderList(); // filter current page client-side
  });

  // table actions (edit/delete) using event delegation
  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit") openEditForm(id);
    if (action === "delete") {
      try {
        await deleteBook(id);
      } catch (err) {
        alert("Delete failed. Please try again.");
        console.error(err);
      }
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const id = idInput.value;
    if (!id) return;

    try {
      await deleteBook(id);
    } catch (err) {
      alert("Delete failed. Please try again.");
      console.error(err);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const bookId = idInput.value;

    try {
      if (bookId) {
        await updateBook(bookId);
      } else {
        await createBook();
      }
    } catch (err) {
      // show server validation errors (required)
      if (err && err.data && err.data.errors) {
        showServerErrors(err.data);
      } else {
        alert("Save failed. Check your connection and try again.");
      }
      console.error(err);
    }
  });

  // ---------- init ----------
  (async () => {
    try {
      await loadPage(1);
      await loadStats();
      showView("list");
    } catch (err) {
      console.error(err);
      alert(
        "Could not load data from the backend.\n\n" +
        "Make sure the API is running and the API_BASE URL in js/app.js is correct."
      );
    }
  })();
})();

  