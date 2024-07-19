import { Context } from 'koa'
import { registerUser, loginUser } from './user.service.js'

export const register = async (ctx: Context) => {
  const { username, password } = ctx.request.body
  await registerUser(username, password)
  ctx.body = 'Registration successful'
}

export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body
  const token = await loginUser(username, password)
  if (token) {
    ctx.body = { token }
  } else {
    ctx.status = 401
    ctx.body = 'Invalid credentials'
  }
}
