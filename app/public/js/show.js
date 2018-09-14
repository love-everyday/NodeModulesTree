'use strict';

const getParamsFromUrl = url => {
  const query = url.substring(1);
  const result = {};
  query.split('&').forEach(function(part) {
    const item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
};
const params = getParamsFromUrl(window.location.search);
const combineParamsToUrl = params => {
  let query = '';
  Object.keys(params).forEach(key => {
    const element = params[key];
    query += `&${key}=${decodeURI(element)}`;
  });

  return query.substring(1);
};
const openLinkElement = document.getElementById('open-link');
const dependenciesOnClick = event => {
  const id = event.target.id;

  if (id.indexOf('d@@@') !== 0) {
    return;
  }
  const idQuery = id.split('@@@');
  if (idQuery.length !== 3) {
    return;
  }
  const pathIndex = parseInt(idQuery[1]);

  const newParams = { path: params.path };
  if (params.search) {
    newParams.search = params.search;
  }

  for (let index = 1; index < pathIndex + 1; index++) {
    const _index = `path${index}`;
    const value = params[_index];
    if (!value) {
      break;
    }
    newParams[_index] = value;
  }
  newParams[`path${pathIndex + 1}`] = idQuery[2];
  const search = `?${combineParamsToUrl(newParams)}`;
  const md5Str = md5(search);
  window.sessionStorage.setItem(`@@@historyscroll@@@${window.location.pathname}${md5Str}`, `[${document.body.scrollLeft + 200}, ${document.body.scrollTop}]`);
  openLinkElement.href = `${window.location.origin}${window.location.pathname}${search}`;
  openLinkElement.click();
};
const dependenciesOnListener = index => {
  const dependElement = document.getElementById(`dependencies-${index}`);
  if (dependElement) {
    dependElement.onclick = event => {
      dependenciesOnClick(event);
    };
  }
};
const openFileOnListener = index => {
  const dependElement = document.getElementById(`open-file-${index}`);

  if (dependElement) {
    dependElement.onclick = event => {
      const id = event.target.id;
      if (id.indexOf('open-file-') !== 0) {
        return;
      }
      const detailElement = dependElement.firstElementChild;
      axios(`${window.location.origin}${detailElement.innerHTML}`)
        .catch(error => {
          console.log(error);
        });
    };
  }
};

const adjustElementPostionAndEvent = (listener = true) => {
  let pathIndex = 0;
  let packageName = params[`path${pathIndex + 1}`];
  if (listener) {
    dependenciesOnListener(pathIndex);
    openFileOnListener(pathIndex);
  }
  while (packageName) {
    const selectedElement = document.getElementById(`d@@@${pathIndex}@@@${packageName}`);
    const pathDetailElement = document.getElementById(`path${pathIndex + 1}`);
    pathDetailElement.style.marginTop = selectedElement.offsetTop;
    if (listener) {
      selectedElement.style.backgroundColor = '#03a9f41a';
      selectedElement.style.color = '#1890ff';
      dependenciesOnListener(pathIndex + 1);
      openFileOnListener(pathIndex + 1);
    }

    pathIndex++;
    packageName = params[`path${pathIndex + 1}`];
  }
};

adjustElementPostionAndEvent();

const md5Str = md5(window.location.search);
const scrollOff = window.sessionStorage.getItem(`@@@historyscroll@@@${window.location.pathname}${md5Str}`);
const off = JSON.parse(scrollOff);
if (off && off.length) {
  document.body.scrollLeft = off[0];
  document.body.scrollTop = off[1];
}

window.onload = () => {
  adjustElementPostionAndEvent(false);
};
window.onscroll = () => {
  const md5Str = md5(window.location.search);
  window.sessionStorage.setItem(`@@@historyscroll@@@${window.location.pathname}${md5Str}`, `[${document.body.scrollLeft}, ${document.body.scrollTop}]`);
};

const homeElement = document.getElementById('button-home');
if (homeElement) {
  homeElement.onclick = () => {
    openLinkElement.href = window.location.origin;
    openLinkElement.click();
  };
}

const showElement = document.getElementById('button-show');
if (showElement) {
  showElement.onclick = () => {
    if (!params.path) {
      return;
    }
    openLinkElement.href = `${window.location.origin}/show?path=${params.path}`;
    openLinkElement.click();
  };
}

const showSearchElement = document.getElementById('show-search');
if (showSearchElement) {
  showSearchElement.onclick = () => {
    if (!params.path) {
      return;
    }
    openLinkElement.href = `${window.location.origin}/search?path=${params.path}`;
    openLinkElement.click();
  };
}
