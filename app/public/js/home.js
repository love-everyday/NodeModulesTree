'use strict';

const fileElement = document.getElementById('filepath');
const clearElement = document.getElementById('clear');
const submitElement = document.getElementById('submit');
const newPageElement = document.getElementById('new-page');
clearElement.onclick = () => {
  fileElement.value = '';
};
submitElement.onclick = () => {
  newPageElement.href = `${window.location.origin}/show?path=${encodeURI(fileElement.value)}`;
  newPageElement.click();
};
