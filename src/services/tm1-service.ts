import RestService from "./rest-service";
import CubeService from "./cube-service";
import DimensionService from "./dimension-service";
import ProcessService from "./process-service";
import ViewService from "./view-service";

class TM1Service {

    private _rest: RestService;
    public cubes: CubeService;
    public dimensions: DimensionService;
    public processes: ProcessService;
    public views: ViewService;
    constructor(rest: RestService) {
        // this._rest = new RestService(rest.address, rest.port, rest.user, rest.password, rest.ssl, rest.namespace); 
        this._rest = rest;
        this.cubes = new CubeService(this._rest);
        this.dimensions = new DimensionService(this._rest);
        this.processes = new ProcessService(this._rest);
        this.views = new ViewService(this._rest);
    }

    static async connect(config: any) {
        const _rest = new RestService(config.address, config.port, config.user, config.password, config.ssl, config.namespace); 
        await _rest.startSession();
        return new TM1Service(_rest);
    }

    get version() {
      return this._rest.version;
    }
}

export default TM1Service;