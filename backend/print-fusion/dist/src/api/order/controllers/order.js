"use strict";
/**
 * order controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const strapi_1 = require("@strapi/strapi");
const { ValidationError, ApplicationError } = utils_1.errors;
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
    },
    async update(ctx) {
        const order = ctx.request.body;
        order.data.user = ctx.state.user.id;
        try {
            /**
             * Find old order and calculate old order weight
             */
            const orderId = ctx.request.url.split('/').pop();
            const queryOrder = { filters: { id: { '$eq': orderId } }, populate: '*' };
            const oldOrder = await strapi.service('api::order.order').find(queryOrder);
            const oldPlastic = oldOrder.results[0].plastic.id;
            const oldItemWeight = oldOrder.results[0].weight;
            const oldItemCount = oldOrder.results[0].itemCount;
            const oldOrderWeight = oldItemWeight * oldItemCount;
            const { plastic, itemCount, weight } = order.data;
            const newOrderWeight = weight * (itemCount !== null && itemCount !== void 0 ? itemCount : 1);
            if (oldPlastic === plastic) {
                const orderWeightDifference = (newOrderWeight - oldOrderWeight);
                if (orderWeightDifference) {
                    return updatePlasicWeight(orderWeightDifference, plastic).then(res => {
                        return super.update(ctx);
                    }).catch(err => {
                        return new ApplicationError(err);
                    });
                }
                ;
            }
            else {
                return updatePlasicWeight(newOrderWeight, plastic).then(res => {
                    // Возвращаем пластик обратно в хранилище
                    return updatePlasicWeight(-oldOrderWeight, oldPlastic).then(res => {
                        return super.update(ctx);
                    }).catch(err => {
                        return new ApplicationError(err);
                    });
                }).catch(err => {
                    return new ApplicationError(err);
                });
            }
        }
        catch (error) {
            console.error(error);
            return new ApplicationError(error);
        }
    }
}));
/**
 * Find and update storage of plastic, decrease weight
 */
async function updatePlasicWeight(weightDifference, plasticId) {
    try {
        const query = { filters: { id: { '$eq': plasticId } } };
        const storageForUpdate = await strapi.service('api::storage.storage').find(query);
        const newWeight = storageForUpdate.results[0].weight - weightDifference;
        if (newWeight < 0) {
            return Promise.reject('Not enough plastic in stock.');
        }
        else {
            return await strapi.services['api::storage.storage'].update(plasticId, { data: { weight: newWeight } });
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
}
