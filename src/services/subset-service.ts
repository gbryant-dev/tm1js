import { Subset } from '../models/subset'
import { fixedEncodeURIComponent } from '../utils/helpers'
import { RestService } from './rest-service'

/**
 * Service to handle operations on subsets in TM1
 */
class SubsetService {
  private http: RestService;
  constructor (http: RestService) {
    this.http = http
  }

  /**
   * Fetch a single public or private subset along with its properties and elements from TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} subsetName The name of the subset
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns {Subset} An instance of the `Subset` model
   */

  async get (dimensionName: string, hierarchyName: string = null, subsetName: string, isPrivate = false): Promise<Subset> {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName || dimensionName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')?$select=*,Alias&$expand=Hierarchy($select=Name),Elements($select=Name)`)
    return Subset.fromJson(response)
  }

  /**
   * Fetch the names of all public or private subsets in a hierarchy from TM1
   *
   * @param dimensionName The name of the dimension
   * @param hierarchyName The name of the hierarchy
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns {string[]} An array of subset names
   */

  async getAllNames (dimensionName: string, hierarchyName: string = null, isPrivate = false): Promise<string[]> {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName || dimensionName)}')/${subsetType}?$select=Name`)
    return response['value'].map((s: any) => s['Name'])
  }

  /**
   * Create a public or private subset in TM1
   *
   * @param {Subset} subset The subset to create. An instance of the `Subset` model
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns
   */

  async create (subset: Subset, isPrivate = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    return this.http.POST(`/api/v1/Dimensions('${fixedEncodeURIComponent(subset.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(subset.hierarchyName)}')/${subsetType}`, subset.body)
  }

  /**
   * Update a public or private subset in TM1
   *
   * @param {Subset} subset The subset to update. An instance of the `Subset` model
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns
   */

  async update (subset: Subset, isPrivate = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'

    if (subset.isStatic) {
      await this.deleteAllElements(subset.dimensionName, subset.hierarchyName, subset.name)
    }

    return this.http.PATCH(`/api/v1/Dimensions('${fixedEncodeURIComponent(subset.dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(subset.hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subset.name)}')`, subset.body)
  }

  /**
   * Delete a public or private subset in TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} subsetName The name of the subset
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns
   */

  async delete (dimensionName: string, hierarchyName: string, subsetName: string, isPrivate = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')`)
  }

  /**
   * Delete all elements in a public or private subset in TM1
   *
   * @param {string} dimensionName The name of the dimension
   * @param {string} hierarchyName The name of the hierarchy
   * @param {string} subsetName The name of the subset
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns
   */

  async deleteAllElements (dimensionName: string, hierarchyName: string, subsetName: string, isPrivate = false) {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    return this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')/Elements/$ref`)
  }

  /**
   * Check if a public or private subset exists in TM1
   *
   * @param dimensionName The name of the dimension
   * @param hierarchyName The name of the hierarchy
   * @param subsetName The name of the subset
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) subset. Defaults to a public subset
   * @returns {boolean} If the subset exists
   */

  async exists (dimensionName: string, hierarchyName: string, subsetName: string, isPrivate = false): Promise<boolean> {
    const subsetType = isPrivate ? 'PrivateSubsets' : 'Subsets'
    try {
      await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/${subsetType}('${fixedEncodeURIComponent(subsetName)}')`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }
}

export { SubsetService }
