
import { ViewAxisSelection, ViewAxisTitle } from './view-axis'
import { Subset } from './subset'

enum ViewType {
  NATIVE = 'ibm.tm1.api.v1.NativeView',
  MDX = 'ibm.tm1.api.v1.MDXView'
}

enum ViewContext {
  PUBLIC = 'Views',
  PRIVATE = 'PrivateViews'
}

abstract class View {
  abstract name: string;
}

class MDXView extends View {
  public name: string;
  public mdx: string;

  constructor (name: string, mdx: string) {
    super()
    this.name = name
    this.mdx = mdx
  }

  static fromJson (data: any): MDXView {
    return new MDXView(data.Name, data.MDX)
  }

  get body () {
    return this.constructBody()
  }

  constructBody () {
    const body = {}
    body['@odata.type'] = ViewType.MDX
    body['Name'] = this.name
    body['MDX'] = this.mdx

    return body
  }
}

class NativeView extends View {
  public name: string;
  public columns: ViewAxisSelection[] = [];
  public rows: ViewAxisSelection[] = [];
  public titles: ViewAxisTitle[] = [];
  public suppressEmptyColumns?: boolean = false;
  public suppressEmptyRows: boolean = false;

  constructor (
    name: string,
    columns?: ViewAxisSelection[],
    rows?: ViewAxisSelection[],
    titles?: ViewAxisTitle[],
    suppressEmptyColumns?: boolean,
    suppressEmptyRows?: boolean
  ) {
    super()
    this.name = name

    if (columns) {
      for (const c of columns) {
        this.columns.push(c)
      }
    }

    if (rows) {
      for (const r of rows) {
        this.rows.push(r)
      }
    }

    if (titles) {
      for (const t of titles) {
        this.titles.push(t)
      }
    }

    this.suppressEmptyColumns = suppressEmptyColumns
    this.suppressEmptyRows = suppressEmptyRows
  }

  addColumn (subset: Subset) {
    const axis = new ViewAxisSelection(subset)
    this.columns.push(axis)
  }

  removeColumn (dimensionName: string) {
    const index = this.columns.findIndex(col => {
      return col.subset.dimensionName === dimensionName
    })
    if (index !== -1) {
      this.columns.splice(index, 1)
    }
  }

  addRow (subset: Subset) {
    const axis = new ViewAxisSelection(subset)
    this.rows.push(axis)
  }

  removeRow (dimensionName: string) {
    const index = this.rows.findIndex(r => {
      return r.subset.dimensionName === dimensionName
    })
    if (index !== -1) {
      this.rows.splice(index, 1)
    }
  }

  addTitle (subset: Subset, selection: string) {
    const axis = new ViewAxisTitle(subset, selection)
    this.titles.push(axis)
  }

  removeTitle (dimensionName: string) {
    const index = this.titles.findIndex(t => {
      return t.subset.dimensionName === dimensionName
    })
    if (index !== -1) {
      this.titles.splice(index, 1)
    }
  }

  suppressEmptyCells () {
    this.suppressEmptyColumns = true
    this.suppressEmptyRows = true
  }

  static fromJson (data: any): NativeView {
    return new NativeView(
      data.Name,
      data.Columns.map(column => ViewAxisSelection.fromJson(column)),
      data.Rows.map(row => ViewAxisSelection.fromJson(row)),
      data.Titles.map(title => ViewAxisTitle.fromJson(title)),
      data.SuppressEmptyColumns,
      data.SuppressEmptyRows
    )
  }

  get body () {
    return this.constructBody()
  }

  constructBody () {
    const body = {}
    body['@odata.type'] = ViewType.NATIVE
    body['Name'] = this.name
    body['SuppressEmptyColumns'] = this.suppressEmptyColumns
    body['SuppressEmptyRows'] = this.suppressEmptyRows

    body['Columns'] = []
    for (const column of this.columns) {
      body['Columns'].push(column.body)
    }

    body['Rows'] = []

    for (const row of this.rows) {
      body['Rows'].push(row.body)
    }

    body['Titles'] = []

    for (const title of this.titles) {
      body['Titles'].push(title.body)
    }

    return body
  }
}

export { View, NativeView, MDXView, ViewType, ViewContext }
