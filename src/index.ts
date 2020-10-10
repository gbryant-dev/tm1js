import Process from './models/Process';
import Subset from './models/Subset';
import TM1Service from './services/TM1Service';


(async function() {

    const config = {address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
    const tm1 = await TM1Service.connect(config);
    
    try {
        // Request goes here        
    } catch (e) {
        console.log(e);
    }
    
})()
