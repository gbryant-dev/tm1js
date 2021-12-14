import { ViewContext } from "../models";
import { RemoveCellset } from "../utils/decorators";
import CubeService from "./cube-service";
import RestService from "./rest-service";

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


class CellService {

  private http: RestService

  constructor(http: RestService) {
    this.http = http;
  }

  async executeView(
    cubeName: string, 
    viewName: string, 
    isPrivate: boolean = false,
    options?: CellsetQueryOptions,
  ) {
    const cellsetID = await this.createCellsetFromView(cubeName, viewName, isPrivate);
    return this.extractCellset(cellsetID, options);
  }

  async executeMDX(
    mdx: string, 
    options?: CellsetQueryOptions
  ) {
    const cellsetID = await this.createCellset(mdx); 
    return this.extractCellset(cellsetID, options);
  }


  async getValue(cubeName: string, elements: string[], dimensions?: string[]) {

    const _dimensions = dimensions ?? await this.getDimensionNamesForWriting(cubeName);

    // Build MDX statement 
    const columns = []

    // Loop through elements
    elements.forEach((el, i) => {
      const dimension = _dimensions[i]

      // Check for hierarchy delimiter
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
    
    const baseUrl = `/api/v1/Cellsets('${cellsetID}')?$expand=Cube($select=Name;$expand=Dimensions($select=Name))`;

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

  async extractCellsetCellProperties(cellsetID: string, cellProperties?: string[]) {

    const cellProps = cellProperties ?? ['Value'];
    const url = `/api/v1/Cellsets('${cellsetID}')?$expand=Cells($select=${cellProps.join(',')})`;
    const response = await this.http.GET(url);
    return response['Cells']
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

  async deleteCellset(cellsetID: string) {
    const url = `/api/v1/Cellsets('${cellsetID}')`;
    return this.http.DELETE(url);
  }

  async getDimensionNamesForWriting(cubeName: string) {
    const cubeService = new CubeService(this.http)
    const dimensions = await cubeService.getDimensionNames(cubeName)
    return dimensions
  }

}

export default CellService;