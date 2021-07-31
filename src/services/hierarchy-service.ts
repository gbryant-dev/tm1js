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
    const responses = [];
    const hierarchyUpdate = await this.http.PATCH(`/api/v1/Dimensions('${hierarchy.dimensionName}')/Hierarchies('${hierarchy.name}')`, hierarchy.body);
    responses.push(hierarchyUpdate);
    const attributeUpdate = await this.updateElementAttributes(hierarchy);
    responses.push(attributeUpdate);
    return responses;
  }

  async delete(dimensionName: string, hierarchyName: string) {
    return this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')`);
  }

  async updateElementAttributes(hierarchy: Hierarchy) {
    // Get element attributes
    const elementAttributes = await this.elements.getElementAttributes(hierarchy.dimensionName, hierarchy.name);
    const elementAttributeNames = elementAttributes.map(ea => ea.name);

    // Create element attributes that don't exist
    for (const ea of hierarchy.elementAttributes) {
      if (!elementAttributeNames.includes(ea.name)) {
        await this.elements.createElementAttribute(hierarchy.dimensionName, hierarchy.name, ea)
      }
    }

    const names = hierarchy.elementAttributes.map(ea => ea.name);

    // Determine element attributes that should be removed
    for (const eaName of elementAttributeNames) {
      if (!names.includes(eaName)) {
        await this.elements.deleteElementAttribute(hierarchy.dimensionName, hierarchy.name, eaName)
      }
    }

  }

  async getDefaultMember (dimensionName: string, hierarchyName: string) {
    return this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/DefaultMember`);
  }

  async exists (dimensionName: string, hierarchyName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')?$select=Name`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false;
      }
      throw e;
    }
  }

}

export default HierarchyService;