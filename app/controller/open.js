'use strict';

const Controller = require('egg').Controller;
const exec = require('child_process').exec;

class OpenController extends Controller {
  async index() {
    const { ctx } = this;
    const path = ctx.query.path;

    exec(`open ${path}`);
    ctx.body = 'success';
  }
}

module.exports = OpenController;
