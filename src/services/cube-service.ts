import RestService from './rest-service'
import { Cube } from '../models/cube'
import ViewService from './view-service'
import { MinimumVersion } from '../utils/decorators'
import { FedCellDescriptor, RuleSyntaxError } from '../models/misc'
import CellService from './cell-service'
import { fixedEncodeURIComponent } from '../utils/helpers'

/**
 * Service to handle cube operations in TM1
 */
class CubeService {
  private http: RestService;
  public views: ViewService;
  public cells: CellService;
  constructor (http: RestService) {
    this.http = http
    this.views = new ViewService(http)
    this.cells = new CellService(http)
  }

  /**
   * Fetch a cube and its dimensions from TM1
   *
   * @param {string} cubeName The name of the cube
   * @returns An instance of the `Cube` model
   */

  async get (cubeName: string): Promise<Cube> {
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')?$expand=Dimensions($select=Name)`)
    return Cube.fromJson(response)
  }

  /**
   * Fetch all cubes and their dimensions from TM1
   *
   * @returns An array of the `Cube` model
   */

  async getAll (): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/Cubes?$expand=Dimensions($select=Name)')
    return response['value'].map((cube: any) => Cube.fromJson(cube))
  }

  /**
   * Fetch the name of all cubves from TM1
   *
   * @returns An array of cube names
   */

  async getAllNames (): Promise<string[]> {
    const response = await this.http.GET('/api/v1/Cubes?$select=Name')
    return response['value'].map((cube: { Name: string }) => cube.Name)
  }

  /**
   * Fetch all model cubes (non-control objects) and their dimensions from TM1
   *
   * @returns An array of the `Cube` model
   */

  async getModelCubes (): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/ModelCubes()?$expand=Dimensions($select=Name)')
    return response['value'].map((cube: any) => Cube.fromJson(cube))
  }

  /**
   * Fetch only control cubes and their dimensions from TM1
   *
   * @returns An array of the `Cube` model
   */

  async getControlCubes (): Promise<Cube[]> {
    const response = await this.http.GET('/api/v1/ControlCubes()?$expand=Dimensions($select=Name)')
    return response['value'].map((cube: any) => Cube.fromJson(cube))
  }

  /**
   * Create a cube in TM1
   *
   * @param {Cube} cube An instance of the `Cube` model
   * @returns
   */

  async create (cube: Cube) {
    return this.http.POST('/api/v1/Cubes', cube.body)
  }

  /**
   * Update a cube in TM1 e.g rules in TM1
   *
   * @param {Cube} cube
   * @returns
   */

  async update (cube: Cube) {
    return this.http.PATCH(`/api/v1/Cubes('${fixedEncodeURIComponent(cube.name)}')`, cube.body)
  }

  /**
   * Delete a cube in TM1
   *
   * @param {string} cubeName The name of the cube to delete
   * @returns
   */

  async delete (cubeName: string) {
    return this.http.DELETE(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')`)
  }

  /**
   * Get the dimension names for a cube
   *
   * @param {string} cubeName The name of the cube
   * @returns
   */

  async getDimensionNames (cubeName: string) {
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/Dimensions?$select=Name`)
    return response['value'].map((dim: { Name: string }) => dim.Name)
  }

  /**
   * Validate the syntax of rules for a cube
   *
   * @param {string} cubeName The name of the cube for which rules should be validated
   * @returns
   */

  @MinimumVersion(11.1)
  async checkRules (cubeName: string): Promise<RuleSyntaxError[]> {
    const response = this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.CheckRules`, null)
    return response['value']
  }

  /**
   * Check if a cell is fed
   *
   * @param {string} cubeName The name of the cube
   * @param {string[]} elements The array of element names that define the intersection for the cell
   * @param {string[]} [dimensions]
   * @returns
   */

  @MinimumVersion(11.1)
  async checkFeeders (cubeName: string, elements: string[], dimensions?: string[]): Promise<FedCellDescriptor[]> {
    const _dimensions = dimensions ?? await this.getDimensionNames(cubeName)

    // Construct body consisting of elements that define the cell
    const body = { 'Tuple@odata.bind': [] }

    elements.map((element, i) => {
      const path = `Dimensions('${fixedEncodeURIComponent(_dimensions[i])}')/Hierarchies('${fixedEncodeURIComponent(_dimensions[i])}')/Elements('${fixedEncodeURIComponent(element)}')`
      body['Tuple@odata.bind'].push(path)
    })
    const response = this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.CheckFeeders`, body)
    return response['value']
  }

  /**
   * Check if a cube exists in TM1
   *
   * @param {string} cubeName The name of the cube
   * @returns {boolean} If the cube exists
   */

  async exists (cubeName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')?$select=Name`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      return e
    }
  }
}

export default CubeService
