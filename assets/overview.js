'use strict';
const overviewData = JSON.parse(document.getElementById('overview-data').textContent);
const funnel = document.getElementById('overview-funnel');
const smallScreen = window.matchMedia('(max-width: 600px)');
function renderFunnel() {
  const compact = smallScreen.matches;
  Plotly.react(funnel, [{
    type: 'funnel',
    y: overviewData.funnel.map(row => row.label),
    x: overviewData.funnel.map(row => row.value),
    texttemplate: '%{value:,.0f}',
    textposition: 'auto',
    hovertemplate: '%{y}: %{value:,.0f}<extra></extra>',
    marker: {color: ['#117b71', '#386bb3', '#cb8525', '#8962bd']},
    connector: {line: {color: '#b8c2c5', width: 1}, fillcolor: '#e7ecee'}
  }], {
    height: 360,
    margin: {t: 16, r: compact ? 60 : 80, b: 16, l: compact ? 112 : 150},
    font: {family: 'system-ui, sans-serif', size: compact ? 11 : 13, color: '#23282b'},
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    yaxis: {fixedrange: true}, xaxis: {fixedrange: true}
  }, {responsive: true, displayModeBar: false});
}
renderFunnel();
smallScreen.addEventListener('change', renderFunnel);
