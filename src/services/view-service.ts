import RestService from './rest-service';
import { NativeView, MDXView, ViewType, ViewContext } from '../models/view';
import { fixedEncodeURIComponent } from '../utils/helpers';

/** Service to manage views in TM1 */
class ViewService {

  private http: RestService;
  constructor(http: RestService) {
    this.http = http;
  }

  /**
   * Fetch a native or MDX view from TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns {NativeView | MDXView} An instance of either the `NativeView` | `MDXView` model
   */

  async get(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<MDXView | NativeView> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const response = await this.http.GET(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')?$expand=*`);
    if (response['@odata.type'] === `#${ViewType.MDX}`) {
      return MDXView.fromJson(response);
    } else {
      return await this.getNativeView(cubeName, viewName, isPrivate);
    }
  }

  /**
   * Fetch a native view and related objects from TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns {NativeView} An instance of the `NativeView` model  
   */

  async getNativeView(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<NativeView> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    const url = `/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')?$expand=tm1.NativeView/Rows/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Columns/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Subset($expand=Hierarchy($select=Name;$expand=Dimension($select=Name)),Elements($select=Name);$select=Expression,UniqueName,Name,Alias),tm1.NativeView/Titles/Selected($select=Name,UniqueName)`;
    const response = await this.http.GET(url);
    return NativeView.fromJson(response);
  }

  /**
   * Fetch all native and MDX views for a cube in TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns {(NativeView | MDXView)[]} Instances of the `NativeView` and `MDXView` model
   */

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

  /**
   * Create a native or MDX view in TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {NativeView | MDXView} view The view to create. An instance of either the `NativeView` or `MDXView` model
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns
   */

  async create(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.POST(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}`, view.body);
  }

  /**
   * Update a native or MDX view in TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {NativeView | MDXView} view The view to update. An instance of either the `NativeView` or `MDXView` model
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns
   */

  async update(cubeName: string, view: NativeView | MDXView, isPrivate: boolean = false) {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.PATCH(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(view.name)}')`, view.body);
  }

  /**
   * Delete a native or MDX view in TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view to delete
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns
   */

  async delete(cubeName: string, viewName: string, isPrivate: boolean = false): Promise<any> {
    const viewType = isPrivate ? ViewContext.PRIVATE : ViewContext.PUBLIC;
    return this.http.DELETE(`/api/v1/Cubes('${fixedEncodeURIComponent(cubeName)}')/${viewType}('${fixedEncodeURIComponent(viewName)}')`);
  }

  /**
   * Check if a native or MDX view exists in TM1
   * 
   * @param {string} cubeName The name of the cube
   * @param {string} viewName The name of the view
   * @param {boolean} [isPrivate=false] Private (true) or Public (false) view. Defaults to a public view
   * @returns {boolean} If the view exists
   */
  
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