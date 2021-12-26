import RestService from './rest-service';
import Dimension from '../models/dimension';
import HierarchyService from './hierarchy-service';
import { caseAndSpaceInsensitiveEquals, fixedEncodeURIComponent } from '../utils/helpers';
import { AxiosResponse } from 'axios';
import { ExistError } from '../errors/exist-error';

/**
 * Service to handle dimension operations in TM1
 */
class DimensionService {

  private http: RestService;
  public hierarchies: HierarchyService;

  constructor(http: RestService) {
    this.http = http;
    this.hierarchies = new HierarchyService(this.http);
  }

  /**
   * Fetch a single dimension along with its hierarchies and related objects from TM1
   * 
   * @param {string} dimensionName The name of the dimension
   * @returns An instance of the `Dimension` model
   */

  async get(dimensionName: string): Promise<Dimension> {
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')?$expand=Hierarchies($expand=*)`);
    return Dimension.fromJson(response);
  }

  /**
   * Fetch all dimensions along with their hierarchies and related objects from TM1
   * 
   * @returns An array of the `Dimension` model
   */

  async getAll(): Promise<Dimension[]> {
    const response = await this.http.GET('/api/v1/Dimensions?$expand=Hierarchies($expand=*)');
    return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
  }

  /**
   * Fetch all dimension names from TM1
   * 
   * @returns An array of dimension naems
   */

  async getAllNames(): Promise<string[]> {
    const response = await this.http.GET('/api/v1/Dimensions?$select=Name');
    return response['value'].map((dimension: any) => dimension['Name']);
  }

  /**
   * Fetch all model dimensions (non-control objects) along with their hierarchies and related objects from TM1
   * 
   * @returns An array of the `Dimension` model
   */

  async getModelDimensions(): Promise<Dimension[]> {
    const response = await this.http.GET('/api/v1/ModelDimensions()?$expand=Hierarchies($expand=*)');
    return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
  }

  /**
   * Fetch all control dimensions along with their hierarchies and related objects from TM1
   * 
   * @returns An array of the `Dimension` model
   */

  async getControlDimensions(): Promise<Dimension[]> {
    const response = await this.http.GET('/api/v1/ControlDimensions()?$expand=Hierarchies($expand=*)');
    return response['value'].map((dimension: any) => Dimension.fromJson(dimension));
  }

  /**
   * Create a dimension in TM1
   * 
   * @param {Dimension} dimension A instance of the `Dimension` model
   * @returns 
   */

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

  /**
   * Update a dimension in TM1
   * 
   * @param {Dimension} dimension An instance of the `Dimension` model
   * @returns
   */

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

  /**
   *  Delete a dimension in TM1
   *  
   * @param {string} dimensionName The name of the dimension to delete
   * @returns 
   */

  async delete(dimensionName: string): Promise<any> {
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')`);
  }

  /**
   * Check if a dimension exists in TM1
   * 
   * @param {string} dimensionName The name of the dimension 
   * @returns {boolean} If the dimension exists
   */

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