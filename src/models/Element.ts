class HierarchyElement {
    
    public name: string;
    public hierarchyName: string;
    public dimensionName: string;
    public type?: ElementType;
    public uniqueName?: string;
    public level?: number;
    public index?: number;
    public attributes?: {[key: string]: string | number};

    constructor(
        name: string,
        type?: ElementType,
        uniqueName?: string,
        level?: number,
        index?: number,
        attributes?: {[id: string]: string | number}
    ) {
        this.name = name;
        this.dimensionName = uniqueName.substring(1, uniqueName.indexOf('].['));
        // *TODO* - Make this hierarchy aware
        this.hierarchyName = uniqueName.substring(1, uniqueName.indexOf('].['));
        this.type = type;
        this.uniqueName = uniqueName;
        this.level = level;
        this.index = index;
        
        if (attributes) {
            this.attributes = {}
            for (const [key, value] of Object.entries(attributes)) {
                this.attributes[key] = value
            }
        }
    }

    static fromJson(data: any) {
        return new HierarchyElement(
            data.Name,
            data.Type,
            data.UniqueName,
            data.Level,
            data.Index,
            data.Attributes
        )
    }

    constructBody() {
        const body = {}
        body['Name'] = this.name;
        body['Type'] = this.type;
        
        return body;
    }


    get body() {
        return this.constructBody()
    }
}


enum ElementType {
    Numeric = 1,
    String = 2,
    Consolidated = 3
}

export { HierarchyElement, ElementType }