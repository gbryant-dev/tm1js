import RestService from './rest-service';
import { View, NativeView, MDXView, ViewType } from '../models/view';

class ViewService {

  private http: RestService;
  constructor(http: RestService) {
    this.http = http;
  }

  async get(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<MDXView | NativeView> {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    const response = await this.http.GET(`/api/v1/Cubes('${cubeName}')/${viewType}('${viewName}')?$expand=*`);
    // return View.fromJson(response);
    if (response['@odata.type'] === `#${ViewType.MDX}`) {
      return MDXView.fromJson(response);
    } else {
      return await this.getNativeView(cubeName, viewName, isPrivate);
    }
  }

  async getNativeView(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<NativeView> {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    const url = `/api/v1/Cubes('${cubeName}')/${viewType}('${viewName}')?$expand=tm1.NativeView/Rows/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Columns/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Selected($select=Name)`;
    const response = await this.http.GET(url);
    return NativeView.fromJson(response);
  }

  async getAll(cubeName: string, isPrivate: boolean = false): Promise<(NativeView | MDXView)[]> {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    const url = `/api/v1/Cubes('${cubeName}')/${viewType}?$expand=tm1.NativeView/Rows/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Columns/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Selected($select=Name)`;
    const response = await this.http.GET(url);
    console.log(response);
    return response['value'].map((view: any) => {
      return view['@odata.type'] === `#${ViewType.MDX}` ?
        MDXView.fromJson(view) :
        NativeView.fromJson(view)
    });
  }

  async create(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    return this.http.POST(`/api/v1/Cubes('${cubeName}')/${viewType}`, view.body);
  }

  async update(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    return this.http.PATCH(`/api/v1/Cubes('${cubeName}')/${viewType}('${view.name}')`, view.body);
  }

  async delete(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<any> {
    const viewType = isPrivate ? 'PrivateViews' : 'Views';
    return this.http.DELETE(`/api/v1/Cubes('${cubeName}')/${viewType}('${viewName}')`);
  }

}

export default ViewService;