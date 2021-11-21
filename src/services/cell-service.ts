import { HierarchyElement, View, ViewContext } from "../models";
import CubeService from "./cube-service";
import RestService from "./rest-service";

const DEFAULT_CELLSET_QUERY = `?$expand=Cube($select=Name;$expand=Dimensions($select=Name)),\
Axes($expand=Tuples($expand=Members($select=Name)),Hierarchies($select=Name;$expand=Dimension($select=Name))),Cells($select=Ordinal,Value,Updateable,Consolidated,RuleDerived)`;

class CellService {

  private http: RestService

  constructor(http: RestService) {
    this.http = http;
  }

  async executeView(cubeName: string, viewName: string, isPrivate: boolean = false) {
    const cellsetID = await this.createCellsetFromView(cubeName, viewName, isPrivate);
    return this.extractCellset(cellsetID);
  }

  // executeMDX 
  async executeMDX(mdx: string) {
    const cellsetID = await this.createCellset(mdx);
    return this.extractCellset(cellsetID);
  }

  // getValue
  /**
   * 
   * @param {string} cubeName Cube
   * @param {string[]} elements - List of elements that determines the intersection of the value to fetch. 
   *  Specify hierarchy using hierarchy::element. Default hierarchy is used if one is not specified
   * @param {string[]} [dimensions] optional 
   * @returns 
   */
  async getValue(cubeName: string, elements: string[], dimensions?: string[]) {

    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);

    // Build MDX statement 
    const columns = []

    // Loop through elements
    elements.forEach((el, i) => {
      const dimension = _dimensions[i]

      // Check for delimiter
      const isDefaultHierarchy = el.indexOf('::') == -1

      // Determine dimension, hierarchy, element arrangement
      const [hierarchy, element] = isDefaultHierarchy ? [dimension, el] : el.split('::')
      const column = `[${dimension}].[${hierarchy}].[${element}]`;
      columns.push(column)
    })

    const mdx = `SELECT
      {( ${columns.join(',')} )} ON COLUMNS
      FROM [${cubeName}]
    `;

    // Return result of executeMDX call
    return this.executeMDX(mdx)

  }

  // writeValue
  async writeValue(value: string | number, cubeName: string, elements: string[], dimensions?: string[]) {

    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);

    const url = `/api/v1/Cubes('${cubeName}')/tm1.Update`
    const body = {
      Cells: [{
        'Tuple@odata.bind': elements.map((element, i) => `Dimensions('${_dimensions[i]}')/Hierarchies('${_dimensions[i]}')/Elements('${element}')`)
      }],
      Value: value
    }

    return this.http.POST(url, body)
  }

  async writeValues(cubeName: string, cellsetAsMap: Map<string[], string | number>, dimensions?: string[]) {
  
    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);
  
    const updates = []

    cellsetAsMap.forEach((value, tuple) => {
      const update = {
        Cells: [{
          'Tuple@odata.bind': tuple.map((element, i) => `Dimensions('${_dimensions[i]}')/Hierarchies('${_dimensions[i]}')/Elements('${element}')`)
        }],
        Value: value  
      }
      updates.push(update)
    })
    
    const url = `/api/v1/Cubes('${cubeName}')/tm1.Update`
    return this.http.POST(url, updates)
  }

  async createCellset(mdx: string): Promise<string> {
    const url = '/api/v1/ExecuteMDX';
    const response = await this.http.POST(url, { MDX: mdx })
    return response['ID']
  }

  async createCellsetFromView(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<string> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const url = `/api/v1/Cubes('${cubeName}')/${viewType}('${viewName}')/tm1.Execute`;
    const response = await this.http.POST(url, null);
    return response['ID']
  }

  async extractCellset(cellsetID: string) {
    const url = `/api/v1/Cellsets('${cellsetID}')${DEFAULT_CELLSET_QUERY}`;
    return this.http.GET(url);
  }

  async writeValuesThroughCellset (mdx: string, values: Array<string | number>) {
    const cellsetID = await this.createCellset(mdx)
    return this.updateCellset(cellsetID, values)
  }

  async updateCellset(cellsetID: string, values: Array<string | number>) {
    const url = `/api/v1/Cellsets('${cellsetID}')/Cells`;
    const updates = values.map((value, ordinal) => ({ Ordinal: ordinal, Value: value }));
    return this.http.PATCH(url, updates);
  }

  async getDimensionNamesForWriting(cubeName: string) {
    const cubeService = new CubeService(this.http)
    const cube = await cubeService.get(cubeName)
    return cube.dimensions
  }

}

export default CellService;