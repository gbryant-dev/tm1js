import RestService from "./RestService";
import CubeService from "./cubeService";
import DimensionService from "./DimensionService";
import ProcessService from "./ProcessService";

class TM1Service {

    private _rest: RestService;
    public cubes: CubeService;
    public dimensions: DimensionService;
    public processes: ProcessService;
    constructor(rest: RestService) {
        // this._rest = new RestService(rest.address, rest.port, rest.user, rest.password, rest.ssl, rest.namespace); 
        this._rest = rest;
        this.cubes = new CubeService(this._rest);
        this.dimensions = new DimensionService(this._rest);
        this.processes = new ProcessService(this._rest);
    }

    static async connect(config: any) {
        const _rest = new RestService(config.address, config.port, config.user, config.password, config.ssl, config.namespace); 
        await _rest.startSession();
        return new TM1Service(_rest);
    }
}

export default TM1Service;