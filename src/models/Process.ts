const BEGIN_GENERATED_STATEMENTS = '#****Begin: Generated Statements***';
const END_GENERATED_STATEMENTS = '#****End: Generated Statements****';
const AUTO_GENERATED_STATEMENTS = `${BEGIN_GENERATED_STATEMENTS}\r\n${END_GENERATED_STATEMENTS}\r\n`;

class Process {

  public name: string;
  public hasSecurityAccess: boolean = false;
  public prologProcedure: string = '';
  public metadataProcedure: string = '';
  public dataProcedure: string = '';
  public epilogProcedure: string = '';
  public dataSource: ProcessDataSource = {
    type: 'None',
    dataSourceNameForClient: null,
    dataSourceNameForServer: null,
    asciiDecimalSeparator: ".",
    asciiDelimiterChar: ",",
    asciiDelimiterType: "Character",
    asciiHeaderRecords: 1,
    asciiQuoteCharacter: "\"",
    asciiThousandSeparator: ",",
    subset: null,
    view: null,
    userName: null,
    password: null,
    query: null,
    usesUnicode: false
  }
  public variables: ProcessVariable[] = [];
  public parameters: ProcessParameter[] = [];
  public UIData: string = 'CubeAction=1511\fDataAction=1503\fCubeLogChanges=0\f';
  public variablesUIData: string[] = [];


  constructor(
    name: string,
    hasSecurityAccess?: boolean,
    procedure?: ProcessProcedure,
    // prologProcedure?: string,
    // metadataProcedure?: string,
    // dataProcedure?: string,
    // epilogProcedure?: string,
    dataSource?: ProcessDataSource,
    parameters?: ProcessParameter[],
    variables?: ProcessVariable[],
    UIData?: string,
    variablesUIData?: string[]
  ) {
    this.name = name;
    this.hasSecurityAccess = hasSecurityAccess,
    this.prologProcedure = Process.addGeneratedStatement(procedure?.prolog);
    this.metadataProcedure = Process.addGeneratedStatement(procedure?.metadata);
    this.dataProcedure = Process.addGeneratedStatement(procedure?.data);
    this.epilogProcedure = Process.addGeneratedStatement(procedure?.epilog);
    this.dataSource = { ...this.dataSource, ...dataSource };
    this.variables = variables;
    this.parameters = parameters;
    this.UIData = UIData;
    this.variablesUIData = variablesUIData;
  }

  static addGeneratedStatement(code: string = ''): string {
    const pattern = /#\*\*\*\*Begin: Generated Statements[\s\S]*#\*\*\*\*End: Generated Statements\*\*\*\*/g;
    if (pattern.test(code)) {
      return code;
    } else {
      return AUTO_GENERATED_STATEMENTS + '\r\n' + code;
    }
  }

  static fromJson(data: any) {
    const { Type, ...dataSource } = data.DataSource
    return new Process(
      data.Name,
      data.HasSecurityAccess,
      { prolog: data.PrologProcedure, 
        metadata: data.MetadataProcedure, 
        data: data.DataProcedure, 
        epilog: data.EpilogProcedure 
      },
      // data.PrologProcedure,
      // data.MetadataProcedure,
      // data.DataProcedure,
      // data.EpilogProcedure,
      dataSource,
      data.Parameters,
      data.Variables,
      data.UIData,
      data.VariablesUIData
    );
  }

  get body() {
    return this.constructBody();
  }

  addVariable(name: string, type: ProcessVariableType) {
    const variable: ProcessVariable = {
      Name: name,
      Type: type,
      Position: this.variables.length + 1,
      StartByte: 0,
      EndByte: 0
    }

    this.variables.push(variable);
    const typeMap = {
      String: 32,
      Numeric: 33
    }

    const variableUIData = `VarType=${typeMap[type]}\fColType=827\f`;
    this.variablesUIData.push(variableUIData);
  }

  removeVariable(name: string) {
    const index = this.variables.findIndex(v => v.Name === name);
    this.variables.splice(index, 1);
    this.variablesUIData.splice(index, 1);
  }

  addParameter(name: string, prompt: string, value: string | number, type?: "String" | "Numeric") {
    // Infer type if not provided

    const paramType = type ? type : typeof value == 'string' ? 'String' : 'Numeric';
    const parameter: ProcessParameter = {
      Name: name,
      Type: paramType,
      Prompt: prompt,
      Value: value
    }

    this.parameters.push(parameter);
  }

  removeParameter(name: string) {
    const index = this.parameters.findIndex(p => p.Name === name);
    this.parameters.splice(index, 1);
  }


  constructBody() {
    const body = {};
    body['Name'] = this.name;
    body['HasSecurityAccess'] = this.hasSecurityAccess;
    body['PrologProcedure'] = this.prologProcedure;
    body['MetadataProcedure'] = this.metadataProcedure;
    body['DataProcedure'] = this.dataProcedure;
    body['EpilogProcedure'] = this.epilogProcedure;
    body['UIData'] = this.UIData;
    body['Variables'] = this.variables;
    body['VariablesUIData'] = this.variablesUIData;
    body['Parameters'] = this.parameters;
    body['DataSource'] = {};

    // Create DataSource body based on type
    switch (this.dataSource.type) {
      case 'None':
        body['DataSource'] = {
          Type: 'None'
        }
        break;
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

        if (this.dataSource.asciiDelimiterType == 'FixedWidth') {
          delete body['DataSource']['asciiDelimiterChar'];
        }
        break;
      case 'ODBC':
        body['DataSource'] = {
          Type: 'ODBC',
          dataSourceNameForClient : this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer : this.dataSource.dataSourceNameForServer,
          userName : this.dataSource.userName,
          password : this.dataSource.password,
          query : this.dataSource.query,
          usesUnicode : this.dataSource.usesUnicode
        }
        break;
      case 'TM1DimensionSubset':
        body['DataSource'] = {
          Type: 'TM1DimensionSubset',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          subset: this.dataSource.subset
        }
        break;
      case 'TM1CubeView':
        body['DataSource'] = {
          Type: 'TM1CubeView',
          dataSourceNameForClient: this.dataSource.dataSourceNameForClient,
          dataSourceNameForServer: this.dataSource.dataSourceNameForServer,
          view: this.dataSource.view
        }
        break;

      default:
        break;
    }
    return body;
  }

}

interface ProcessProcedure {
  prolog?: string;
  metadata?: string;
  data?: string;
  epilog?: string;
}


type ProcessVariableType = 'String' | 'Numeric';

interface ProcessVariable {
  Name: string;
  Type: ProcessVariableType;
  Position?: number;
  StartByte?: number;
  EndByte?: number;
}

type DataSourceType = 'None' | 'ASCII' | 'ODBC' | 'TM1DimensionSubset' | 'TM1CubeView';

// enum DataSourceType {
//   None = "None",
//   ASCII = "ASCII",
//   ODBC = "ODBC",
//   TM1DimensionSubset = "TM1DimensionSubset",
//   TM1CubeView = "TM1CubeView"
// }

interface ProcessDataSource {
  type: DataSourceType;
  dataSourceNameForClient?: string;
  dataSourceNameForServer?: string;
  asciiDecimalSeparator?: string; // Default: .
  asciiDelimiterChar?: string; // Default: ,
  asciiDelimiterType?: "Character" | "FixedWidth"; // Default: Character
  asciiHeaderRecords?: number; // Default: 1
  asciiQuoteCharacter?: string; // Default: "
  asciiThousandSeparator?: string; // Default: ,
  subset?: string;
  view?: string;
  userName?: string;
  password?: string;
  query?: string;
  usesUnicode?: boolean;

}

interface ProcessParameter {
  Name: string;
  Prompt?: string;
  Value?: string | number;
  Type: ProcessVariableType;
}

export { Process as default, ProcessParameter, ProcessVariable, ProcessDataSource, DataSourceType };
