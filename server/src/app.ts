import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { ApiError } from "./errors.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerGuestRoutes } from "./routes/guest.js";
import { Store } from "./store.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  void app.register(cors, { origin: true });

  const store = new Store();
  registerGuestRoutes(app, store);
  registerAdminRoutes(app, store);

  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.status).send({ code: error.code, message: error.message });
    }
    if (
      error !== null &&
      typeof error === "object" &&
      "validation" in error
    ) {
      return reply.status(400).send({ code: "bad_request", message: "Неверные данные" });
    }
    app.log.error(error);
    return reply.status(500).send({ code: "internal_error", message: "Внутренняя ошибка сервера" });
  });

  return app;
}
