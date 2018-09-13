'use strict';

const openLink = () => {
  const params = getParamsFromUrl(window.location.search);
  if (!params.path) {
    return;
  }
  const searchKey = searchInputElement.value.replace(new RegExp(' ', 'g'), '');
  const search = `?path=${params.path}&search=${encodeURI(searchKey)}`;
  openLinkElement.href = `${window.location.origin}/search${search}`;
  openLinkElement.click();
};

const searchInputElement = document.getElementById('search-input');
const searchButtonElement = document.getElementById('button-search');

searchInputElement.value = window.sessionStorage.getItem('history-search-input');
searchInputElement.oninput = () => {
  window.sessionStorage.setItem('history-search-input', searchInputElement.value);
};
searchButtonElement.onclick = () => {
  openLink();
};
searchInputElement.onkeyup = event => {
  if (event.key === 'Enter') {
    openLink();
  }
};
