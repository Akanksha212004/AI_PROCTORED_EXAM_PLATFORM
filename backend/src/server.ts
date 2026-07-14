import { app } from "./app";
import { env } from "./core/config";
import { prisma } from "./db/prisma";

async function main() {
  await prisma.$connect();
  console.log("✅ Connected to PostgreSQL");

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API running on http://localhost:${env.PORT}${env.API_V1_PREFIX}`);
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
