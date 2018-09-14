'use strict';

const Controller = require('egg').Controller;


class SearchController extends Controller {
  async index() {
    const { ctx } = this;
    const path = ctx.query.path;
    let searchKey = ctx.query.search;
    if (searchKey) {
      searchKey = searchKey.replace(new RegExp(' ', 'g'), '');
    }
    try {
      const obj = await ctx.service.parsepackage.parse(searchKey, path, 'requiredBy');
      await ctx.render('search.art', obj);
    } catch (error) {
      ctx.body = error;
    }
  }
}

module.exports = SearchController;
