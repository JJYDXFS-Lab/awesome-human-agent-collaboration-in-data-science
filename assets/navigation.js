'use strict';
(() => {
  // Only change complete visible title nodes, never graph identities or quotes.
  const corrections = window.surveyTitleCorrections || {};
  const correctNode = node => {
    if (node.nodeType !== Node.TEXT_NODE || !node.parentElement) return;
    if (node.parentElement.closest('script, style, pre, code, textarea, input, blockquote, .quote, [contenteditable]')) return;
    const value = node.nodeValue;
    const title = value.trim();
    if (Object.prototype.hasOwnProperty.call(corrections, title)) {
      node.nodeValue = value.replace(title, corrections[title]);
    }
  };
  const correctTree = root => {
    correctNode(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) correctNode(walker.currentNode);
  };
  correctTree(document.body);
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'characterData') correctNode(record.target);
    else record.addedNodes.forEach(correctTree);
  })).observe(document.body, {subtree: true, childList: true, characterData: true});
  const nav = document.querySelector('.survey-nav');
  if (!nav) return;
  document.documentElement.classList.add('survey-site');
  const measure = () => document.documentElement.style.setProperty(
    '--survey-nav-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`
  );
  measure();
  new ResizeObserver(measure).observe(nav);
  // Preserve report-specific sticky offsets underneath the shared navigation.
  document.querySelectorAll('.hero, .toolbar, .detail, .sidebar').forEach(element => {
    const style = getComputedStyle(element);
    if (style.position !== 'sticky') return;
    const offset = parseFloat(style.top);
    if (Number.isFinite(offset)) {
      element.style.top = `calc(var(--survey-nav-height, 80px) + ${offset}px)`;
    }
  });
})();
