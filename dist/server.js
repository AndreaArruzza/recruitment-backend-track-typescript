"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware base
app.use(express_1.default.json());
const SPEC_PATH = path_1.default.join(process.cwd(), "./openapi", "/invoice-management-v1.yaml");
const specText = fs_1.default.readFileSync(SPEC_PATH, "utf8");
const openapiDoc = yaml_1.default.parse(specText);
app.use("/swagger-ui", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapiDoc, { explorer: true }));
app.get("/swagger-ui.json", (_req, res) => res.json(openapiDoc));
app.use(OpenApiValidator.middleware({
    apiSpec: SPEC_PATH,
    validateRequests: true,
    validateResponses: true,
}));
app.get("/", (_req, res) => {
    res.send("Hello World!");
});
// Error handler (dopo tutte le route e il validator)
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message, errors: err.errors });
});
app.listen(port, () => {
    console.log(`API ready:    http://localhost:${port}`);
    console.log(`Swagger UI:   http://localhost:${port}/swagger-ui`);
    console.log(`OpenAPI JSON: http://localhost:${port}/swagger-ui.json`);
});
