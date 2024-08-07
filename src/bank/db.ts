import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: Number(process.env.DB_MAX_POOL),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MILLIS),
})

export default pool
