/* Public schema v1. No annotation or paper text is interpreted as HTML. */
(() => {
  "use strict";
  const types = {dataset: "Dataset", benchmark: "Benchmark",
    evaluation_environment: "Evaluation environment", evaluation_framework: "Evaluation framework"};
  const categories = {data_analysis: "Data Analysis", data_modeling: "Data Modeling",
    mixed: "Mixed", others: "Others", not_specified: "Not specified"};
  function filterBenchmarks(papers, filters = {}) {
    const query = String(filters.query || "").trim().toLowerCase();
    return papers.filter(p =>
      (p.contribution === "introduces_or_extends" || (filters.includeUncertain && p.contribution === "uncertain")) &&
      (!filters.type || p.resource_types.includes(filters.type)) &&
      (!filters.category || (p.task_category || "not_specified") === filters.category) &&
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
  let category = "";
  const categoryButtons = [...byId("categories").querySelectorAll("button")];
  function render() {
    const matching = filterBenchmarks(papers, {query: byId("search").value, type: byId("type").value,
      year: byId("year").value, venue: byId("venue").value, includeUncertain: byId("uncertain").checked});
    const filtered = matching.filter(p => !category || (p.task_category || "not_specified") === category);
    for (const button of categoryButtons) {
      const key = button.dataset.category;
      const count = matching.filter(p => !key || (p.task_category || "not_specified") === key).length;
      button.textContent = `${categories[key] || "All"} (${count})`;
      button.setAttribute("aria-pressed", String(category === key));
      button.hidden = key === "not_specified" && !count && category !== key;
    }
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
      article.append(element("p", categories[p.task_category] || "Not specified", "benchmarks-category"));
      if (p.contribution === "uncertain") article.append(element("p", "Uncertain contribution", "benchmarks-uncertain"));
      article.append(element("p", p.task_summary || "Task summary unavailable.", "benchmarks-summary"));
      const evidence = element("details");
      evidence.append(element("summary", "Evidence quote"), element("blockquote", p.evidence_quote || "Evidence quote unavailable."));
      article.append(evidence);
      if (p.task_rationale) {
        const task = element("details");
        task.append(element("summary", "Task classification"), element("p", p.task_rationale));
        for (const quote of p.task_evidence || []) task.append(element("blockquote", quote));
        article.append(task);
      }
      fragment.append(article);
    }
    if (!filtered.length) fragment.append(element("p", "No matching papers."));
    byId("results").replaceChildren(fragment);
    const uncertain = filtered.filter(p => p.contribution === "uncertain").length;
    byId("count").textContent = `${filtered.length} papers${uncertain ? ` (${uncertain} uncertain contributions)` : " introducing or extending resources"}`;
  }
  byId("filters").addEventListener("submit", event => event.preventDefault());
  for (const button of categoryButtons) button.addEventListener("click", () => {
    category = button.dataset.category;
    render();
  });
  byId("search").addEventListener("input", render);
  for (const field of ["type", "year", "venue", "uncertain"]) byId(field).addEventListener("change", render);
  render();
  byId("filters").hidden = false;
  byId("categories").hidden = false;
})();
