import Process from './models/process';
import Subset from './models/subset';
import TM1Service from './services/tm1-service';


(async function() {

    const config = {address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
    const tm1 = await TM1Service.connect(config);


    try {
        // Request goes here        
        const cube = await tm1.cubes.get('Revenue');
        const dimensions = cube.dimensions.map(dim => dim);
        console.log(dimensions);

    } catch (e) {
        console.log(e);
    }
    
})()
