// Which book (school year) the VN games show. The Tiếng Việt 3 menu opens the
// games with ?book=3; anything else is Tiếng Việt 2. Lessons, workbook pages
// and poems carry "book": 3 for year 3 (no "book" = year 2), and each game only
// lists entries from its own book, so year-3 content never appears in year 2.
(function () {
  const book = new URLSearchParams(location.search).get("book") === "3" ? 3 : 2;
  const api = {
    book: book,
    label: "Tiếng Việt " + book,
    menuHash: book === 3 ? "#vn3" : "#vn",
    pick: function (list) { return (list || []).filter(function (x) { return (x.book || 2) === book; }); },
    key: function (k) { return book === 3 ? k + ":3" : k; } // remember choices per book
  };
  window.VNBook = api;
  // Back link to this book's menu.
  document.querySelectorAll('.top-nav a[href*="index.html#vn"]').forEach(function (a) {
    a.setAttribute("href", "../../index.html" + api.menuHash);
    a.textContent = api.label;
  });
})();
