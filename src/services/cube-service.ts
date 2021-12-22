import RestService from './rest-service';
import Cube from '../models/cube';
import ViewService from './view-service';
import { MinimumVersion } from '../utils/decorators';
import { HierarchyElement } from '../models/element';
import { FedCellDescriptor, RuleSyntaxError } from '../models/misc';
import CellService from './cell-service';
import { fixedEncodeURIComponent } from '../utils/helpers';

class CubeService {

  private http: RestService;
  public views: ViewService;
  public cells: CellService;
  constructor(http: RestService) {
    this.http = http;
    this.views = new ViewService(http);
    this.cells = new CellService(http);
  }

  async get(cubeName: string): Promise<Cube> {
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')?$expand=Dimensions($select=Name)`);
    return Cube.fromJson(response);
  }

  async getAll(): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/Cubes?$expand=Dimensions($select=Name)');
    return response['value'].map((cube: any) => Cube.fromJson(cube));
  }

  async getAllNames(): Promise<string[]> {
    const response = await this.http.GET('/api/v1/Cubes?$select=Name');
    return response['value'].map((cube: { Name: string }) => cube.Name);
  }

  async getModelCubes(): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/ModelCubes()?$expand=Dimensions($select=Name)');
    return response['value'].map((cube: any) => Cube.fromJson(cube));
  }

  async getControlCubes(): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/ControlCubes()?$expand=Dimensions($select=Name)');
    return response['value'].map((cube: any) => Cube.fromJson(cube));
  }

  async create(cube: Cube) {
    return this.http.POST('/api/v1/Cubes', cube.body);
  }

  async update(cube: Cube) {
    return this.http.PATCH(`/api/v1/Cubes('${fixedEncodeURIComponent(cube.name)}')`, cube.body);
  }

  async delete(cubeName: string) {
    return this.http.DELETE(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')`);
  }

  async getDimensionNames(cubeName: string) {
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/Dimensions?$select=Name`);
    return response['value'].map((dim: { Name: string }) => dim.Name);
  }

  @MinimumVersion(11.1)
  async checkRules(cubeName: string): Promise<RuleSyntaxError[]> {
    const response = this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.CheckRules`, null);
    return response['value'];
  }

  @MinimumVersion(11.1)
  async checkFeeders(cubeName: string, elements: HierarchyElement[]): Promise<FedCellDescriptor[]> {
    // Construct body consisting of elements that define the cell
    const body = { 'Tuple@odata.bind': [] };

    elements.map(element => {
      const path = `Dimensions('${fixedEncodeURIComponent(element.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(element.hierarchyName)}')/Elements('${fixedEncodeURIComponent(element.name)}')`;
      body['Tuple@odata.bind'].push(path);
    });
    const response = this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.CheckFeeders`, body);
    return response['value'];
  }

  async exists(cubeName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')?$select=Name`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false;
      }
      return e;
    }
  }

}

export default CubeService;