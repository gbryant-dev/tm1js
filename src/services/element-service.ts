import {
  ElementResponse,
  ElementsResponse,
  HierarchyElement
} from '../models/element'
import {
  ElementAttribute,
  ElementAttributeResponse,
  ElementAttributesResponse
} from '../models/element-attribute'
import { RestService } from './rest-service'
import { fixedEncodeURIComponent } from '../utils/helpers'

/**
 * Service to handle element operations in TM1
 */
class ElementService {
  private http: RestService
  constructor(http: RestService) {
    this.http = http
  }

  /**
   * Fetch a single element in a hierarchy with its properties and attributes
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} elementName The name of the element
   * @returns {HierarchyElement} An instance of the `HierarchyElement` model
   *
   */
  async get(
    dimensionName: string,
    hierarchyName: string,
    elementName: string
  ): Promise<HierarchyElement> {
    const response = await this.http.GET<ElementResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements('${fixedEncodeURIComponent(elementName)}')?$expand=*`
    )
    return HierarchyElement.fromJson(response.data)
  }

  /**
   * Fetch all elements in a hierarchy with their properties and attributes
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns {HierarchyElement[]} Instances of the `HierarchyElement` model
   *
   */

  async getAll(
    dimensionName: string,
    hierarchyName: string
  ): Promise<HierarchyElement[]> {
    const response = await this.http.GET<ElementsResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements?$expand=*`
    )
    return response.data.value.map((element: ElementResponse) =>
      HierarchyElement.fromJson(element)
    )
  }

  /**
   * Fetch the names of all elements in a hierarchy
   *
   * @param dimensionName The name of the dimension
   * @param hierarchyName The name of the hierarchy
   * @returns {string[]} An array of element names
   */

  async getAllNames(
    dimensionName: string,
    hierarchyName: string
  ): Promise<string[]> {
    const response = await this.http.GET<ElementsResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements?$select=Name`
    )
    return response.data.value.map((element: ElementResponse) => element.Name)
  }

  /**
   * Create an element in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {HierarchyElement} element The element to create. An instance of `HierarchyElement`
   * @returns
   */

  async create(
    dimensionName: string,
    hierarchyName: string,
    element: HierarchyElement
  ): Promise<any> {
    return this.http.POST(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements`,
      element.body
    )
  }

  /**
   * Update an element in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {HierarchyElement} element The element to update. An instance of `HierarchyElement`
   * @returns
   */

  async update(
    dimensionName: string,
    hierarchyName: string,
    element: HierarchyElement
  ): Promise<any> {
    return this.http.PATCH(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements('${fixedEncodeURIComponent(element.name)}')`,
      element.body
    )
  }

  /**
   * Delete an element in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} elementName The name of the element to delete
   * @returns
   */

  async delete(
    dimensionName: string,
    hierarchyName: string,
    elementName: string
  ): Promise<any> {
    return this.http.DELETE(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements('${fixedEncodeURIComponent(elementName)}')`
    )
  }

  /**
   * Fetch all leaf elements in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns {HierarchyElement[]} Instances of the `HierarchyElement` model
   */

  async getAllLeaf(
    dimensionName: string,
    hierarchyName: string
  ): Promise<HierarchyElement[]> {
    const response = await this.http.GET<ElementsResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements?$expand=*&$filter=Type ne 3`
    )
    return response.data.value.map((element: ElementResponse) =>
      HierarchyElement.fromJson(element)
    )
  }

  /**
   * Fetch the names of all leaf elements in a hierarchy
   *
   * @param dimensionName The name of the dimension
   * @param hierarchyName The name of the hierarchy
   * @returns {string[]} An array of element names
   */

  async getAllLeafNames(
    dimensionName: string,
    hierarchyName: string
  ): Promise<string[]> {
    const response = await this.http.GET<ElementsResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/Elements?$select=Name&$filter=Type ne 3`
    )
    return response.data.value.map((element: ElementResponse) => element.Name)
  }

  /**
   * Fetch an element attributes in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @returns {ElementAttribute[]} An array of element attributes. Instances of the `ElementAttribute` model
   */

  async getElementAttributes(
    dimensionName: string,
    hierarchyName: string
  ): Promise<ElementAttribute[]> {
    const response = await this.http.GET<ElementAttributesResponse>(
      `/api/v1/Dimensions('${fixedEncodeURIComponent(
        dimensionName
      )}')/Hierarchies('${fixedEncodeURIComponent(
        hierarchyName
      )}')/ElementAttributes`
    )
    return response.data.value.map((ea: ElementAttributeResponse) =>
      ElementAttribute.fromJson(ea)
    )
  }

  /**
   * Create an element attribute in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {ElementAttribute} elementAttribute The element attribute to create. An instance of the `ElementAttribute` model
   * @returns
   */

  async createElementAttribute(
    dimensionName: string,
    hierarchyName: string,
    elementAttribute: ElementAttribute
  ) {
    const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(
      dimensionName
    )}')/Hierarchies('${fixedEncodeURIComponent(
      hierarchyName
    )}')/ElementAttributes`
    return this.http.POST(url, elementAttribute.body)
  }

  /**
   * Delete an element attribute in a hierarchy
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} elementAttribute The name of the element attribute
   * @returns
   */

  async deleteElementAttribute(
    dimensionName: string,
    hierarchyName: string,
    elementAttribute: string
  ) {
    const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(
      dimensionName
    )}')/Hierarchies('${fixedEncodeURIComponent(
      hierarchyName
    )}')/ElementAttributes('${fixedEncodeURIComponent(elementAttribute)}')`
    return this.http.DELETE(url)
  }

  /**
   * Get the names of elements which have an attribute with a specific value
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} attrName The name of the attribute to filter on
   * @param {string | number} attrValue The value of the attribute to filter by
   * @returns {string[]} An array of element names
   */

  async getElementsFilteredByAttribute(
    dimensionName: string,
    hierarchyName: string,
    attrName: string,
    attrValue: string | number
  ): Promise<string[]> {
    const attr = attrName.replace(/\s/g, '')

    let url = `/api/v1/Dimensions('${fixedEncodeURIComponent(
      dimensionName
    )}')/Hierarchies('${fixedEncodeURIComponent(
      hierarchyName
    )}')/Elements?$select=Name`

    if (typeof attrValue === 'string') {
      url += `&$filter=Attributes/${attr} eq '${attrValue}'`
    } else {
      url += `$filter=Attributes/${attr} eq ${attrValue}`
    }
    const response = await this.http.GET<ElementsResponse>(url)
    return response.data.value.map((element: ElementResponse) => element.Name)
  }
}

export { ElementService }
