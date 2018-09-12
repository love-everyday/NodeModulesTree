'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

class ShowController extends Controller {
  async index() {
    const { ctx } = this;
    const path = ctx.query.path;
    const isExist = await promisify(fs.exists)(path);
    if (!isExist) {
      ctx.body = `Not found file in path ${path}`;
      return;
    }
    if (path.indexOf('package.json') !== (path.length - 12)) {
      ctx.body = 'This file must be package.json';
      return;
    }

    const content = await readFileAsync(path, 'utf-8');
    const obj = JSON.parse(content);
    obj.modulesDetail = {};
    obj.pathIndex = 1;
    let pathIndex = 1;
    const basePath = path.substr(0, path.length - 12);
    obj.packagePath = `/open?path=${decodeURI(basePath)}`;
    obj.packageName = obj.name;
    let packageName = ctx.query[`path${pathIndex}`];
    while (packageName) {
      let pathContent;
      const dirPath = `${basePath}node_modules/${packageName}/`;
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
        let preObj = obj;
        if (pathIndex > 1) {
          preObj = obj.modulesDetail[`path${pathIndex - 1}`];
        }
        if (preObj) {
          const version = (preObj.dependencies && preObj.dependencies[packageName]) || (preObj.devDependencies && preObj.devDependencies[packageName]);
          if (version) {
            pathObj.version = version;
          }
        }
      }
      if (!this.app.packageCache) {
        this.app.packageCache = {};
      }
      // let packageRedis = await this.app.redis.get(packageName);
      let packageRedis = this.app.packageCache[packageName];
      if (!packageRedis) {
        const ret = await ctx.curl(`https://registry.npmjs.org/${packageName}`, { dataType: 'json', timeout: 10000 });
        if (ret.status === 200) {
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

      pathIndex++;
      pathObj.pathIndex = pathIndex;
      packageName = ctx.query[`path${pathIndex}`];
    }
    await ctx.render('show.art', obj);
  }
}

module.exports = ShowController;
