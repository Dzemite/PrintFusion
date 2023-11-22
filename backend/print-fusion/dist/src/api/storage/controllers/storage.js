"use strict";
/**
 * storage controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
// export default factories.createCoreController('api::storage.storage');
exports.default = strapi_1.factories.createCoreController('api::storage.storage', ({ strapi }) => ({
    async create(ctx) {
        const storage = ctx.request.body;
        storage.data.user = ctx.state.user.id;
        const entity = await strapi.services['api::storage.storage'].create(storage);
        return this.sanitizeOutput(entity, ctx);
    },
    // async create(ctx) {
    //   const storage = ctx.request.body;
    //   storage.data.user = ctx.state.user.id;
    //   const newStorage = await strapi.entityService.create('api::storage.storage', {
    //     data: storage.data,
    //     populate: ['storage.owner'],
    //   });
    //   return newStorage;
    // },
    async find(ctx) {
        await this.validateQuery(ctx);
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);
        const query = { ...sanitizedQueryParams };
        if (!query.filters) {
            query.filters = { user: { id: { '$eq': ctx.state.user.id } } };
        }
        else {
            query.filters['user'] = { id: { '$eq': ctx.state.user.id } };
        }
        const { results, pagination } = await strapi.service('api::storage.storage').find(query);
        const sanitizedResults = await this.sanitizeOutput(results, ctx);
        return this.transformResponse(sanitizedResults, { pagination });
    }
}));
