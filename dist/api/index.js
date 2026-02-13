"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("../src/app.module");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let appPromise = null;
function bootstrap() {
    if (!appPromise) {
        appPromise = (async () => {
            const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
            app.enableCors();
            app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
            await app.init();
        })();
    }
    return appPromise;
}
async function handler(req, res) {
    await bootstrap();
    server(req, res);
}
//# sourceMappingURL=index.js.map