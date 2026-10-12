/* Public schema v1. Text is rendered through textContent, never HTML interpolation. */
(() => {
  "use strict";
  const venueKey = value => String(value || "").replace(/\.cc$/i, "")
    .replace(/^colmweb\.org\//i, "").toLowerCase();
  function filterPapers(papers, filters = {}) {
    const query = String(filters.query || "").trim().toLowerCase();
    return papers.filter(p =>
      (["keep", "borderline"].includes(p.verdict) || (filters.includeDrop && p.verdict === "drop")) &&
      (!filters.year || String(p.year) === String(filters.year)) &&
      (!filters.venue || venueKey(p.venue) === venueKey(filters.venue)) &&
      (!filters.deepOnly || p.deep_analysis) &&
      (!query || `${p.title}\n${p.abstract}`.toLowerCase().includes(query)));
  }
  function paginate(rows, page, size) {
    size = [10, 25, 50].includes(Number(size)) ? Number(size) : 25;
    const pages = Math.max(1, Math.ceil(rows.length / size));
    page = Math.max(1, Math.min(pages, Math.floor(Number(page)) || 1));
    return {rows: rows.slice((page - 1) * size, page * size), page, pages, size};
  }
  function paperHref(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = {filterPapers, paginate, paperHref};
  if (typeof document === "undefined") return;
  const data = document.getElementById("papers-data");
  if (!data) return;
  const papers = JSON.parse(data.textContent).papers;
  const byId = id => document.getElementById(`papers-${id}`);
  const element = (tag, content, className) => {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  };
  for (const field of ["year", "venue"]) {
    const values = [...new Set(papers.map(p => p[field]).filter(Boolean))].sort((a, b) =>
      field === "year" ? b.localeCompare(a, undefined, {numeric: true}) : a.localeCompare(b));
    for (const value of values) {
      const option = element("option", value);
      option.value = value;
      byId(field).append(option);
    }
  }
  function readQuery() {
    const params = new URLSearchParams(location.search);
    for (const field of ["year", "venue"]) {
      const requested = params.get(field) || "";
      const match = [...byId(field).options].find(o => field === "venue"
        ? venueKey(o.value) === venueKey(requested) : o.value === requested);
      if (requested && !match) {
        const option = element("option", requested);
        option.value = requested;
        byId(field).append(option);
      }
      byId(field).value = match ? match.value : requested;
    }
  }
  function writeQuery() {
    const url = new URL(location.href);
    for (const field of ["year", "venue"]) {
      if (byId(field).value) url.searchParams.set(field, byId(field).value);
      else url.searchParams.delete(field);
    }
    // file:// previews can disallow history updates; filtering still works.
    try { history.replaceState(null, "", url); } catch (_) { /* Local preview. */ }
  }
  let page = 1;
  function render() {
    const filtered = filterPapers(papers, {query: byId("search").value,
      year: byId("year").value, venue: byId("venue").value,
      includeDrop: byId("drop").checked, deepOnly: byId("deep").checked});
    const batch = paginate(filtered, page, byId("size").value);
    page = batch.page;
    const fragment = document.createDocumentFragment();
    for (const p of batch.rows) {
      const article = element("article", undefined, "papers-paper");
      const heading = element("h2");
      const href = paperHref(p.paper_link);
      const title = element(href ? "a" : "span", p.title || "Untitled paper");
      if (href) { title.href = href; title.rel = "noopener noreferrer"; }
      heading.append(title);
      const badges = element("div", undefined, "papers-badges");
      badges.append(element("span", p.verdict));
      if (p.rule_kept) badges.append(element("span", "Rule kept (not LLM-scored)"));
      if (p.deep_analysis) badges.append(element("span", "Deep analysis", "papers-deep"));
      const rationale = element("p", undefined, "papers-rationale");
      rationale.append(element("strong", "Screening rationale: "), document.createTextNode(p.triage_rationale || "Not available."));
      article.append(heading, element("p", [p.venue, p.year, p.track].filter(Boolean).join(" \u00b7 "), "papers-meta"),
        element("p", p.authors || "Authors unavailable", "papers-authors"), badges,
        element("p", p.abstract || "Abstract unavailable.", "papers-abstract"), rationale);
      fragment.append(article);
    }
    if (!filtered.length) fragment.append(element("p", "No matching papers."));
    byId("results").replaceChildren(fragment);
    const start = filtered.length ? (page - 1) * batch.size + 1 : 0;
    byId("count").textContent = `${filtered.length} papers; showing ${start}-${Math.min(page * batch.size, filtered.length)}`;
    byId("position").textContent = `Page ${page} of ${batch.pages}`;
    byId("prev").disabled = page === 1;
    byId("next").disabled = page === batch.pages;
  }
  byId("filters").addEventListener("submit", event => event.preventDefault());
  byId("search").addEventListener("input", () => { page = 1; render(); });
  for (const field of ["year", "venue", "drop", "deep", "size"]) {
    byId(field).addEventListener("change", () => { page = 1; writeQuery(); render(); });
  }
  for (const [id, delta] of [["prev", -1], ["next", 1]]) {
    byId(id).addEventListener("click", () => {
      page += delta;
      render();
      byId("count").scrollIntoView({block: "start"});
    });
  }
  window.addEventListener("popstate", () => { readQuery(); page = 1; render(); });
  readQuery();
  render();
  byId("filters").hidden = false;
  byId("pagination").hidden = false;
})();
