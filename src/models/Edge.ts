class Edge {
  public parentName: string
  public componentName: string
  public weight?: number

  constructor (parentName: string, componentName: string, weight?: number) {
    this.parentName = parentName
    this.componentName = componentName
    this.weight = weight
  }

  static fromJson (data: EdgeResponse) {
    return new Edge(data.ParentName, data.ComponentName, data.Weight)
  }

  constructBody () {
    return {
      ParentName: this.parentName,
      ComponentName: this.componentName,
      Weight: this.weight
    }
  }

  get body () {
    return this.constructBody()
  }
}

interface EdgeResponse {
  ParentName: string
  ComponentName: string
  Weight: number
}

export { Edge, EdgeResponse }
