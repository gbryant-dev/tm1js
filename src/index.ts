import { HierarchyElement } from './models/element';
import Process from './models/process';
import Subset from './models/subset';
import { NativeView } from './models/view';
import TM1Service from './services/tm1-service';


(async function () {

  const config = { address: 'localhost', port: 5000, user: 'admin', password: '', ssl: true };
  const tm1 = await TM1Service.connect(config);

  try {
    // let process  = new Process('Test', true);
    // process = await tm1.processes.create(process); 
    let process = await tm1.processes.get('Test');
    console.log(process);
    process.removeVariable('measur');


    
    // process.addParameter('pDebug', '', 0);
    // process.addVariable('Measure', "Numeric");
    process = await tm1.processes.update(process);
    console.log(process);


    
  } catch (e) {
    console.log(e);
  }

})()
