'use strict';

const openLink = path => {
  newPageElement.href = `${window.location.origin}/${path}?path=${encodeURI(pathInputElement.value)}`;
  newPageElement.click();
};

const pathInputElement = document.getElementById('filepath');
const clearElement = document.getElementById('clear');
const submitElement = document.getElementById('submit');
const searchElement = document.getElementById('search');
const newPageElement = document.getElementById('new-page');
pathInputElement.value = window.sessionStorage.getItem('history-input');
pathInputElement.oninput = () => {
  window.sessionStorage.setItem('history-input', pathInputElement.value);
};
pathInputElement.onkeyup = event => {
  if (event.key === 'Enter') {
    openLink('show');
  }
};
clearElement.onclick = () => {
  pathInputElement.value = '';
  window.sessionStorage.removeItem('history-input');
};
submitElement.onclick = () => {
  openLink('show');
};
searchElement.onclick = () => {
  openLink('search');
};
