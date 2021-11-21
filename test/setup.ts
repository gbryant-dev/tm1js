import TM1Service from '../src/services/tm1-service';

declare global {
  namespace NodeJS {
    interface Global {
      tm1: TM1Service
    }
  }
}


beforeAll(async () => {
  await getSession()

});


const getSession = async (): Promise<void> => {
  const config = { address: 'localhost', port: 5000, user: 'admin', password: 'admin', ssl: false };
  global.tm1 = await TM1Service.connect(config);
}

afterAll(async () => {
  // Logout
  if (global.tm1) {
    await global.tm1.logout()
  }
});