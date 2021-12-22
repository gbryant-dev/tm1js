import Subset from "../models/subset";
import { fixedEncodeURIComponent } from "../utils/helpers";
import RestService from "./rest-service";


class SubsetService {

  private http: RestService;
  constructor(http: RestService) {
    this.http = http;
  }

  async get(dimensionName: string, hierarchyName: string = null, subsetName: string, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName || dimensionName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')?$select=*,Alias&$expand=Hierarchy($select=Name),Elements($select=Name)`);
    return Subset.fromJson(response);
  }

  async getAllNames(dimensionName: string, hierarchyName: string = null, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName || dimensionName)}')/${subsetType}?$select=Name`);
    return response['value'].map((s: any) => s['Name']);
  }

  async create(subset: Subset, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    return this.http.POST(`/api/v1/Dimensions('${fixedEncodeURIComponent(subset.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(subset.hierarchyName)}')/${subsetType}`, subset.body);
  }

  async update(subset: Subset, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';

    if (subset.isStatic) {
      await this.deleteAllElements(subset.dimensionName, subset.hierarchyName, subset.name)
    }

    return this.http.PATCH(`/api/v1/Dimensions('${fixedEncodeURIComponent(subset.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(subset.hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subset.name)}')`, subset.body);
  }

  async delete(dimensionName: string, hierarchyName: string, subsetName: string, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')`);
  }

  async deleteAllElements(dimensionName: string, hierarchyName: string, subsetName: string, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')/Elements/$ref`);
  }

  async exists(dimensionName: string, hierarchyName: string, subsetName: string, isPrivate: boolean = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets';
    try {
      await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')`);
      return true
    } catch (e) {
      if (e.status === 404) {
        return false;
      }
      throw e
    }

  }

}

export default SubsetService;