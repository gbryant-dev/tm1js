import { Hierarchy } from '../models/hierarchy'
import { ElementService } from './element-service'
import { RestService } from './rest-service'
import { SubsetService } from './subset-service'
import { fixedEncodeURIComponent } from '../utils/helpers'

/**
 * Service to handle hierarchy operations in TM1
 */
class HierarchyService {
  private http: RestService;
  public elements: ElementService;
  public subsets: SubsetService;

  constructor (http: RestService) {
    this.http = http
    this.elements = new ElementService(this.http)
    this.subsets = new SubsetService(this.http)
  }

  /**
   * Fetch a single hierarchy from TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns {Hierarchy} An instance of the `Hierarchy` model
   */

  async get (dimensionName: string, hierarchyName: string): Promise<Hierarchy> {
    const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')?$expand=Edges,Elements,ElementAttributes,Subsets,DefaultMember`
    const response = await this.http.GET(url)
    return Hierarchy.fromJson(response)
  }

  /**
   * Fetch all hierarchies for a dimension from TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @returns {Hierarchy[]} An array of instances of the `Hierarchy` model
   */

  async getAll (dimensionName: string): Promise<Hierarchy[]> {
    const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies?$expand=Edges,Elements,ElementAttributes,Subsets,DefaultMember`
    const response = await this.http.GET(url)
    return response['value'].map((hierarchy: any) => Hierarchy.fromJson(hierarchy))
  }

  /**
   * Fetch all hierarchy names for a dimension from TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @returns {string[]} An array of hierarchy names
   */

  async getAllNames (dimensionName: string): Promise<string[]> {
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies?$select=Name`)
    return response['value'].map((hierarchy: any) => hierarchy['Name'])
  }

  /**
   * Create a hierarchy for a dimension in TM1
   *
   * @param {Hierarchy} hierarchy A hierarchy to create. An instance of the `Hierarchy` model
   * @returns
   */

  async create (hierarchy: Hierarchy) {
    const response = await this.http.POST(`/api/v1/Dimensions('${fixedEncodeURIComponent(hierarchy.dimensionName)}')/Hierarchies`, hierarchy.body)
    return response
  }

  /**
   * Update a hierarchy for a dimension in TM1
   *
   * @param {Hierarchy} hierarchy The hierarchy to update. An instance of the `Hierarchy` model
   * @returns
   */

  async update (hierarchy: Hierarchy) {
    const responses = []
    const hierarchyUpdate = await this.http.PATCH(`/api/v1/Dimensions('${fixedEncodeURIComponent(hierarchy.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchy.name)}')`, hierarchy.body)
    responses.push(hierarchyUpdate)
    const attributeUpdate = await this.updateElementAttributes(hierarchy)
    responses.push(attributeUpdate)
    return responses
  }

  /**
   * Delete a hierarchy in a dimension in TM1
   *
   * @param {stirng} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns
   */

  async delete (dimensionName: string, hierarchyName: string) {
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')`)
  }

  /**
   * Update element attributes for a hierarchy
   *
   * @param {string} hierarchy The hierarchy to update. An instance of the `Hierarchy` model
   * @returns
   */

  async updateElementAttributes (hierarchy: Hierarchy) {
    // Get element attributes
    const elementAttributes = await this.elements.getElementAttributes(hierarchy.dimensionName, hierarchy.name)
    const elementAttributeNames = elementAttributes.map(ea => ea.name)

    // Create element attributes that don't exist
    for (const ea of hierarchy.elementAttributes) {
      if (!elementAttributeNames.includes(ea.name)) {
        await this.elements.createElementAttribute(hierarchy.dimensionName, hierarchy.name, ea)
      }
    }

    const names = hierarchy.elementAttributes.map(ea => ea.name)

    // Determine element attributes that should be removed
    for (const eaName of elementAttributeNames) {
      if (!names.includes(eaName)) {
        await this.elements.deleteElementAttribute(hierarchy.dimensionName, hierarchy.name, eaName)
      }
    }
  }

  /**
   * Get the default member for a hierarchy. Will be the element at the first index if one is not set in the }HierarchyProperties cube
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns
   */

  async getDefaultMember (dimensionName: string, hierarchyName: string) {
    return this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/DefaultMember`)
  }

  /**
   * Check if a hierarchy exists
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns {boolean} If the hierarchy exists
   */

  async exists (dimensionName: string, hierarchyName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')?$select=Name`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }
}

export { HierarchyService }
