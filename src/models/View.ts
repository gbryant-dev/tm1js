import { HierarchyElement } from "./Element";
import Subset from "./Subset";

class View {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class MDXView extends View {
    public mdx: string;

    constructor(name: string, mdx: string) {
        super(name);
        this.mdx = mdx;
    }

    get body() {
        return this.constructBody();
    }

    constructBody() {
        const body = {}
        body['@odata.type'] = "tm1.MDXView";
        body['Name'] = this.name;
        body['MDX'] = this.mdx;

        return body;
    }
}

class NativeView extends View {

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
        super(name);
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
            return col.subset.hierarchy.name === column.subset.hierarchy.name
        });
        this.columns.splice(index, 1);
    }

    addRow(subset: Subset) {
        this.rows.push({ subset });
    }

    removeRow(row: ViewAxisSelection) {
        const index = this.rows.findIndex(r => {
            return r.subset.hierarchy.name === row.subset.hierarchy.name
        });

        this.rows.splice(index, 1);
    }

    addTitle(subset: Subset, selection: HierarchyElement) {
        this.titles.push({subset, element: selection });
    }

    removeTitle(title: ViewAxisTitle) {
        const index = this.titles.findIndex(t => {
            return t.subset.hierarchy.name === title.subset.hierarchy.name
        });

        this.titles.splice(index, 1);
    }

    suppressEmptyCells() {
        this.suppressEmptyColumns = true;
        this.suppressEmptyRows = true;
    }

    get body() {
        return this.constructBody();
    }

    // TODO
    constructBody() {
        const body = {};
        body['@odata.type'] = "tm1.NativeView";

        return body;
    }
}

interface ViewAxisSelection {
    subset: Subset;
}

interface ViewAxisTitle {
    subset: Subset;
    element: HierarchyElement;
}

export { View, NativeView, MDXView }