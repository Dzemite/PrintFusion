"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
    async update(ctx) {
        const user = ctx.request.body;
        const userId = ctx.request.url.split('/').pop();
        console.log(userId);
        console.log(JSON.stringify({ data: user }, null, 4));
        await strapi.services['api::users-permissions.user'].update(userId, { data: user });
    }
}));
