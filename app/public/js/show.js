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
  const params = getParamsFromUrl(window.location.search);
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
const showCard = index => {
  const cardElement = document.getElementById(`card-${index}`);
  if (cardElement) {
    cardElement.style.display = 'block';
  }
};

window.onload = () => {
  (function() {
    const params = getParamsFromUrl(window.location.search);

    let pathIndex = 0;
    let packageName = params[`path${pathIndex + 1}`];
    dependenciesOnListener(pathIndex);
    openFileOnListener(pathIndex);
    while (packageName) {
      showCard(pathIndex + 1);
      const selectedElement = document.getElementById(`d@@@${pathIndex}@@@${packageName}`);
      selectedElement.style.backgroundColor = '#03a9f41a';
      selectedElement.style.color = '#1890ff';
      const pathDetailElement = document.getElementById(`path${pathIndex + 1}`);
      dependenciesOnListener(pathIndex + 1);
      openFileOnListener(pathIndex + 1);
      pathDetailElement.style.marginTop = selectedElement.offsetTop;

      pathIndex++;
      packageName = params[`path${pathIndex + 1}`];
    }
    const md5Str = md5(window.location.search);
    const scrollOff = window.sessionStorage.getItem(`@@@historyscroll@@@${window.location.pathname}${md5Str}`);
    const off = JSON.parse(scrollOff);
    if (off && off.length) {
      document.body.scrollLeft = off[0];
      document.body.scrollTop = off[1];
    }
  })();
};


window.onscroll = () => {
  const md5Str = md5(window.location.search);
  window.sessionStorage.setItem(`@@@historyscroll@@@${window.location.pathname}${md5Str}`, `[${document.body.scrollLeft}, ${document.body.scrollTop}]`);
};
