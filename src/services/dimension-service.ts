import RestService from './rest-service';
import Dimension from '../models/dimension';
import HierarchyService from './hierarchy-service';

class DimensionService {

    private http: RestService;
    public hierarchies: HierarchyService;

    constructor(http: RestService) {
        this.http = http;
        this.hierarchies = new HierarchyService(this.http);
    }

    async get(dimensionName: string): Promise<Dimension> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')?$expand=Hierarchies($expand=*)`);
        return Dimension.fromJson(response);
    }

    async getAll(): Promise<Dimension[]> {
      const response = await this.http.GET('/api/v1/Dimensions?$expand=Hierarchies($expand=*)');
      return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
    }

    async getAllNames(): Promise<string[]> {
      const response = await this.http.GET('/api/v1/Dimensions?$select=Name');
      return response['value'].map((dimension: any) => dimension['Name']);
    }

    async getModelDimensions(): Promise<Dimension[]> {
      const response = await this.http.GET('/api/v1/ModelDimensions()?$expand=Hierarchies($expand=*)');
      return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
    }

    async getControlDimensions(): Promise<Dimension[]> {
      const response = await this.http.GET('/api/v1/ControlDimensions()?$expand=Hierarchies($expand=*)');
      return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
    }

    async create(dimension: Dimension): Promise<any> {
        return this.http.POST('/api/v1/Dimensions', dimension.body);
    }

    async update(dimension: Dimension): Promise<any> {
        return this.http.PATCH(`/api/v1/Dimensions('${dimension.name}')`, dimension.body);
    }

    async delete(dimensionName: string): Promise<any> {
        return this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')`);
    }

    async exists(dimensionName: string): Promise<boolean> {
      try {
          await this.http.GET(`/api/v1/Dimensions('${dimensionName}')?$select=Name`);
          return true;
      } catch (e) {
          if (e.status === 404) {
              return false;
          }
          return e;
      }
  }

}

export default DimensionService;