import { Semaphore } from 'async-mutex'
import { Context, Next } from 'koa'

const semaphore = new Semaphore(Number(process.env.CONCURRENT_REQUESTS_LIMIT))

export const semaphoreMiddleware = async (_: Context, next: Next) => {
  const [value, release] = await semaphore.acquire()
  console.log(value)
  try {
    await next()
  } finally {
    release()
  }
}
