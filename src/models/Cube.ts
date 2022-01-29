import Dimension from './dimension'

// interface CubeBody {
//   Name: string;
//   'Dimensions@odata.bind': Array<string>;
//   Rules?: string | null;
// }

class Cube {
  public name: string;
  public drillThroughRules?: string = null;
  public rules?: string = null;
  public dimensions: string[] = [];
  public lastDataUpdate: String;
  public lastSchemaUpdate: String;
  // public Views: View[] = [];

  constructor (name: string, dimensions: string[], rules?: string) {
    this.name = name
    this.rules = rules

    // this.dimensions = dimensions;

    for (const d of dimensions) {
      this.dimensions.push(d)
    }
  }

  constructBody () {
    let body = {
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

  get body () {
    return this.constructBody()
  }

  static fromJson (data: any) {
    return new Cube(
      data.Name,
      data.Dimensions.map((dim: { Name: string }) => dim.Name),
      data.Rules
    )
  }
}

export default Cube
