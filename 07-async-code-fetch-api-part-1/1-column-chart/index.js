import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const defaultHeight = 50;

export default class ColumnChart {
  element;
  subElements = {};

  constructor({
      url = '',
      range = {},
      label = '',
      link = '',
      value = 0,
      formatHeading = (value) => value,
      chartHeight = defaultHeight
    } = {}
  ) {
    this.url = url;
    this.range = range;
    this.chartHeight = chartHeight;
    this.formatHeading = formatHeading;
    this.label = label;
    this.link = link;
    this.value = value;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const children = element.querySelectorAll('[data-element]');
    const subElements = [...children].reduce((target, subElement) => {
      target[subElement.dataset.element] = subElement;
      return target;
    }, {});

    if (!this.link) {
      subElements.link.remove();
      delete subElements.link;
    }

    return subElements;
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.height}">
          <div class="column-chart__title">
            ${this.label}
            <a href="${this.link}" class="column-chart__link" data-element="link">View all</a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>
        `;
  }

  async update(dateFrom = this.range.from, dateTo = this.range.to) {
    this.element.classList.add('column-chart_loading');

    const {body} = this.subElements;

    body.innerHTML = '';

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append('from', dateFrom.toISOString());
    url.searchParams.append('to', dateTo.toISOString());

    const data = await fetchJson(url);
    this.updateContent(data);
    return data;
  }

  updateContent(data) {
    const {header, body} = this.subElements;
    const values = Object.values(data).map((key) => Number(key));
    const entries = Object.keys(data).map(key => ({date: key, sum: Number(data[key])}));
    const max = Math.max(...values);
    const total = values.reduce((sum, x) => sum += x, 0);
    header.textContent = this.formatHeading(total);
    entries.forEach(entry => {
      const columnElement = document.createElement('div');
      columnElement.setAttribute('style', '--value: ' + Math.trunc((entry.sum / max) * this.chartHeight));
      columnElement.dataset.tooltip = this.formatHeading(entry.date);
      body.append(columnElement);
    });

    if (values.length > 0) {
      this.element.classList.remove('column-chart_loading');
    }
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
