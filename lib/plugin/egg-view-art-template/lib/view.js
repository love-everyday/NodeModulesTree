'use strict';

const debug = require('debug')('art-template');
const template = require('art-template');

const defaultSettings = {
  debug: process.env.NODE_ENV !== 'production',
  writeResp: false,
};

module.exports = class ArtView {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.art;
  }

  artRender(filename, data) {
    debug(`render: ${filename}`);
    defaultSettings.filename = filename;
    const render = template.compile(defaultSettings);
    return render(data);
  }

  render(filename, locals) {
    const ctx = this;
    const data = Object.assign({}, ctx.state, locals);
    const html = this.artRender(filename, data);
    const writeResp = data.writeResp === false ? false : (data.writeResp || defaultSettings.writeResp);
    if (writeResp) {
      ctx.type = 'html';
      ctx.body = html;
    } else {
      return html;
    }
  }
  renderString(tpl, locals) {
  }
};
