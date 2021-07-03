import TM1Service from '../src/services/tm1-service';


console.log('Running test setup!');


declare global {
  namespace NodeJS {
    interface Global {
      tm1: TM1Service
    }
  }
}


beforeAll (async () => {
  console.log('Connecting to TM1...');
  await getSession()

});


const getSession = async (): Promise<void> => {
  const config = { address: 'localhost', port: 5000, user: 'admin', password: '', ssl: true };
  global.tm1 = await TM1Service.connect(config);
}

afterAll(async() => {
 // Logout
  if (global.tm1) {
    console.log('Logging out...')
    await global.tm1.logout()
  }
});