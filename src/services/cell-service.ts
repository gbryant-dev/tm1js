import RestService from "./rest-service";

const DEFAULT_CELLSET_QUERY = `?$expand=Cube($select=Name;$expand=Dimensions($select=Name)),\
Axes($expand=Tuples($expand=Members($select=Name)),Hierarchies($select=Name;$expand=Dimensions($select=Name))),Cells($select=Ordinal,Value,Updateable,Consolidated,RuleDerived)`;
class CellService {

  private http: RestService

  constructor(http: RestService) {
    this.http = http;
  }


  async executeView(cubeName: string, viewName: string, isPrivate: boolean = false) {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    const url = `/api/v1/Cubes('${cubeName}')/${viewType}('${viewName}')/tm1.Execute?${DEFAULT_CELLSET_QUERY}`;
    return this.http.POST(url, null);
  }

  // executeMDX 
  async executeMDX(mdx: string) {
    const url = `/api/v1/ExecuteMDX?${DEFAULT_CELLSET_QUERY}`;
    return this.http.POST(url, null);
  }

  // getValue

  // writeValue

  // writeValues


}

export default CellService;