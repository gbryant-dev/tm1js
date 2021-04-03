import { HierarchyElement } from "./element";
import Subset from "./subset"

class ViewAxisSelection {

  public subset: Subset;
  constructor(subset: Subset) {
    this.subset = Subset.fromJson(subset);
  }

  static fromJson (data: any) {
    return new ViewAxisSelection(data.Subset);
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {};

    body['Subset'] = this.subset.body;
    
    return body;
  }
}


class ViewAxisTitle {

  public subset: Subset;
  public selected: HierarchyElement;

  constructor (subset: Subset, selected: HierarchyElement) {
    this.subset = Subset.fromJson(subset);
    this.selected = HierarchyElement.fromJson(selected);
  }

  static fromJson (data: any) {
    return new ViewAxisTitle(data.Subset, data.Selected);
  }

  get body() {
    return this.constructBody();
  }

  constructBody() {
    const body = {};
    
    body['Subset'] = this.subset.body;
    body['Selected'] = this.selected.name;

    return body;
  }
}


export { ViewAxisSelection, ViewAxisTitle }