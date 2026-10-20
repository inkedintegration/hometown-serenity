"use strict";
(() => {
  const controls = document.querySelector('.topic-controls');
  const search = document.querySelector('#topic-search');
  const category = document.querySelector('#topic-category');
  const reset = document.querySelector('.topic-reset');
  const status = document.querySelector('#topic-count');
  const empty = document.querySelector('.topic-empty');
  const normalize = text => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '');
  const groups = Array.from(document.querySelectorAll('.topic-group'), section => ({
    section, category: section.dataset.category,
    items: Array.from(section.querySelectorAll('.topic-item'), element => ({element, text: normalize(element.textContent)}))
  }));
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  function update() {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let shown = 0;
    let categories = 0;
    for (const group of groups) {
      const eligible = category.value === 'all' || category.value === group.category;
      let groupShown = 0;
      for (const item of group.items) {
        const matches = eligible && words.every(word => item.text.includes(word));
        item.element.hidden = !matches;
        if (matches) groupShown++;
      }
      group.section.hidden = groupShown === 0;
      if (groupShown) categories++;
      shown += groupShown;
    }
    status.textContent = `${shown} of ${total} topics · ${categories} ${categories === 1 ? 'category' : 'categories'}`;
    empty.hidden = shown !== 0;
  }
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  reset.addEventListener('click', () => { search.value = ''; category.value = 'all'; update(); search.focus(); });
  controls.hidden = false;
  update();
})();
