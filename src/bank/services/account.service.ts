import { Mutex } from 'async-mutex'
import pool from '../db.js'

const mutex = new Mutex()

export const deposit = async (accountNumber: string, amount: number) => {
  return mutex.runExclusive(async () => {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT id FROM accounts WHERE account_number = $1', [
        accountNumber,
      ])
      const accountId = result.rows[0].id
      await client.query('UPDATE accounts SET balance = balance + $1 WHERE account_number = $2', [
        amount,
        accountNumber,
      ])
      await client.query(
        'INSERT INTO transactions (account_id, type, amount) VALUES ($1, $2, $3)',
        [accountId, 'deposit', amount]
      )
    } finally {
      client.release()
    }
  })
}

export const withdraw = async (accountNumber: string, amount: number) => {
  return mutex.runExclusive(async () => {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT id, balance FROM accounts WHERE account_number = $1',
        [accountNumber]
      )
      const accountId = result.rows[0].id
      const balance = result.rows[0].balance
      if (balance >= amount) {
        await client.query('UPDATE accounts SET balance = balance - $1 WHERE account_number = $2', [
          amount,
          accountNumber,
        ])
        await client.query(
          'INSERT INTO transactions (account_id, type, amount) VALUES ($1, $2, $3)',
          [accountId, 'withdraw', amount]
        )
      } else {
        throw new Error('Insufficient funds')
      }
    } finally {
      client.release()
    }
  })
}

export const transfer = async (fromAccount: string, toAccount: string, amount: number) => {
  return mutex.runExclusive(async () => {
    const client = await pool.connect()
    try {
      const fromResult = await client.query(
        'SELECT id, balance FROM accounts WHERE account_number = $1',
        [fromAccount]
      )
      const fromAccountId = fromResult.rows[0].id
      const fromBalance = fromResult.rows[0].balance

      const toResult = await client.query('SELECT id FROM accounts WHERE account_number = $1', [
        toAccount,
      ])
      const toAccountId = toResult.rows[0].id

      if (fromBalance >= amount) {
        await client.query('UPDATE accounts SET balance = balance - $1 WHERE account_number = $2', [
          amount,
          fromAccount,
        ])
        await client.query('UPDATE accounts SET balance = balance + $1 WHERE account_number = $2', [
          amount,
          toAccount,
        ])
        await client.query(
          'INSERT INTO transactions (account_id, type, amount) VALUES ($1, $2, $3)',
          [fromAccountId, 'transfer_out', amount]
        )
        await client.query(
          'INSERT INTO transactions (account_id, type, amount) VALUES ($1, $2, $3)',
          [toAccountId, 'transfer_in', amount]
        )
      } else {
        throw new Error('Insufficient funds')
      }
    } finally {
      client.release()
    }
  })
}

export const getBalance = async (accountNumber: string): Promise<number> => {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT balance FROM accounts WHERE account_number = $1', [
      accountNumber,
    ])
    return result.rows[0].balance
  } finally {
    client.release()
  }
}
