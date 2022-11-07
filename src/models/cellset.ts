import { CubeResponse } from './Cube'
import { ElementResponse } from './element'
import { HierarchyResponse } from './hierarchy'

interface CellsetResponse {
  ID: string
  Cube: CubeResponse
  Axes: CellsetAxisResponse[]
  Cells: CellResponse[]
}

interface CellsetAxisResponse {
  Ordinal: number
  Cardinality: number
  Hierarchies: HierarchyResponse[]
  Tuples: CellsetAxisTupleResponse[]
}

interface CellsetAxisTupleResponse {
  Ordinal: number
  Members: TupleMemberResponse[]
}

interface MemberResponse {
  Name: string
  UniqueName: string
  Ordinal: number
  Weight: number
  Attributes: {
    Caption: string
    [key: string]: string | number
  }
  Hierarchy: HierarchyResponse
  Level: { Number: number; Name: string }
  Element: ElementResponse
  Parent: MemberResponse
  Children: MemberResponse[]
}

interface TupleMemberResponse extends MemberResponse {
  DisplayInfo: number
  DisplayInfoAbove: number
}

interface CellResponse {
  Ordinal: number
  Status: 'Null' | 'Data' | 'Error'
  Value: string | number
  FormatString: string
  FormattedValue: string
  Updateable: number
  RuleDerived: boolean
  Annotated: boolean
  Consolidated: boolean
  HasPicklist: boolean
  PicklistValues: string[]
  HasDrillThrough: boolean
  DrillthroughScripts: { Name: string }[]
  Members: MemberResponse[]
}

type CellValue = CellResponse['Value']

export { CellsetResponse, CellResponse, CellValue }
