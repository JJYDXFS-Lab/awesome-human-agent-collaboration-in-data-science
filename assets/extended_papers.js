(() => {
  'use strict';
  const bucketLabels = {human:'Human',agent:'Agent',data_science:'Data Science',graph:'Graph'};
  function normalizeBuckets(values) {
    return Object.keys(bucketLabels).filter(key => values.includes(key));
  }
  function filterPapers(papers, filters) {
    const words = (filters.q || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const buckets = filters.buckets || (filters.bucket ? [filters.bucket] : []);
    return papers.filter(p => (!filters.year || String(p.year) === filters.year)
      && (!filters.venue || p.venue === filters.venue)
      && (!filters.tier || String(p.tier) === filters.tier)
      && buckets.every(bucket => (p.buckets || []).includes(bucket))
      && words.every(word => p.title.toLocaleLowerCase().includes(word)));
  }
  function paginate(rows, page, size) {
    size = Number(size) === 48 ? 48 : 24;
    const pages = Math.max(1, Math.ceil(rows.length / size));
    page = Math.max(1, Math.min(pages, Number(page) || 1));
    return {rows:rows.slice((page - 1) * size, page * size), page, pages, size};
  }
  if (typeof module !== 'undefined') module.exports = {filterPapers, paginate, normalizeBuckets};
  if (typeof document === 'undefined') return;
  const papers = JSON.parse(document.getElementById('extended-data').textContent).papers;
  const byId = id => document.getElementById(`extended-${id}`);
  const element = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  for (const key of ['year', 'venue']) {
    const values = [...new Set(papers.map(p => String(p[key])))].sort((a,b) => key === 'year' ? Number(b)-Number(a) : a.localeCompare(b));
    for (const value of values) {
      const option = element('option', value);
      option.value = value;
      byId(key).append(option);
    }
  }
  let page = 1;
  let selectedBuckets = [];
  const filters = () => ({q:byId('search').value, year:byId('year').value, venue:byId('venue').value, tier:byId('tier').value, buckets:selectedBuckets});
  function readQuery() {
    const params = new URLSearchParams(location.search);
    byId('search').value = params.get('q') || '';
    for (const key of ['year', 'venue', 'tier', 'size']) {
      const value = params.get(key) || (key === 'size' ? '24' : '');
      byId(key).value = [...byId(key).options].some(o => o.value === value) ? value : (key === 'size' ? '24' : '');
    }
    selectedBuckets = normalizeBuckets(params.getAll('bucket'));
    page = Math.max(1, Math.floor(Number(params.get('page'))) || 1);
  }
  function render() {
    for (const input of byId('buckets').querySelectorAll('input')) input.checked = selectedBuckets.includes(input.value);
    byId('clear-buckets').disabled = selectedBuckets.length === 0;
    const selected = filterPapers(papers, filters());
    const batch = paginate(selected, page, byId('size').value);
    page = batch.page;
    const fragment = document.createDocumentFragment();
    for (const paper of batch.rows) {
      const article = element('article'); article.className = 'extended-card';
      const heading = element('h2');
      const a = element('a', paper.title); a.href = paper.url;
      heading.append(a);
      const buckets = element('div'); buckets.className = 'extended-buckets';
      buckets.setAttribute('role', 'group');
      buckets.setAttribute('aria-label', 'Matched keyword buckets');
      for (const key of paper.buckets) {
        const active = selectedBuckets.includes(key);
        const badge = element('button', bucketLabels[key]); badge.className = `bucket-${key}`;
        badge.type = 'button';
        badge.dataset.bucket = key;
        badge.setAttribute('aria-pressed', String(active));
        badge.title = `${active ? 'Remove' : 'Add'} ${bucketLabels[key]} filter`;
        badge.setAttribute('aria-label', badge.title);
        buckets.append(badge);
      }
      article.append(heading, element('p', `${paper.venue} / ${paper.year} / Tier ${paper.tier}`), buckets);
      fragment.append(article);
    }
    if (!selected.length) fragment.append(element('p','No matching papers.'));
    byId('results').replaceChildren(fragment);
    byId('count').textContent = `${selected.length.toLocaleString()} papers; showing ${selected.length ? (page-1)*batch.size+1 : 0}-${Math.min(page*batch.size, selected.length)}`;
    byId('position').textContent = `Page ${page} of ${batch.pages}`;
    byId('prev').disabled = page === 1;
    byId('next').disabled = page === batch.pages;
    const url = new URL(location.href);
    const {buckets:ignored, ...queryFilters} = filters();
    for (const [key,value] of Object.entries({...queryFilters,size:byId('size').value,page:String(page)})) {
      if (!value || (key === 'size' && value === '24') || (key === 'page' && value === '1')) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    url.searchParams.delete('bucket');
    for (const bucket of selectedBuckets) url.searchParams.append('bucket', bucket);
    try {history.replaceState(null, '', url);} catch (_) { /* file:// preview */ }
  }
  byId('filters').addEventListener('submit', e => e.preventDefault());
  byId('search').addEventListener('input', () => {page=1; render();});
  for (const key of ['year','venue','tier','size']) byId(key).addEventListener('change', () => {page=1; render();});
  byId('buckets').addEventListener('change', () => {
    selectedBuckets = normalizeBuckets([...byId('buckets').querySelectorAll('input:checked')].map(input => input.value));
    page = 1; render();
  });
  byId('clear-buckets').addEventListener('click', () => {
    selectedBuckets = []; page = 1; render();
    byId('buckets').querySelector('input').focus({preventScroll:true});
  });
  byId('results').addEventListener('click', event => {
    const button = event.target.closest('button[data-bucket]');
    if (!button) return;
    const bucket = button.dataset.bucket;
    selectedBuckets = normalizeBuckets(selectedBuckets.includes(bucket)
      ? selectedBuckets.filter(key => key !== bucket) : [...selectedBuckets, bucket]);
    page = 1; render();
    // Card nodes are replaced on filtering; keep keyboard focus on the same control.
    byId('buckets').querySelector(`input[value="${bucket}"]`).focus({preventScroll:true});
  });
  for (const [key,delta] of [['prev',-1],['next',1]]) byId(key).addEventListener('click', () => {
    page += delta; render(); byId('count').scrollIntoView({block:'start'});
  });
  window.addEventListener('popstate', () => {readQuery();render();});
  readQuery(); render();
  byId('filters').hidden = false;
  byId('pagination').hidden = false;
})();
