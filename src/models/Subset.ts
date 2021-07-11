import { extractComponentsFromUniqueName } from "../utils/helpers";

class Subset {

    public name: string;
    public dimensionName: string;
    public hierarchyName: string;
    public alias?: string;
    public uniqueName?: string;
    public expression?: string;
    public elements?: string[] = [];

    constructor(
        name: string,
        dimensionName: string,
        hierarchyName: string = null,
        alias?: string,
        expression?: string,
        elements?: string[],
        uniqueName?: string,
    ) {

        this.name = name;
        this.dimensionName = dimensionName;
        this.hierarchyName = hierarchyName || dimensionName;
        this.alias = alias;
        this.expression = expression;
        this.elements = elements;
        this.uniqueName = uniqueName;
    }

    static fromJson(data: any) {
      return new Subset(
        data.Name,
        data.Hierarchy.Dimension.Name, 
        data.Hierarchy.Name,
        data.Alias,
        data.Expression,
        data.Elements?.map((e: any) => e['Name']) ?? [],
        data.UniqueName
      )
    }

    addElement(name: string) {
      this.elements.push(name);
    }

    get body() {
        if (this.expression) {
            return this.constructBodyDynamic();
        } else {
            return this.constructBodyStatic();
        }
    }

    private constructBodyStatic() {
        const body = {};
        body['Name'] = this.name;
        body['Alias'] = this.alias;
        body['Hierarchy@odata.bind'] = `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')`;

        if (this.elements.length) {
            body['Elements@odata.bind'] = [];
        
            for (const element of this.elements) {
    
                body['Elements@odata.bind'].push(
                    `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')/Elements('${element}')`
                )
            }
        }

        return body;
    }

    private constructBodyDynamic() {
    
        const body = {};
        body['Name'] = this.name;
        body['Alias'] = this.alias;
        body['Hierarchy@odata.bind'] = `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')`;
        body['Expression'] = this.expression;
        return body;
    }
}

export default Subset;