import Process from './models/Process';
import TM1Service from './services/TM1Service';


(async function() {

    const config = {address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
    const tm1 = await TM1Service.connect(config);

    try {
        const result = await tm1.processes.exists('ODBC test');
        console.log(result);
        
    } catch (e) {
        console.log(e);
    }
    
})()
