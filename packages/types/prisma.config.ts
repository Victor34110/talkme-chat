import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
})