"use strict";
/**
 * order controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const strapi_1 = require("@strapi/strapi");
const { ValidationError } = utils_1.errors;
// export default factories.createCoreController('api::order.order');
exports.default = strapi_1.factories.createCoreController('api::order.order', ({ strapi }) => ({
    async create(ctx) {
        const order = ctx.request.body;
        order.data.user = ctx.state.user.id;
        let entity;
        try {
            /**
             * Find and update storage of plastic, decrease weight
             */
            const plasticId = order.data.plastic;
            const itemCount = order.data.itemCount;
            const query = { filters: { id: { '$eq': plasticId } } };
            const storageForUpdate = await strapi.service('api::storage.storage').find(query);
            const newWeight = storageForUpdate.results[0].weight - (order.data.weight * (itemCount !== null && itemCount !== void 0 ? itemCount : 1));
            if (newWeight < 0) {
                throw new ValidationError('Not enough plastic in stock.', { newWeight, exists: storageForUpdate.results[0].weight, youWhant: order.data.weight });
            }
            await strapi.services['api::storage.storage'].update(plasticId, { data: { weight: newWeight } });
            /** Create new Order */
            entity = await strapi.services['api::order.order'].create(order);
        }
        catch (error) {
            console.error(error);
            return error;
        }
        return this.sanitizeOutput(entity, ctx);
    },
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
        const { results, pagination } = await strapi.service('api::order.order').find(query);
        const sanitizedResults = await this.sanitizeOutput(results, ctx);
        return this.transformResponse(sanitizedResults, { pagination });
    }
}));
