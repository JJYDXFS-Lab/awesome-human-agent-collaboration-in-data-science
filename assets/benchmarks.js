/* Public schema v1. No annotation or paper text is interpreted as HTML. */
(() => {
  "use strict";
  const types = {dataset: "Dataset", benchmark: "Benchmark",
    evaluation_environment: "Evaluation environment", evaluation_framework: "Evaluation framework"};
  function filterBenchmarks(papers, filters = {}) {
    const query = String(filters.query || "").trim().toLowerCase();
    return papers.filter(p =>
      (p.contribution === "introduces_or_extends" || (filters.includeUncertain && p.contribution === "uncertain")) &&
      (!filters.type || p.resource_types.includes(filters.type)) &&
      (!filters.year || String(p.year) === String(filters.year)) &&
      (!filters.venue || p.venue === filters.venue) &&
      (!query || [...p.resource_names, p.task_summary, p.title].join("\n").toLowerCase().includes(query)));
  }
  function paperHref(value) {
    if (typeof value !== "string" || /[\u0000-\u001f\u007f\\]/.test(value)) return "";
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && url.hostname ? url.href : "";
    } catch (_) { return ""; }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = {filterBenchmarks, paperHref};
  if (typeof document === "undefined") return;
  const data = document.getElementById("benchmarks-data");
  if (!data) return;
  const papers = JSON.parse(data.textContent).papers;
  const byId = id => document.getElementById(`benchmarks-${id}`);
  const element = (tag, content, className) => {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  };
  for (const field of ["type", "year", "venue"]) {
    const values = field === "type" ? Object.keys(types) : [...new Set(papers.map(p => p[field]).filter(Boolean))]
      .sort((a, b) => field === "year" ? b.localeCompare(a, undefined, {numeric: true}) : a.localeCompare(b));
    for (const value of values) {
      const option = element("option", field === "type" ? types[value] : value);
      option.value = value;
      byId(field).append(option);
    }
  }
  function render() {
    const filtered = filterBenchmarks(papers, {query: byId("search").value, type: byId("type").value,
      year: byId("year").value, venue: byId("venue").value, includeUncertain: byId("uncertain").checked});
    const fragment = document.createDocumentFragment();
    for (const p of filtered) {
      const article = element("article", undefined, "benchmarks-entry");
      const heading = element("h2");
      const href = paperHref(p.paper_link);
      const title = element(href ? "a" : "span", p.title || "Untitled paper");
      if (href) { title.href = href; title.rel = "noopener noreferrer"; }
      heading.append(title);
      article.append(heading, element("p", [p.venue, p.year].filter(Boolean).join(" / "), "benchmarks-source"));
      if (p.resource_names.length) article.append(element("p", p.resource_names.join("; "), "benchmarks-names"));
      article.append(element("p", p.resource_types.map(kind => types[kind]).join(" / "), "benchmarks-types"));
      if (p.contribution === "uncertain") article.append(element("p", "Uncertain contribution", "benchmarks-uncertain"));
      article.append(element("p", p.task_summary || "Task summary unavailable.", "benchmarks-summary"));
      const evidence = element("details");
      evidence.append(element("summary", "Evidence quote"), element("blockquote", p.evidence_quote || "Evidence quote unavailable."));
      article.append(evidence);
      fragment.append(article);
    }
    if (!filtered.length) fragment.append(element("p", "No matching papers."));
    byId("results").replaceChildren(fragment);
    const uncertain = filtered.filter(p => p.contribution === "uncertain").length;
    byId("count").textContent = `${filtered.length} papers${uncertain ? ` (${uncertain} uncertain contributions)` : " introducing or extending resources"}`;
  }
  byId("filters").addEventListener("submit", event => event.preventDefault());
  byId("search").addEventListener("input", render);
  for (const field of ["type", "year", "venue", "uncertain"]) byId(field).addEventListener("change", render);
  render();
  byId("filters").hidden = false;
})();
