/* Aggregates only: paper metadata stays out of the public payload. */
(() => {
  "use strict";
  const fallback = document.getElementById("conference-chart-fallback");
  if (!window.Plotly) {
    fallback.hidden = false;
    return;
  }
  const report = JSON.parse(document.getElementById("conferences-data").textContent);
  const draw = (id, dimension, labels) => {
    const traces = [{
      type: "bar", name: "Screened candidates", marker: {color: "#36877c"}, x: labels.map(String),
      y: labels.map(label => {
        const cells = report.cells.filter(cell => cell[dimension] === label);
        return cells.reduce((sum, cell) => sum + cell.keep + cell.borderline, 0);
      }),
      hovertemplate: "%{x}<br>Screened candidates: %{y:,}<extra></extra>"
    }];
    return Plotly.newPlot(id, traces, {
      showlegend: false, paper_bgcolor: "transparent", plot_bgcolor: "transparent",
      font: {family: "system-ui, sans-serif", color: "#292b29", size: 12},
      margin: {l: 62, r: 10, t: 10, b: 90},
      legend: {orientation: "h", y: -0.22},
      xaxis: {type: "category", categoryorder: "array", categoryarray: labels.map(String), automargin: true},
      yaxis: {title: {text: "Screened candidates"}, rangemode: "tozero", gridcolor: "#e3e1da"}
    }, {responsive: true, displayModeBar: false});
  };
  Promise.all([draw("conference-venues", "venue", report.venues),
    draw("conference-years", "year", report.years)]).catch(() => { fallback.hidden = false; });
})();
