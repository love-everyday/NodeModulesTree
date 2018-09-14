'use strict';
const Service = require('egg').Service;
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

class ParsePackageService extends Service {
  async parse(name, path, type) {
    const { ctx } = this;
    const isExist = await promisify(fs.exists)(path);
    if (!isExist) {
      throw `Not found file in path ${path}`;
    }
    if (path.indexOf('package.json') !== (path.length - 12)) {
      throw 'This file must be package.json';
    }
    const basePath = path.substr(0, path.length - 12);
    let pathIndex = 0;
    let packageName = name;
    let requiredHref = `/search?path=${path}&search=`;
    const obj = { modulesDetail: {} };
    while (packageName) {
      requiredHref += packageName;
      let pathContent;
      const dirPath = packageName === 'USER' ? `${basePath}` : `${basePath}node_modules/${packageName}/`;

      let isSuccess = true;
      try {
        pathContent = await readFileAsync(`${dirPath}package.json`, 'utf-8');
      } catch (error) {
        pathContent = `{"name": "Not found ${packageName}"}`;
        isSuccess = false;
      }
      const pathObj = JSON.parse(pathContent);
      pathObj.packageName = packageName;
      obj.modulesDetail[`path${pathIndex}`] = pathObj;
      if (isSuccess) {
        pathObj.packagePath = `/open?path=${decodeURI(dirPath)}`;
      } else {
        let preObj;
        if (pathIndex > 0) {
          preObj = obj.modulesDetail[`path${pathIndex - 1}`];
        }
        if (preObj) {
          const version = (preObj.dependencies && preObj.dependencies[packageName]) || (preObj.devDependencies && preObj.devDependencies[packageName]);
          if (version) {
            pathObj.version = version;
          }
        }
      }
      requiredHref += `&path${pathIndex + 1}=`;
      if (isSuccess && type === 'requiredBy' && pathObj._requiredBy) {
        pathObj.showRequiredBy = true;
        const requiredBy = [];
        const href = requiredHref;
        let isUser = false;
        pathObj._requiredBy.forEach(value => {
          let _value = value;
          if (_value === '/' || _value === '#DEV:/') {
            _value = 'USER';
          } else {
            _value = _value.substring(1);
          }
          let canInsert = true;
          if (_value === 'USER') {
            if (isUser) {
              canInsert = false;
            } else {
              isUser = true;
            }
          }
          if (canInsert) {
            requiredBy.push({ name: _value, href: `${href}${encodeURI(_value)}` });
          }
        });
        pathObj._requiredBy = requiredBy;
      }

      if (!this.app.packageCache) {
        this.app.packageCache = {};
      }
      // let packageRedis = await this.app.redis.get(packageName);
      let packageRedis = this.app.packageCache[packageName];
      if (!(pathObj.private === true) && packageName !== 'USER' && !packageRedis) {
        let ret;
        try {
          ret = await ctx.curl(`https://registry.npmjs.org/${packageName}`, { dataType: 'json', timeout: 10000 });
        } catch (error) {
          throw error.res;
        }
        if (ret && ret.status === 200) {
          const data = ret.data;
          const latest = data['dist-tags'].latest;
          const versionDetail = { latest: { version: latest, time: data.time[latest].split('T')[0] } };
          if (pathObj.version && pathObj.version !== latest) {
            let currentTime = data.time[pathObj.version];
            if (currentTime) {
              currentTime = currentTime.split('T')[0];
            } else {
              currentTime = 'not found';
            }
            versionDetail.current = { version: pathObj.version, time: currentTime };
          }
          if (!isSuccess) {
            versionDetail.description = data.description;
          }
          packageRedis = versionDetail;
          this.app.packageCache[packageName] = versionDetail;
          // await this.app.redis.set(packageName, JSON.stringify(versionDetail), 'PX', 24 * 60 * 60 * 1000);
        }
      }
      // if (typeof packageRedis === 'string') {
      //   packageRedis = JSON.parse(packageRedis);
      // }
      pathObj.versionDetail = packageRedis;
      pathObj.pathIndex = pathIndex;

      pathIndex++;
      packageName = ctx.query[`path${pathIndex}`];
    }
    return obj;
  }
}

module.exports = ParsePackageService;
