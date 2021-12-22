import RestService from './rest-service';
import { NativeView, MDXView, ViewType, ViewContext } from '../models/view';
import { fixedEncodeURIComponent } from '../utils/helpers';

class ViewService {

  private http: RestService;
  constructor(http: RestService) {
    this.http = http;
  }

  async get(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<MDXView | NativeView> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')?$expand=*`);
    if (response['@odata.type'] === `#${ViewType.MDX}`) {
      return MDXView.fromJson(response);
    } else {
      return await this.getNativeView(cubeName, viewName, isPrivate);
    }
  }

  async getNativeView(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<NativeView> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')?$expand=tm1.NativeView/Rows/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Columns/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Selected($select=Name,UniqueName)`;
    const response = await this.http.GET(url);
    return NativeView.fromJson(response);
  }

  async getAll(cubeName: string, isPrivate: boolean = false): Promise<(NativeView | MDXView)[]> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}?$expand=tm1.NativeView/Rows/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Columns/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Selected($select=Name,UniqueName)`;
    const response = await this.http.GET(url);
    return response['value'].map((view: any) => {
      return view['@odata.type'] === `#${ViewType.MDX}` ?
        MDXView.fromJson(view) :
        NativeView.fromJson(view)
    });
  }

  async create(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}`, view.body);
  }

  async update(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.PATCH(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${view.name}')`, view.body);
  }

  async delete(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<any> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.DELETE(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')`);
  }

  async exists(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<any> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    try {
      await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e;
    }
  }
}

export default ViewService;