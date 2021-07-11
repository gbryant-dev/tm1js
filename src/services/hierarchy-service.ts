import Hierarchy from "../models/hierarchy";
import ElementService from "./element-service";
import RestService from "./rest-service";
import SubsetService from "./subset-service";

class HierarchyService {

  private http: RestService;
  public elements: ElementService;
  public subsets: SubsetService;

  constructor(http: RestService) {
    this.http = http;
    this.elements = new ElementService(this.http);
    this.subsets = new SubsetService(this.http);
  }

  
  async get(dimensionName: string, hierarchyName: string) {
    const url = `/api/v1/Dimensions('${encodeURIComponent(dimensionName)}')/Hierarchies('${encodeURIComponent(hierarchyName)}')?$expand=Edges,Elements,ElementAttributes,Subsets,DefaultMember`;
    const response = await this.http.GET(url);
    return Hierarchy.fromJson(response);
  }

  async getAll (dimensionName: string) {
    const url = `/api/v1/Dimensions('${encodeURIComponent(dimensionName)}')/Hierarchies?$expand=Edges,Elements,ElementAttributes,Subsets,DefaultMember`;
    const response = await this.http.GET(url)
    return response['value'].map((hierarchy: any) => Hierarchy.fromJson(hierarchy));
  }
  
  async getAllNames(dimensionName: string): Promise<string[]> {
    const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies?$select=Name`);
    return response['value'].map((hierarchy: any) => hierarchy['Name']);
  }
  
  async create(hierarchy: Hierarchy) {
    const response = await this.http.POST(`/api/v1/Dimensions('${hierarchy.dimensionName}')/Hierarchies`, hierarchy.body);
    return response;
  }

  async update(hierarchy: Hierarchy) {
    const body = hierarchy.body;
    // del body['Edges'];
    const response = await this.http.PATCH(`/api/v1/Dimensions('${hierarchy.dimensionName}')/Hierarchies('${hierarchy.name}')`, body);  
    return response;
  }

  async delete(dimensionName: string, hierarchyName: string) {
    return this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')`);
  }

  async getDefaultMember (dimensionName: string, hierarchyName: string) {
    return this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/DefaultMember`);
  }

}

export default HierarchyService;