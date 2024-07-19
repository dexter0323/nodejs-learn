import { bodyParser } from '@koa/bodyparser'
import Router from '@koa/router'
import Koa from 'koa'
import {
  checkBalance,
  depositMoney,
  transferMoney,
  withdrawMoney,
} from './controllers/account.controller.js'
import { semaphoreMiddleware } from './middlewares/semaphore.js'
import { login, register } from './services/auth.service.js'

const app = new Koa()
const router = new Router()

app.use(bodyParser())
router.post('/register', register)
router.post('/login', login)
router.post('/deposit', semaphoreMiddleware, depositMoney)
router.post('/withdraw', semaphoreMiddleware, withdrawMoney)
router.post('/transfer', semaphoreMiddleware, transferMoney)
router.get('/balance/:accountNumber', checkBalance)
app.use(router.routes()).use(router.allowedMethods())

app.listen(Number(process.env.PORT), process.env.HOST, () =>
  console.info(`API running on http://${process.env.HOST + ':' + process.env.PORT}/`)
)
