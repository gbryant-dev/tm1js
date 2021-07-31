import RestService from './rest-service';
import Dimension from '../models/dimension';
import HierarchyService from './hierarchy-service';
import { caseAndSpaceInsensitiveEquals } from '../utils/helpers';
import { NotExistError } from '../errors/not-exist-error';
import { AxiosResponse } from 'axios';
import CaseAndSpaceInsensitiveMap from '../utils/case-and-space-insensitive-map';
import Hierarchy from '../models/hierarchy';

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

      if (await this.exists(dimension.name)) {
        throw new NotExistError('Dimension', dimension.name)
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
        console.log('An error occurred when creating dimension')
        if (await this.exists(dimension.name)) {
          await this.delete(dimension.name)
        }
        throw e;
      }

      return response;

    }

    async update(dimension: Dimension): Promise<void> {
      
      // Delete hierarchies that have been removed from the dimension
      const hierarchyNames = await this.hierarchies.getAllNames(dimension.name);

      for (const hierarchy of dimension.hierarchies) {
        if (!hierarchyNames.includes(hierarchy.name)) {
          if (!hierarchy.isLeavesHierarchy()) {
            await this.hierarchies.delete(dimension.name, hierarchy.name)
          }
        }
      }

      // Create or update existing hierarchies
      for (const hierarchy of dimension.hierarchies) {
        if (!hierarchy.isLeavesHierarchy()) {
          if (await this.hierarchies.exists(hierarchy.dimensionName, hierarchy.name)) {
            await this.hierarchies.update(hierarchy)
          } else {
            await this.hierarchies.create(hierarchy)
          }
        }
      }

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