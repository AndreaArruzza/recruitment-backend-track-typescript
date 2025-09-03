import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";
import * as OpenApiValidator from "express-openapi-validator";
import { httpLogger } from "./shared/logger";
import { buildUserRouter } from "./route/user.route.js";
import authRouter from "./route/auth.route.js";
import path from "path";
import { buildInvoiceRouter } from "./route/invoice.route";


const app = express();
const openapiPath = path.join(__dirname, 'config', 'openapi', 'invoice-management-v1.yaml');
const specText = fs.readFileSync(openapiPath, "utf8");
const openapiDoc = YAML.parse(specText);
const port = process.env.PORT || 3000;


// Middleware base
app.use(express.json());

app.use(httpLogger);

app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(openapiDoc, { explorer: true }));

app.get("/swagger-ui.json", (_req, res) => res.json(openapiDoc));

app.use(
  OpenApiValidator.middleware({
    apiSpec: openapiDoc,
    validateRequests: true,
    validateResponses: true,
  })
);


app.use("/users", buildUserRouter());
app.use("/invoices", buildInvoiceRouter());
app.use("/auth", authRouter);


// Error handler
app.use((error: any, _req: any, res: any, _next: any) => {
  console.error(error.stack);
  
  const detail =
    Array.isArray(error.errors) && error.errors.length
      ? error.errors.map((e: any) => e.message).join("; ")
      : (error.detail || error.message);

  const problemDetails = {
    message: error.message,
    status: error.status || 500,
    detail: detail,
  };

  res.status(problemDetails.status).json({...problemDetails});
});

app.listen(port, () => {
  console.log(`API ready:    http://localhost:${port}`);
  console.log(`Swagger UI:   http://localhost:${port}/swagger-ui`);
  console.log(`OpenAPI JSON: http://localhost:${port}/swagger-ui.json`);
});