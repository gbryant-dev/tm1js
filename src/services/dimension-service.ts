import RestService from './rest-service';
import Dimension from '../models/dimension';
import HierarchyService from './hierarchy-service';
import { caseAndSpaceInsensitiveEquals, fixedEncodeURIComponent } from '../utils/helpers';
import { NotExistError } from '../errors/not-exist-error';
import { AxiosResponse } from 'axios';
import { ExistError } from '../errors/exist-error';

class DimensionService {

    private http: RestService;
    public hierarchies: HierarchyService;

    constructor(http: RestService) {
        this.http = http;
        this.hierarchies = new HierarchyService(this.http);
    }

    async get(dimensionName: string): Promise<Dimension> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')?$expand=Hierarchies($expand=*)`);
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

      if (await this.exists(dimension.name)) {
        throw new ExistError('Dimension', dimension.name)
      }

      let response: AxiosResponse<any>

      try {
        // Create dimension
       response = await this.http.POST('/api/v1/Dimensions', dimension.body);
        // Add element attributes
        for (const hierarchy of dimension.hierarchies) {
          if (!caseAndSpaceInsensitiveEquals(hierarchy.name, "leaves")) {
            await this.hierarchies.updateElementAttributes(hierarchy);
          }
        }        
      } catch (e) {
        if (await this.exists(dimension.name)) {
          await this.delete(dimension.name)
        }
        throw e;
      }

      return response;

    }

    async update(dimension: Dimension): Promise<void> {

      const currentHierNames = await this.hierarchies.getAllNames(dimension.name);
  
      // Determine what hierarchies should be removed from the dimension
      const existingHierNames = {}

      for (const hierarchy of dimension.hierarchies) {
        existingHierNames[hierarchy.name] = hierarchy;
      }

      const hierarchiesToRemove = currentHierNames.filter(hierName => !existingHierNames[hierName]);

      // Create or update existing hierarchies 
      for (const hierarchy of dimension.hierarchies) {
        if (!caseAndSpaceInsensitiveEquals(hierarchy.name, 'Leaves')) {
          if (await this.hierarchies.exists(dimension.name, hierarchy.name)) {
            await this.hierarchies.update(hierarchy)
          } else {
            await this.hierarchies.create(hierarchy)
          }
        }
      }
    
      // Delete redundant hierarchies
      for (const hierarchyName of hierarchiesToRemove) {
        if (!caseAndSpaceInsensitiveEquals(hierarchyName, 'Leaves')) {
          await this.hierarchies.delete(dimension.name, hierarchyName);
        }
      }

    }

    async delete(dimensionName: string): Promise<any> {
        return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')`);
    }

    async exists(dimensionName: string): Promise<boolean> {
      try {
          await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')?$select=Name`);
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