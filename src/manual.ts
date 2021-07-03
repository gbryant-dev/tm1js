import { ViewAxisSelection } from './models';
import Cube from './models/Cube';
import { NativeView } from './models/view';
import TM1Service from './services/tm1-service';


(async function () {

  const config = { address: 'localhost', port: 5000, user: 'admin', password: '', ssl: true };
  
  try {
    const tm1 = await TM1Service.connect(config)  
    const cubes = await tm1.cubes.getModelCubes()
    const names = cubes.map((cube: Cube) => cube.name);
    console.log(names)

  } catch (e) {
    console.log(e);
  }

})()