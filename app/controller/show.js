'use strict';

const Controller = require('egg').Controller;

class ShowController extends Controller {
  async index() {
    const { ctx } = this;
    const path = ctx.query.path;
    try {
      const obj = await ctx.service.parsepackage.parse('USER', path);
      await ctx.render('show.art', obj);
    } catch (error) {
      ctx.body = error;
    }
  }
}

module.exports = ShowController;
