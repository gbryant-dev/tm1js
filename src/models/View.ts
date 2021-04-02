import { HierarchyElement } from "./element";
import Subset from "./subset";

abstract class View {
  abstract name: string;
}

class MDXView extends View {
  public name: string;
  public mdx: string;

  constructor(name: string, mdx: string) {
    super();
    this.name = name;
    this.mdx = mdx;
  }

  static fromJson (data: any): MDXView {
    return new MDXView(data.Name, data.MDX);
  }

  get body() {
    return this.constructBody();
  }

  constructBody() {
    const body = {}
    body['@odata.type'] = "ibm.tm1.api.v1.MDXView";
    body['Name'] = this.name;
    body['MDX'] = this.mdx;

    return body;
  }
}

class NativeView extends View {

  public name: string;
  public columns: ViewAxisSelection[] = [];
  public rows: ViewAxisSelection[] = [];
  public titles: ViewAxisTitle[] = [];
  public suppressEmptyColumns?: boolean = false;
  public suppressEmptyRows: boolean = false;

  constructor(
    name: string,
    columns: ViewAxisSelection[],
    rows: ViewAxisSelection[],
    titles: ViewAxisTitle[],
    suppressEmptyColumns?: boolean,
    suppressEmptyRows?: boolean
  ) {
    super();
    this.name = name;
    this.columns = columns;
    this.rows = rows;
    this.titles = titles;
    this.suppressEmptyColumns = suppressEmptyColumns;
    this.suppressEmptyRows = suppressEmptyRows;

  }

  addColumn(subset: Subset) {
    this.columns.push({ subset });
  }

  removeColumn(column: ViewAxisSelection) {
    const index = this.columns.findIndex(col => {
      return col.subset.hierarchyName === column.subset.hierarchyName
    });
    this.columns.splice(index, 1);
  }

  addRow(subset: Subset) {
    this.rows.push({ subset });
  }

  removeRow(row: ViewAxisSelection) {
    const index = this.rows.findIndex(r => {
      return r.subset.hierarchyName === row.subset.hierarchyName
    });

    this.rows.splice(index, 1);
  }

  addTitle(subset: Subset, selection: HierarchyElement) {
    this.titles.push({ subset, selected: selection });
  }

  removeTitle(title: ViewAxisTitle) {
    const index = this.titles.findIndex(t => {
      return t.subset.hierarchyName === title.subset.hierarchyName
    });

    this.titles.splice(index, 1);
  }

  suppressEmptyCells() {
    this.suppressEmptyColumns = true;
    this.suppressEmptyRows = true;
  }

  static fromJson(data: any): NativeView {
    return new NativeView(
      data.Name,
      data.Columns,
      data.Rows,
      data.Titles,
      data.SuppressEmptyColumns,
      data.SuppressEmptyRows
    )
  }

  get body() {
    return this.constructBody();
  }

  // TODO
  constructBody() {
    const body = {};
    body['@odata.type'] = "ibm.tm1.api.v1.NativeView";
    body['Name'] = this.name;
    body['SuppressEmptyColumns'] = this.suppressEmptyColumns;
    body['SuppressEmptyRows'] = this.suppressEmptyRows;
    
    body['Columns'] = [];
    for (const column of this.columns) {
      body['Columns'].push({
        'Subset@odata.bind': 
        `Dimensions('${column.subset.dimensionName}')/Hierarchies('${column.subset.hierarchyName}')/Subsets('${column.subset.name}')`
      });
    }

    body['Rows'] = [];
    for (const row of this.rows) {
      body['Rows'].push({
        'Subset@odata.bind':
        `Dimensions('${row.subset.dimensionName}')/Hierarchies('${row.subset.hierarchyName}')/Subsets('${row.subset.name}')`
      });
    }

    body['Titles'] = [];
    for (const title of this.titles) {
      body['Titles'].push({
        'Subset@odata.bind':
        `Dimensions('${title.subset.dimensionName}')/Hierarchies('${title.subset.hierarchyName}')/Subsets('${title.subset.name}')`,
        'Selected@odata.bind':
        `Dimensions('${title.subset.dimensionName}')/Hierarchies('${title.subset.hierarchyName}')/Elements('${title.selected.name}')`
      });
    }

    return body;
  }
}

interface ViewAxisSelection {
  subset: Subset;
}

interface ViewAxisTitle {
  subset: Subset;
  selected: HierarchyElement;
}

export { View, NativeView, MDXView }