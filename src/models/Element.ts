import { extractComponentsFromUniqueName } from '../utils/helpers';

class HierarchyElement {
    
    public name: string;
    public hierarchyName: string;
    public dimensionName: string;
    public uniqueName?: string;
    public level?: number;
    public index?: number;
    public attributes?: {[key: string]: string | number};
    private _type: ElementTypeString;

    constructor(
        name: string,
        type?: ElementTypeString,
        uniqueName?: string,
        level?: number,
        index?: number,
        attributes?: {[key: string]: string | number}
    ) {
        this.name = name;
        // const { dimension, hierarchy } = extractComponentsFromUniqueName(uniqueName);
        // this.dimensionName = dimension;
        // this.hierarchyName = hierarchy;
        this._type = type
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

    get type() {
      return ElementType[this._type.toString()]
    }
    
    set type(value: ElementTypeString) {
      this._type = value;
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

type ElementTypeString = keyof typeof ElementType

export { HierarchyElement, ElementType, ElementTypeString }