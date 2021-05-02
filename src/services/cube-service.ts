import RestService from './rest-service';
import Cube from '../models/cube';
import ViewService from './view-service';
import { MinimalVersion } from '../utils/decorators';
import { HierarchyElement } from '../models/element';
import { FedCellDescriptor, RuleSyntaxError } from '../models/misc';


class CubeService {

    private http: RestService;
    public views: ViewService;
    constructor(http: RestService) {
        this.http = http;
        this.views = new ViewService(http);
    }

    async get(cubeName: string): Promise<Cube> {
        const response = await this.http.GET(`/api/v1/Cubes('${cubeName}')?$expand=Dimensions($select=Name)`);
        return Cube.fromJson(response);
    }

    async getAll(): Promise<Cube[]> {
        const response = await this.http.GET('/api/v1/Cubes?$expand=Dimensions($select=Name)');
        return response['value'].map((cube: any) => Cube.fromJson(cube));
    }

    async create(cube: Cube) {
        return this.http.POST('/api/v1/Cubes', cube.body);
    }

    async update(cube: Cube) {
        return this.http.PATCH(`/api/v1/Cubes('${cube.name}')`, cube.body);
    }

    async delete(cubeName: string) {
        return this.http.DELETE(`/api/v1/Cubes('${cubeName}')`);
    }

    @MinimalVersion(11.1)
    async checkRules(cubeName: string): Promise<RuleSyntaxError[]> {
      const response = this.http.POST(`/api/v1/Cubes('${cubeName}')/tm1.CheckRules`, null);
      return response['value'];
    }

    @MinimalVersion(11.1)
    async checkFeeders(cubeName: string, elements: HierarchyElement[]): Promise<FedCellDescriptor[]> {
      // Construct body consisting of elements that define the cell
      const body = { 'Tuple@odata.bind': [] };

      elements.map(element => {
        const path = `Dimensions('${element.dimensionName}')/Hierarchies('${element.hierarchyName}')/Elements('${element.name}')`;
        body['Tuple@odata.bind'].push(path);
      });
      console.log(body);
      const response = this.http.POST(`/api/v1/Cubes('${cubeName}')/tm1.CheckFeeders`, body);
      return response['value'];
    }

}

export default CubeService;