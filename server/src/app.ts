import { existsSync } from "node:fs";
import path from "node:path";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { ApiError } from "./errors.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerGuestRoutes } from "./routes/guest.js";
import { Store } from "./store.js";

export interface BuildAppOptions {
  staticDir?: string;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: false });
  void app.register(cors, { origin: true });

  const store = new Store();
  registerGuestRoutes(app, store);
  registerAdminRoutes(app, store);

  const staticDir = options.staticDir ?? path.resolve(import.meta.dirname, "../public");
  if (existsSync(staticDir)) {
    void app.register(fastifyStatic, { root: staticDir });
    app.setNotFoundHandler((req, reply) => {
      if (req.method === "GET" && !req.url.startsWith("/api")) {
        return reply.sendFile("index.html");
      }
      return reply.status(404).send({ code: "not_found", message: "Ресурс не найден" });
    });
  }

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.status).send({ code: error.code, message: error.message });
    }

    const status = error.statusCode ?? 500;

    if (status >= 400 && status < 500) {
      const hasValidation =
        error !== null && typeof error === "object" && "validation" in error;
      return reply.status(status).send({
        code: status === 404 ? "not_found" : "bad_request",
        message: hasValidation ? "Неверные данные" : error.message,
      });
    }

    app.log.error(error);
    return reply.status(status).send({ code: "internal_error", message: "Внутренняя ошибка сервера" });
  });

  return app;
}
