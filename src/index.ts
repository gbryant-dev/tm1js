import Process from './models/process';
import Subset from './models/subset';
import { NativeView } from './models/view';
import TM1Service from './services/tm1-service';


(async function () {

  const config = { address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
  const tm1 = await TM1Service.connect(config);
  const viewService = tm1.views;

  try {
    // Request goes here   
    const view = await viewService.get('Revenue', 'Default 2') as NativeView;
    view.suppressEmptyCells();
    console.log(view.body);
    const response = await viewService.update('Revenue', view);
    console.log(response);


  } catch (e) {
    console.log(e);
  }

})()
