import Process from './models/process';
import Subset from './models/subset';
import { NativeView } from './models/view';
import TM1Service from './services/tm1-service';


(async function () {

  const config = { address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
  const tm1 = await TM1Service.connect(config);

  try {
    const response = await tm1.cubes.checkRules('Revenue');
    console.log(response);
  } catch (e) {
    console.log(e);
  }

})()
