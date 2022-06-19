/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { TM1Service } from '../src/services/tm1-service'

declare global {
  namespace NodeJS {
    interface Global {
      tm1: TM1Service
    }
  }
}

beforeAll(async () => {
  await getSession()
})

const getSession = async (): Promise<void> => {
  const config = { address: 'localhost', port: 5001, user: 'admin', password: '', ssl: false }
  try {
    global.tm1 = await TM1Service.connect(config)
  } catch (e) {
    console.log({ error: e.message })
    throw new Error('Could not initialise TM1Service for testing!')
  }
}

afterAll(async () => {
  if (global.tm1) {
    await global.tm1.logout()
  }
})
