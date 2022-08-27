import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;
  subElements = {};

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

  }

  onWindowScroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();
    const {id, order} = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);
      this.loading = false;

    }
  };

  sortOnClient(id, order) {

  }

  sortOnServer(id, order) {

  }

  initEventListeners() {
     this.subElements.header.addEventListener('pointerdown', this.onSortClick);
     window.addEventListener('scroll', this.onWindowScroll);
  }
}


