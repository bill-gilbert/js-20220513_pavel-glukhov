export default class SortableTable {
  element;
  subElements = {};

  onHeaderClick = event => {
    const activeColumn = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (activeColumn) {
      const {id, order} = activeColumn.dataset;
      const newOrder = toggleOrder(order);
      const sortedData = this.sortData(id, newOrder);
      const arrow = activeColumn.querySelector('.sortable-table__sort-arrow');

      activeColumn.dataset.order = newOrder;
      if (!arrow) {
        activeColumn.append(this.subElements.arrow);
      }
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  constructor(headersConfig=[], {
    data = [],
    sorted = {
      id: headersConfig.find(item=> item.sorted).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();
  }

  getTableHeader() {
    return `
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
        </div>
    `;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : `asc`;
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}"
      data-order="${order}">
        <span>${title}</span>
        ${this.getSortingArrow(id)}
      </div>
    `;
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
          ${this.getTableRows(data)}
      </div>
    `;
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>
    `;
  }

  render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    const sortedData = this.sortData(id, order);
    wrapper.innerHTML = this.getTable(sortedData);

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const direction = order === `asc` ?  1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      case 'custom':
        return direction * customSorting(a, b);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {id, template};
    });

    return cells.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTableRows(data ) {
    return data.map(item =>
      `
        <div class="sortable-table__row">
          ${this.getTableRow(item)}
        </div>`
    ).join('');
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  getSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist ?
      `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
      ` : ``;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
