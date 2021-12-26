import { ViewContext } from "../models";
import { RemoveCellset } from "../utils/decorators";
import CubeService from "./cube-service";
import RestService from "./rest-service";
import { fixedEncodeURIComponent } from "../utils/helpers";

/**
 * @property {string[]} [cellProperties] A list of cell properties
 * @property {string[]} [memberProperties] A list of member properties
 * @property {number} [top] Limit the number of cells returned
 * @property {number} [skip] Start from the nth cell 
 * @property {boolean} [deleteCellset] 
 * @property {boolean} [skipContexts] If the cellset should include dimensions in the context / title area or not
 * @property {boolean} [skipZeros] If the cellset should include zero values or not
 * @property {boolean} [skipConsolidated] If the cellset should include consolidated cells or not
 * @property {boolean} [skipRuleDerived] If the cellset should include rule calculated cells or not
 * @property {boolean} [includeHierarchies] If the Tuples in the cellset should include information on hierarcies or not 
 */
export interface CellsetQueryOptions {
  cellProperties?: string[],
  memberProperties?: string[],
  top?: number, 
  skip?: number,
  deleteCellset?: boolean,
  skipContexts?: boolean,
  skipZeros?: boolean,
  skipConsolidated?: boolean,
  skipRuleDerived?: boolean,
  includeHierarchies?: boolean
}


/**
 * Service to handle read and write operations in TM1
 */
class CellService {

  private http: RestService

  /**
   * @property {RestService} http An instance of the RestService
   */
  constructor(http: RestService) {
    this.http = http;
  }

  /**
   * Execute a view in TM1. Works for both NativeView and MDXView
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @param {CellsetQueryOptions} [options]  
   * @returns 
   */

  async executeView(
    cubeName: string, 
    viewName: string, 
    isPrivate: boolean = false,
    options?: CellsetQueryOptions,
  ) {
    const cellsetID = await this.createCellsetFromView(cubeName, viewName, isPrivate);
    return this.extractCellset(cellsetID, options);
  }

  /**
   * Execute a view in TM1 and return just the values. Works for both NativeView and MDXView
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a Public (false) view
   * @param {CellsetQueryOptions} [options]  
   * @returns 
   */

  async executeViewValues(cubeName: string, viewName: string, isPrivate: boolean = false, options?: CellsetQueryOptions) {
    const cellsetID = await this.createCellsetFromView(cubeName, viewName, isPrivate);
    return this.extractCellsetValues(cellsetID);
  }

  /**
   * Execute a MDX query and returns the result
   * 
   * @param {string} mdx A valid MDX query
   * @param {CellsetQueryOptions} [options] 
   * @returns 
   */
  async executeMDX(
    mdx: string, 
    options?: CellsetQueryOptions
  ) {
    const cellsetID = await this.createCellset(mdx); 
    return this.extractCellset(cellsetID, options);
  }

  /**
   * Execute a MDX query and returns just the values
   * 
   * @param {string} mdx A valid MDX query 
   * @returns 
   */
  async executeMDXValues(mdx: string) {
    const cellsetID = await this.createCellset(mdx);
    return this.extractCellsetValues(cellsetID);
  }

  /**
   * Get a single value from a cube
   * 
   * @param {string} cubeName The name of the cube
   * @param {string[]} elements Array of element names that define the intersection of the cell to fetch
   * Use :: to use a alternative hierarchy and && to target multiple hierarchies for the same dimension
   * @param {string[]} [dimensions]
   * @returns 
   */
  async getValue(cubeName: string, elements: string[], dimensions?: string[]) {
 
    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName)

    const _buildSetFromElementString = (dimension: string, el: string): string[] => {
      const sets = []

      const isSingleHierarchy = el.indexOf('&&') == -1
      const parts = isSingleHierarchy ? [el] : el.split('&&')
      
      for (const part of parts) {

        // Check for hierarchy delimiter
        const isDefaultHierarchy = part.indexOf('::') == -1
  
        // Determine dimension, hierarchy, element arrangement
        const [hierarchy, element] = isDefaultHierarchy ? [dimension, part] : part.split('::')
        const set = `{[${dimension}].[${hierarchy}].[${element}]}`
        sets.push(set)

      }

      return sets
    }
    // Build MDX statement 
    const columns = []

    // Loop through elements
    elements.forEach((el, i) => {
      const dimension = _dimensions[i]

      const sets = _buildSetFromElementString(dimension, el)
      columns.push(...sets)
    })

    const mdx = `SELECT
      {${columns.join('*')}} ON COLUMNS
      FROM [${cubeName}]
    `;

    // Return result of executeMDX call
    return this.executeMDX(mdx)

  }

  /**
   * Write a single value back to a cube
   * 
   * @param {string | number} value The value to write
   * @param {string} cubeName The name of cube
   * @param {string[]} elements An array of elements as strings that defines the intersection of the cell
   * @param {string[]} [dimensions]
   * @returns 
   */
  async writeValue(value: string | number, cubeName: string, elements: string[], dimensions?: string[]) {

    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);

    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.Update`
    const body = {
      Cells: [{
        'Tuple@odata.bind': elements.map((element, i) => `Dimensions('${_dimensions[i]}')/Hierarchies('${_dimensions[i]}')/Elements('${element}')`)
      }],
      Value: value
    }
    return this.http.POST(url, body)
  }

  /**
   * Write values back through a cube. For updates > 1000, use writeValuesThroughCellset
   * 
   * @param {string} cubeName The name of the cube
   * @param {Map<string[], string | number} cellsetAsMap A map with an array of string keys for elements
   * @param {string[]} [dimensions] 
   * @returns 
   */
  async writeValues(cubeName: string, cellsetAsMap: Map<string[], string | number>, dimensions?: string[]) {
  
    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);
  
    const updates = []

    cellsetAsMap.forEach((value, tuple) => {
      const update = {
        Cells: [{
          'Tuple@odata.bind': tuple.map((element, i) => `Dimensions('${fixedEncodeURIComponent(_dimensions[i])}')/Hierarchies('${fixedEncodeURIComponent(_dimensions[i])}')/Elements('${fixedEncodeURIComponent(element)}')`)
        }],
        Value: value  
      }
      updates.push(update)
    })
    
    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/tm1.Update`
    return this.http.POST(url, updates)
  }

  /**
   * Creates a cellset from an MDX statement
   * 
   * @param {string} mdx A valid MDX statement
   * @returns {string} The ID of the cellset
   */
  async createCellset(mdx: string): Promise<string> {
    const url = '/api/v1/ExecuteMDX';
    const response = await this.http.POST(url, { MDX: mdx })
    return response['ID']
  }

  /**
   * Creates a cellset from a view
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns {string} The ID of the cellset
   */
  async createCellsetFromView(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<string> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')/tm1.Execute`;
    const response = await this.http.POST(url, null);
    return response['ID']
  }


  /**
   * Extract Cube, Axes and Cells from the Cellset. 
   * 
   * @param {string} cellsetID 
   * @param {CellsetQueryOptions} options
   * @returns Cellset
   */
  @RemoveCellset()
  async extractCellset(
    cellsetID: string, 
     {
      cellProperties = ['Value'],
      memberProperties = ['UniqueName'],
      top = null,
      skip = null,
      deleteCellset = true,
      skipContexts = false,
      skipZeros = false,
      skipConsolidated = false,
      skipRuleDerived = false,
      includeHierarchies = true
    }: CellsetQueryOptions = {}
  ) {
    
    const baseUrl = `/api/v1/Cellsets('${fixedEncodeURIComponent(cellsetID)}')?$expand=Cube($select=Name;$expand=Dimensions($select=Name))`;

    const filterAxis  = skipContexts ? `$filter=Ordinal ne 2;` : '';
    
    const memberProps = `$select=${memberProperties.join(',')}`
    const expandHierarchies = includeHierarchies ? `,Hierarchies($select=Name;$expand=Dimension($select=Name))` : '';

    const selectCells = `$select=${cellProperties.join(',')}`;
    const topCells =  top ? `$top=${top}` : '';
    const skipCells = skip ? `$skip=${skip}` : ''; 
    
    const cellFilters = [];
    if (skipZeros || skipConsolidated || skipRuleDerived) {
      if (skipZeros) {
        cellFilters.push(`Value ne 0 and Value ne null and Value ne ''`)
      }
      if (skipConsolidated) {
        cellFilters.push('Consolidated eq false')
      }
      if (skipRuleDerived) {
        cellFilters.push('RuleDerived eq false')
      }
    }

    const filterCells = cellFilters.length > 0 ? `$filter=${cellFilters.join(' and ')}` : ''
    const cellQuery = [selectCells, filterCells, topCells, skipCells].filter(f => f.length > 0).join(';')

    const url = `${baseUrl},Axes(${filterAxis}$expand=Tuples($expand=Members(${memberProps}))${expandHierarchies}),Cells(${cellQuery})`

    return this.http.GET(url);
  }

  /**
   * Extract just the values from the cells in the Cellset
   * 
   * @param {string} cellsetID The ID of the cellset 
   * @param {{ deleteCellset: boolean }} options
   * @returns
   */
  @RemoveCellset()
  async extractCellsetValues(cellsetID: string, { deleteCellset = true }: { deleteCellset?: boolean } = {}) {

    const url = `/api/v1/Cellsets('${fixedEncodeURIComponent(cellsetID)}')?$expand=Cells($select=Value)`;
    const response = await this.http.GET(url);
    return response['Cells'].map(cell => cell.Value);
  }

  /**
   * Extract specific properties from the cells in the cellset 
   * 
   * @param cellsetID 
   * @param {string[]} [cellProperties] Array of cell properties eg. [Oridinal, Value, RuleDerived, ...]
   * @returns 
   */

  async extractCellsetCellProperties(cellsetID: string, cellProperties?: string[]) {

    const cellProps = cellProperties ?? ['Value'];
    const url = `/api/v1/Cellsets('${fixedEncodeURIComponent(cellsetID)}')?$expand=Cells($select=${cellProps.join(',')})`;
    const response = await this.http.GET(url);
    return response['Cells']
  }

   /**
   * Write values through a cellset. Use when writing > 1000 values for performance.
   * The number of values must match the number of cells in the cellset
   * 
   * @param mdx A valid MDX statemnt
   * @param values An array of values to write
   * @returns 
   */
  async writeValuesThroughCellset (mdx: string, values: Array<string | number>) {
    const cellsetID = await this.createCellset(mdx)
    return this.updateCellset(cellsetID, values)
  }

  async updateCellset(cellsetID: string, values: Array<string | number>) {
    const url = `/api/v1/Cellsets('${fixedEncodeURIComponent(cellsetID)}')/Cells`;
    const updates = values.map((value, ordinal) => ({ Ordinal: ordinal, Value: value }));
    return this.http.PATCH(url, updates);
  }

  async deleteCellset(cellsetID: string) {
    const url = `/api/v1/Cellsets('${fixedEncodeURIComponent(cellsetID)}')`;
    return this.http.DELETE(url);
  }

  async getDimensionNamesForWriting(cubeName: string) {
    const cubeService = new CubeService(this.http)
    const dimensions = await cubeService.getDimensionNames(cubeName)
    return dimensions
  }

}

export default CellService;