class ElementAttribute {
    public name: string;
    private _type: AttributeTypeString;

    constructor (name: string, type: AttributeTypeString) {
      this.name = name
      this._type = type
    }

    get type () {
      return AttributeType[this._type.toString()]
    }

    set type (value: AttributeTypeString) {
      this._type = value
    }

    static fromJson (data: any): ElementAttribute {
      return new ElementAttribute(data.Name, data.Type)
    }

    constructBody () {
      const body = {}
      body['Name'] = this.name
      body['Type'] = this.type
      return body
    }

    get body () {
      return this.constructBody()
    }
}

export default ElementAttribute

export enum AttributeType {
    Numeric,
    String,
    Alias
}

export type AttributeTypeString = keyof typeof AttributeType
