const BEGIN_GENERATED_STATEMENTS = '#****Begin: Generated Statements***'
const END_GENERATED_STATEMENTS = '#****End: Generated Statements****'
const AUTO_GENERATED_STATEMENTS = `${BEGIN_GENERATED_STATEMENTS}\r\n${END_GENERATED_STATEMENTS}\r\n`

class Process {
  public name: string
  public hasSecurityAccess = false
  public prologProcedure = ''
  public metadataProcedure = ''
  public dataProcedure = ''
  public epilogProcedure = ''
  public dataSource: ProcessDataSource = {
    Type: 'None',
    dataSourceNameForClient: null,
    dataSourceNameForServer: null,
    asciiDecimalSeparator: '.',
    asciiDelimiterChar: ',',
    asciiDelimiterType: 'Character',
    asciiHeaderRecords: 1,
    asciiQuoteCharacter: '"',
    asciiThousandSeparator: ',',
    subset: null,
    view: null,
    userName: null,
    password: null,
    query: null,
    usesUnicode: false
  }

  public variables: ProcessVariable[] = []
  public parameters: ProcessParameter[] = []
  public UIData = 'CubeAction=1511\fDataAction=1503\fCubeLogChanges=0\f'
  public variablesUIData: string[] = []

  constructor(
    name: string,
    hasSecurityAccess?: boolean,
    procedure?: ProcessProcedure,
    dataSource?: ProcessDataSource,
    parameters?: ProcessParameter[],
    variables?: ProcessVariable[],
    UIData?: string,
    variablesUIData?: string[]
  ) {
    this.name = name
    this.hasSecurityAccess = hasSecurityAccess
    this.prologProcedure = Process.addGeneratedStatement(procedure?.prolog)
    this.metadataProcedure = Process.addGeneratedStatement(procedure?.metadata)
    this.dataProcedure = Process.addGeneratedStatement(procedure?.data)
    this.epilogProcedure = Process.addGeneratedStatement(procedure?.epilog)
    this.dataSource = { ...this.dataSource, ...dataSource }
    this.variables = variables ?? []
    this.parameters = parameters ?? []
    this.UIData = UIData
    this.variablesUIData = variablesUIData ?? []
  }

  static addGeneratedStatement(code = ''): string {
    const pattern =
      /#\*\*\*\*Begin: Generated Statements[\s\S]*#\*\*\*\*End: Generated Statements\*\*\*\*/g
    if (pattern.test(code)) {
      return code
    } else {
      return AUTO_GENERATED_STATEMENTS + '\r\n' + code
    }
  }

  static fromJson(data: ProcessResponse) {
    return new Process(
      data.Name,
      data.HasSecurityAccess,
      {
        prolog: data.PrologProcedure,
        metadata: data.MetadataProcedure,
        data: data.DataProcedure,
        epilog: data.EpilogProcedure
      },
      data.DataSource,
      data.Parameters,
      data.Variables,
      data.UIData,
      data.VariablesUIData
    )
  }

  get body() {
    return this.constructBody()
  }

  addVariable(name: string, type: ProcessVariableType) {
    const variable: ProcessVariable = {
      Name: name,
      Type: type,
      Position: this.variables.length + 1,
      StartByte: 0,
      EndByte: 0
    }

    this.variables.push(variable)
    const typeMap = {
      String: 32,
      Numeric: 33
    }

    const variableUIData = `VarType=${typeMap[type]}\fColType=827\f`
    this.variablesUIData.push(variableUIData)
  }

  removeVariable(name: string) {
    const index = this.variables.findIndex((v) => v.Name === name)
    if (index !== -1) {
      this.variables.splice(index, 1)
      this.variablesUIData.splice(index, 1)
    }
  }

  addParameter(
    name: string,
    value: string | number,
    prompt?: string,
    type?: 'String' | 'Numeric'
  ) {
    // Infer type if not provided

    const paramType = type || (typeof value === 'string' ? 'String' : 'Numeric')
    const parameter: ProcessParameter = {
      Name: name,
      Type: paramType,
      Prompt: prompt,
      Value: value
    }

    this.parameters.push(parameter)
  }

  removeParameter(name: string) {
    const index = this.parameters.findIndex((p) => p.Name === name)
    if (index !== 1) {
      this.parameters.splice(index, 1)
    }
  }

  constructBody() {
    const body = {}
    body['Name'] = this.name
    body['HasSecurityAccess'] = this.hasSecurityAccess
    body['PrologProcedure'] = this.prologProcedure
    body['MetadataProcedure'] = this.metadataProcedure
    body['DataProcedure'] = this.dataProcedure
    body['EpilogProcedure'] = this.epilogProcedure
    body['UIData'] = this.UIData
    body['Variables'] = this.variables
    body['VariablesUIData'] = this.variablesUIData
    body['Parameters'] = this.parameters
    body['DataSource'] = {}

    // Create DataSource body based on type
    switch (this.dataSource.Type) {
      case 'None':
        body['DataSource'] = {
          Type: 'None'
        }
        break
      case 'ASCII':
        body['DataSource'] = {
          Type: 'ASCII',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          asciiDecimalSeparator: this.dataSource.asciiDecimalSeparator,
          asciiDelimiterChar: this.dataSource.asciiDelimiterChar,
          asciiDelimiterType: this.dataSource.asciiDelimiterType,
          asciiHeaderRecords: this.dataSource.asciiHeaderRecords,
          asciiQuoteCharacter: this.dataSource.asciiQuoteCharacter,
          asciiThousandSeparator: this.dataSource.asciiThousandSeparator
        }

        if (this.dataSource.asciiDelimiterType === 'FixedWidth') {
          delete body['DataSource']['asciiDelimiterChar']
        }
        break
      case 'ODBC':
        body['DataSource'] = {
          Type: 'ODBC',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          userName: this.dataSource.userName,
          password: this.dataSource.password,
          query: this.dataSource.query,
          usesUnicode: this.dataSource.usesUnicode
        }
        break
      case 'TM1DimensionSubset':
        body['DataSource'] = {
          Type: 'TM1DimensionSubset',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          subset: this.dataSource.subset
        }
        break
      case 'TM1CubeView':
        body['DataSource'] = {
          Type: 'TM1CubeView',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          view: this.dataSource.view
        }
        break

      default:
        break
    }
    return body
  }
}

interface ProcessProcedure {
  prolog?: string
  metadata?: string
  data?: string
  epilog?: string
}

type ProcessVariableType = 'String' | 'Numeric'

interface ProcessVariable {
  Name: string
  Type: ProcessVariableType
  Position?: number
  StartByte?: number
  EndByte?: number
}

type DataSourceType =
  | 'None'
  | 'ASCII'
  | 'ODBC'
  | 'TM1DimensionSubset'
  | 'TM1CubeView'

interface ProcessDataSource {
  Type: DataSourceType
  dataSourceNameForClient?: string
  dataSourceNameForServer?: string
  asciiDecimalSeparator?: string // Default: .
  asciiDelimiterChar?: string // Default: ,
  asciiDelimiterType?: 'Character' | 'FixedWidth' // Default: Character
  asciiHeaderRecords?: number // Default: 1
  asciiQuoteCharacter?: string // Default: "
  asciiThousandSeparator?: string // Default: ,
  subset?: string
  view?: string
  userName?: string
  password?: string
  query?: string
  usesUnicode?: boolean
}

interface ProcessParameter {
  Name: string
  Prompt?: string
  Value?: string | number
  Type: ProcessVariableType
}

interface ProcessResponse {
  Name: string
  HasSecurityAccess: boolean
  PrologProcedure: string
  MetadataProcedure: string
  DataProcedure: string
  EpilogProcedure: string
  UIData: string
  Variables: ProcessVariable[]
  VariablesUIData: string[]
  Parameters: ProcessParameter[]
  DataSource: ProcessDataSource // TODO: refine!
}

interface ProcessesResponse {
  value: ProcessResponse[]
}

export {
  Process,
  ProcessProcedure,
  ProcessParameter,
  ProcessVariable,
  ProcessDataSource,
  DataSourceType,
  ProcessResponse,
  ProcessesResponse
}
