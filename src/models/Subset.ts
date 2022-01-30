class Subset {
    public name: string;
    public dimensionName: string;
    public hierarchyName: string;
    public alias?: string;
    public uniqueName?: string;
    public expression?: string;
    public elements?: string[] = [];

    constructor (
      name: string,
      dimensionName: string,
      hierarchyName: string = null,
      elements?: string[],
      alias?: string,
      expression?: string,
      uniqueName?: string
    ) {
      this.name = name
      this.dimensionName = dimensionName
      this.hierarchyName = hierarchyName || dimensionName
      this.elements = elements
      this.alias = alias
      this.expression = expression
      this.uniqueName = uniqueName
    }

    static fromJson (data: any) {
      let dimension: string, hierarchy: string

      if (data.Name) {
        dimension = data.UniqueName.substring(1, data.UniqueName.indexOf('].['))
        hierarchy = data.UniqueName.substring(data.UniqueName.indexOf('].[') + 3, data.UniqueName.lastIndexOf('].['))
      } else {
        dimension = data.Hierarchy?.Dimension?.Name
        hierarchy = data?.Hierarchy?.Name
      }

      return new Subset(
        data.Name,
        dimension,
        hierarchy,
        data.Elements?.map((e: any) => e['Name']) ?? [],
        data.Alias,
        data.Expression,
        data.UniqueName
      )
    }

    addElement (name: string) {
      this.elements.push(name)
    }

    get isStatic (): boolean {
      return !this.expression
    }

    get body () {
      if (this.expression) {
        return this.constructBodyDynamic()
      } else {
        return this.constructBodyStatic()
      }
    }

    private constructBodyStatic () {
      const body = {}
      body['Name'] = this.name
      body['Alias'] = this.alias
      body['Hierarchy@odata.bind'] = `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')`

      if (this.elements.length) {
        body['Elements@odata.bind'] = []

        for (const element of this.elements) {
          body['Elements@odata.bind'].push(
                    `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')/Elements('${element}')`
          )
        }
      }

      return body
    }

    private constructBodyDynamic () {
      const body = {}
      body['Name'] = this.name
      body['Alias'] = this.alias
      body['Hierarchy@odata.bind'] = `Dimensions('${this.dimensionName}')/Hierarchies('${this.hierarchyName}')`
      body['Expression'] = this.expression
      return body
    }
}

export { Subset }
