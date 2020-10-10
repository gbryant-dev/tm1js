class ElementAttribute {

    public name: string;
    public type: AttributeType;

    constructor(name: string, type: AttributeType) {
        this.name = name;
        this.type = type;
    }

    static fromJson(data: any): ElementAttribute {
        return new ElementAttribute(data.Name, data.Type);
    }

    constructBody() {
        const body = {};
        body['Name'] = this.name;
        body['Type'] = AttributeType[this.type];

        return body;
    }

    get body() {
        return this.constructBody();
    }
}

export default ElementAttribute;

enum AttributeType {
    Numeric = 0,
    String = 1,
    Alias = 2
}
