import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

export const registerUser = async (username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const client = await pool.connect()
  try {
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      username,
      hashedPassword,
    ])
  } finally {
    client.release()
  }
}

export const loginUser = async (username: string, password: string): Promise<string | null> => {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]
    if (user && (await bcrypt.compare(password, user.password))) {
      return jwt.sign({ id: user.id, username: user.username }, 'secretKey')
    }
    return null
  } finally {
    client.release()
  }
}
