import { AxiosResponse } from "axios";
import { ProcessExecuteResult, ProcessSyntaxError } from "../models/misc";
import Process, { ProcessParameter } from "../models/process";
import RestService from "./rest-service";
import { v4 as uuid } from 'uuid';
import { MinimumVersion } from "../utils/decorators";
import { fixedEncodeURIComponent } from "../utils/helpers";

/**
 * Service to handle process operations in TM1
 */
class ProcessService {

  private http: RestService
  constructor(http: RestService) {
    this.http = http;

  }

  /**
   * Fetch a single process with all its properties from TM1
   * 
   * @param {string} processName The name of the process
   * @returns {Process} An instance of the `Process` model
   */

  async get(processName: string): Promise<Process> {
    const url = `/api/v1/Processes('${fixedEncodeURIComponent(processName)}')?$select=*,\
        UIData,\
        VariablesUIData,\
        DataSource/dataSourceNameForClient,\
        DataSource/dataSourceNameForServer,\
        DataSource/asciiDecimalSeparator,\
        DataSource/asciiDelimiterChar,\
        DataSource/asciiDelimiterType,\
        DataSource/asciiHeaderRecords,\
        DataSource/asciiQuoteCharacter,\
        DataSource/asciiThousandSeparator,\
        DataSource/subset,\
        DataSource/view,\
        DataSource/userName,\
        DataSource/password,\
        DataSource/query,\
        DataSource/usesUnicode`;

    const response = await this.http.GET(url);
    return Process.fromJson(response);
  }


  /**
   * Fetch all processes and their properties from TM1
   * 
   * @returns {Process[]} An array of the `Process` model
   */

  async getAll(): Promise<Process[]> {
    const url = `/api/v1/Processes?$select=*,\
        UIData,\
        VariablesUIData,\
        DataSource/dataSourceNameForClient,\
        DataSource/dataSourceNameForServer,\
        DataSource/asciiDecimalSeparator,\
        DataSource/asciiDelimiterChar,\
        DataSource/asciiDelimiterType,\
        DataSource/asciiHeaderRecords,\
        DataSource/asciiQuoteCharacter,\
        DataSource/asciiThousandSeparator,\
        DataSource/subset,\
        DataSource/view,\
        DataSource/userName,\
        DataSource/password,\
        DataSource/query,\
        DataSource/usesUnicode`;

    const response = await this.http.GET(url);
    return response['value'].map((p: Process) => Process.fromJson(p));
  }

  /**
   * Fetch all process names from TM1
   * 
   * @returns {string[]} An array of processs names
   */

  async getAllNames(): Promise<string[]> {
    const response = await this.http.GET('/api/v1/Processes?$select=Name')
    return response['value'].map((p: any) => p['Name']);
  }

  /**
   * Create a process in TM1
   * 
   * @param {Process} process The process to create. An instance of the `Process` model
   * @returns 
   */

  async create(process: Process): Promise<any> {
    return this.http.POST(`/api/v1/Processes`, process.body);
  }

  /**
   * Update a process in TM1
   * 
   * @param {Process} process The process to update. An instance of the `Process` model
   * @returns 
   */

  async update(process: Process): Promise<any> {
    return this.http.PATCH(`/api/v1/Processes('${fixedEncodeURIComponent(process.name)}')`, process.body);
  }

  /**
   * Delete a process in TM1
   * 
   * @param {string} processName The name of the process
   * @returns 
   */
  async delete(processName: string): Promise<any> {
    return this.http.DELETE(`/api/v1/Processes('${fixedEncodeURIComponent(processName)}')`);
  }

  /**
   * Execute a process in TM1 
   * 
   * @param {string} processName The name of the process
   * @param {{Name: string, Value: string | number}} [parameters] Optional. Valid parameters to run the process with
   * @returns 
   */

  async execute(processName: string, parameters?: { Name: string, Value: string | number }[]) {
    const url = `/api/v1/Processes('${fixedEncodeURIComponent(processName)}')/tm1.Execute`;
    const body = { Parameters: parameters };
    return this.http.POST(url, body);
  }

  /**
   * Execute lines of TI code through a transient process
   * 
   * @param {string} prolog The statements for the prolog procedure
   * @param {string} [epilog] Optional. The statements for the epilog procedure
   * @returns 
   */

  async executeTICode(prolog: string, epilog: string = '') {

    const name = '}TM1ts_' + uuid();
    let process = new Process(name, false, { prolog, epilog });
    try {
      await this.create(process);
      return this.executeWithReturn(process.name);
    } catch (e) {
      console.log(e);
    } finally {
      await this.delete(process.name);
    }

  }

  /**
   * Execute a process in TM1 with optional parameters e.g
   * tm1.processes.executeWithReturn('ProcessName', [{ Name: 'pSleep', Value: 500 }, {...}])
   * 
   * @param {string} processName The name of the process
   * @param {{Name: string, Value: string | number}[]} [parameters] Optional. Valid parameters to run the process with
   * @returns 
   */

  async executeWithReturn(processName: string, parameters?: { Name: string, Value: string | number }[]): Promise<ProcessExecuteResult> {
    const url = `/api/v1/Processes('${fixedEncodeURIComponent(processName)}')/tm1.ExecuteWithReturn?$expand=ErrorLogFile`;
    const body = { Parameters: parameters };
    const result = await this.http.POST(url, body);
    return result as unknown as ProcessExecuteResult
  }

  /**
   * Execute TI code using an unbound process
   * 
   * @param {Process} process The unbound process to execute. An instance of the `Process` model
   * @param {ProcessParameter[]} [parameters] Optional. An array of the `ProcessParameter` interface 
   * @returns {ProcessExecuteResult} An instance of `ProcessExecuteResult` 
   */

  @MinimumVersion(11.3)
  async executeProcessWithReturn(process: Process, parameters?: ProcessParameter[]): Promise<ProcessExecuteResult> {
    const url = '/api/v1/ExecuteProcessWithReturn?$expand=ErrorLogFile';
    const params = []
    if (parameters) {
      for (const { Name, Value } of parameters) {
        process.removeParameter(Name)
        process.addParameter(Name, Value)
        params.push({ Name, Value })
      }
    }

    const body = { Process: process.body, Parameters: params }
    const result = this.http.POST(url, body)
    return result as unknown as ProcessExecuteResult
  }

  /**
   * Compile a process in TM1
   * 
   * @param {string} processName The name of the process to compile
   * @returns {ProcessSyntaxError[]} An array of syntax errors. Instances of the `ProcessSyntaxError` interface
   */

  async compile(processName: string): Promise<ProcessSyntaxError[]> {
    const url = `/api/v1/Processes('${fixedEncodeURIComponent(processName)}')/tm1.Compile`;
    const res = await this.http.POST(url, null);
    return res['value']
  }

  /**
   * Compile an unbound process in TM1
   * 
   * @param {Process} process The process to compile. An instance of the `Process` model
   * @returns {ProcessSyntaxError[]} An array of syntax errors. Instances of the `ProcessSyntaxError` interface
   */

  async compileProcess(process: Process): Promise<AxiosResponse<ProcessSyntaxError[]>> {
    const body = { Process: process.body };
    const res = await this.http.POST('/api/v1/CompileProcess', body)
    return res['value']
  }

  /**
   * Fetch the contents of the error log file from TM1
   * 
   * @param {string} filename The name of the error log file
   * @returns {string} The contents of the error log file as text
   */

  async getErrorLogFileContent(filename: string) {
    return this.http.GET(
      `/api/v1/ErrorLogFiles('${fixedEncodeURIComponent(filename)}')/Content`,
      { responseType: 'text' }
    );
  }

  /**
   * Check if a process exists in TM1
   * 
   * @param {string} processName The name of the process 
   * @returns {boolean} If the process exists
   */

  async exists(processName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Processes('${fixedEncodeURIComponent(processName)}')?$select=Name`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false;
      }
      return e;
    }
  }
}

export default ProcessService;