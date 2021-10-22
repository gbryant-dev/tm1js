import RestService from "./rest-service";
import CubeService from "./cube-service";
import DimensionService from "./dimension-service";
import ProcessService from "./process-service";
import ViewService from "./view-service";
import { SecurityService } from "./security-service";
import ChoreService from "./chore-service";
import CellService from "./cell-service";

class TM1Service {

  private _rest: RestService;
  public cubes: CubeService;
  public dimensions: DimensionService;
  public processes: ProcessService;
  public chores: ChoreService;
  public views: ViewService;
  public security: SecurityService;
  public cells: CellService;
  constructor(rest: RestService) {
    this._rest = rest;
    this.cubes = new CubeService(this._rest);
    this.dimensions = new DimensionService(this._rest);
    this.processes = new ProcessService(this._rest);
    this.chores = new ChoreService(this._rest);
    this.views = new ViewService(this._rest);
    this.security = new SecurityService(this._rest);
    this.cells = new CellService(this._rest);
  }

  static async connect(config: any) {
    const _rest = new RestService(config.address, config.port, config.user, config.password, config.ssl, config.namespace);
    await _rest.startSession(config.user, config.password, config.namespace, config.impersonate);
    return new TM1Service(_rest);
  }

  async logout() {
    return await this._rest.logout()
  }

  get version() {
    return this._rest.version;
  }
}

export default TM1Service;