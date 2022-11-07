import { caseAndSpaceInsensitiveEquals } from '../utils/helpers'
import { Hierarchy, HierarchyResponse } from './hierarchy'

class Dimension {
  public name: string
  public uniqueName?: string
  public hierarchies?: Hierarchy[] = []
  public defaultHierarchy?: Hierarchy

  constructor(
    name: string,
    hierarchies?: Hierarchy[],
    uniqueName?: string,
    defaultHierarchy?: Hierarchy
  ) {
    this.name = name
    this.uniqueName = uniqueName

    if (hierarchies) {
      for (const hierarchy of hierarchies) {
        this.hierarchies.push(hierarchy)
      }
    }

    if (defaultHierarchy) {
      this.defaultHierarchy = defaultHierarchy
    }
  }

  hasHierarchy(hierarchyName: string) {
    for (const hierarchy of this.hierarchies) {
      if (caseAndSpaceInsensitiveEquals(hierarchy.name, hierarchyName)) {
        return true
      }
    }

    return false
  }

  addHierarchy(hierarchy: Hierarchy) {
    if (this.hasHierarchy(hierarchy.name)) {
      throw new Error(
        `Hierarchy ${hierarchy.name} already exists in dimension ${this.name}.`
      )
    }

    this.hierarchies.push(hierarchy)
  }

  deleteHierarchy(hierarchyName: string) {
    if (hierarchyName.toLowerCase() === 'leaves') {
      throw new Error("'Leaves' hierarchy must not be removed from dimension")
    }

    const index = this.hierarchies.findIndex(
      (hier) => hier.name.toLowerCase() === hierarchyName.toLowerCase()
    )
    this.hierarchies.splice(index, 1)
  }

  static fromJson(data: DimensionResponse): Dimension {
    return new Dimension(
      data.Name,
      data.Hierarchies.map((hierarchy) => Hierarchy.fromJson(hierarchy)),
      data.UniqueName,
      // @ts-ignore
      data.DefaultHierarchy
    )
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {}
    body['Name'] = this.name

    if (this.hierarchies) {
      body['Hierarchies'] = []
      for (const hierarchy of this.hierarchies) {
        if (hierarchy.name.toLowerCase() !== 'leaves') {
          body['Hierarchies'].push(hierarchy.body)
        }
      }
    }

    return body
  }
}

interface DimensionResponse {
  Name: string
  Hierarchies: HierarchyResponse[]
  UniqueName: string
  DefaultHierarchy: HierarchyResponse
}

interface DimensionsResponse {
  value: DimensionResponse[]
}

export { Dimension, DimensionResponse, DimensionsResponse }
