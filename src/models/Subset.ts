import Hierarchy from "./Hierarchy";
import { HierarchyElement } from "./Element";

class Subset {

    public name: string;
    public uniqueName?: string;
    public expression?: string;
    public hierarchy?: Hierarchy;
    public elements?: HierarchyElement[] = [];

    constructor(
        name: string,
        uniqueName?: string,
        expression?: string,
        hierarchy?: Hierarchy,
        elements?: HierarchyElement[]
    ) {
        this.name = name;
        this.uniqueName = uniqueName;
        this.expression = expression;

        if (hierarchy) {
            this.hierarchy = Hierarchy.fromJson(hierarchy)
        }

        if (elements) {
            for (const element of elements) {
                this.elements.push(HierarchyElement.fromJson(element))
            }
        }
    }

    static fromJson(data: any) {
        return new Subset(
            data.Name,
            data.UniqueName,
            data.Expression,
            data.Hierarchy,
            data.Elements
        )
    }
}

export default Subset;