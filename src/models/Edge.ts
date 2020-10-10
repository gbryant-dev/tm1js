class Edge {
    public parentName: string;
    public componentName: string;
    public weight?: number

    constructor(parentName: string, componentName: string, weight?: number) {
        this.parentName = parentName;
        this.componentName = componentName;
        this.weight = weight;
    }

    static fromJson(data: any) {
        return new Edge(
            data.ParentName, 
            data.ComponentName,
            data.Weight
        );
    }

    constructBody() {
        const body = {
            ParentName: this.parentName,
            ComponentName: this.componentName,
            Weight: this.weight
        }

        return body;
    }

    get body() {
        return this.constructBody();
    }
}

export default Edge;