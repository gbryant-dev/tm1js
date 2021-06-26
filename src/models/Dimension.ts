import { caseAndSpaceInsensitiveEquals } from "../utils/helpers";
import Hierarchy from "./hierarchy";

class Dimension {
    public name: string;
    public uniqueName?: string;
    public hierarchies?: Hierarchy[] = []
    public defaultHierarchy?: Hierarchy;

    constructor(name: string, uniqueName?: string, hierarchies?: Hierarchy[], defaultHierarchy?: Hierarchy) {
        this.name = name;
        this.uniqueName = uniqueName;

        if (hierarchies) {
            for (const hierarchy of hierarchies) {
                this.hierarchies.push(Hierarchy.fromJson(hierarchy))
            }
        }

        if (defaultHierarchy) {
            this.defaultHierarchy = Hierarchy.fromJson(defaultHierarchy)
        }
    }


    hasHierarchy(hierarchyName: string) {
        
        for (const hierarchy of this.hierarchies) {
            if (caseAndSpaceInsensitiveEquals(hierarchy.name, hierarchyName)) {
                return true;
            }
        }

        return false;
    }

    addHierarchy(hierarchy: Hierarchy) {
        
        if (this.hasHierarchy(hierarchy.name)) {
            throw `Hierarchy ${hierarchy.name} already exists in dimension ${this.name}.`;
        }
        
        this.hierarchies.push(hierarchy);
    }

    deleteHierarchy(hierarchyName: string) {
        
        if (hierarchyName.toLowerCase() === 'leaves') {
            throw `'Leaves' hierarchy must not be removed from dimension`;
        }

        const index = this.hierarchies.findIndex(hier => hier.name.toLowerCase() === hierarchyName.toLowerCase());
        this.hierarchies.splice(index, 1);

    }

    static fromJson(data: any): Dimension {
       return new Dimension(
           data.Name, 
           data.UniqueName, 
           data.Hierarchies,
           data.DefaultHierarchy
        );
    }

    get body() {
        return this.constructBody()
    }

    constructBody() {
        const body = {}
        body['Name'] = this.name;
        
        if (this.hierarchies) {
            body['Hierarchies'] = [];
            for (const hierarchy of this.hierarchies) {
                if (hierarchy.name.toLowerCase() !== 'leaves') {
                    body['Hierarchies'].push(hierarchy.body);
                }
            }
        }

        return body;
    }

}


export default Dimension;