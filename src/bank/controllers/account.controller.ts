import { Context } from 'koa'
import { deposit, withdraw, transfer, getBalance } from '../services/account.service.js'

export const depositMoney = async (ctx: Context) => {
  const { accountNumber, amount } = ctx.request.body
  await deposit(accountNumber, amount)
  ctx.body = 'Deposit successful'
}

export const withdrawMoney = async (ctx: Context) => {
  const { accountNumber, amount } = ctx.request.body
  await withdraw(accountNumber, amount)
  ctx.body = 'Withdrawal successful'
}

export const transferMoney = async (ctx: Context) => {
  const { fromAccount, toAccount, amount } = ctx.request.body
  await transfer(fromAccount, toAccount, amount)
  ctx.body = 'Transfer successful'
}

export const checkBalance = async (ctx: Context) => {
  const { accountNumber } = ctx.params
  const balance = await getBalance(accountNumber)
  ctx.body = { balance }
}
