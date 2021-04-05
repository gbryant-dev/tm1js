import { HierarchyElement } from './models/element';
import Process from './models/process';
import Subset from './models/subset';
import { NativeView } from './models/view';
import TM1Service from './services/tm1-service';
import { ProcessExecuteStatusCode } from './models/misc';


(async function () {

  const config = { address: 'localhost', port: 5000, user: 'admin', password: '', ssl: true };
  const tm1 = await TM1Service.connect(config);

  try {
    
  } catch (e) {
    console.log(e.data);
  }

})()
