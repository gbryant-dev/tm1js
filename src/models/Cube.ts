import { DimensionResponse } from './dimension'

class Cube {
  public name: string
  public drillThroughRules?: string = null
  public rules?: string = null
  public dimensions: string[] = []
  public lastDataUpdate: string
  public lastSchemaUpdate: string
  // public Views: View[] = [];

  constructor(name: string, dimensions: string[], rules?: string) {
    this.name = name
    this.rules = rules

    for (const d of dimensions) {
      this.dimensions.push(d)
    }
  }

  constructBody() {
    const body = {
      Name: this.name,
      'Dimensions@odata.bind': []
    }

    body['Name'] = this.name
    body['Dimensions@odata.bind'] = []

    for (const dimension of this.dimensions) {
      body['Dimensions@odata.bind'].push(`Dimensions('${dimension}')`)
    }

    if (this.rules) {
      body['Rules'] = this.rules
    }

    return body
  }

  get body() {
    return this.constructBody()
  }

  static fromJson(data: CubeResponse) {
    return new Cube(
      data.Name,
      data.Dimensions.map((dim: { Name: string }) => dim.Name),
      data.Rules
    )
  }
}

interface CubeResponse {
  Name: string
  Dimensions: DimensionResponse[]
  Rules: string
}

interface CubesResponse {
  value: CubeResponse[]
}

export { Cube, CubeResponse, CubesResponse }
