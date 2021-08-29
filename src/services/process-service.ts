import { AxiosResponse } from "axios";
import { ProcessExecuteResult, ProcessSyntaxError } from "../models/misc";
import Process, { ProcessParameter } from "../models/process";
import RestService from "./rest-service";
import { v4 as uuid } from 'uuid';

class ProcessService {

    private http: RestService
    constructor(http: RestService) {
        this.http = http;

    }

    async get(processName: string): Promise<Process> {
        const url = `/api/v1/Processes('${processName}')?$select=*,\
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

    async getAllNames(): Promise<string[]> {
        const response = await this.http.GET('/api/v1/Processes?$select=Name')
        return response['value'].map((p: any) => p['Name']);
    }

    async create(process: Process): Promise<any> {
        return await this.http.POST(`/api/v1/Processes`, process.body);
    }

    async update(process: Process): Promise<any> {
        return await this.http.PATCH(`/api/v1/Processes('${process.name}')`, process.body);
    }

    async delete(processName: string): Promise<any> {
        return await this.http.DELETE(`/api/v1/Processes('${processName}')`);
    }

    async execute(processName: string, parameters?: { Name: string, Value: string | number }[]) {
      const url = `/api/v1/Processes('${processName}')/tm1.Execute`;
      const body = { Parameters: parameters };
      return await this.http.POST(url, body);
    }

    async executeTICode (prolog: string, epilog: string = '') {

      const name = '}TM1ts_' + uuid();
      let process = new Process(name, false, { prolog, epilog });
      try { 
        await this.create(process);
        return await this.executeWithReturn(process.name);
      } catch (e) {
        console.log(e);
      } finally {
        await this.delete(process.name);
      }

    }

    async executeWithReturn (processName: string, parameters?: { Name: string, Value: string | number }[]): Promise<ProcessExecuteResult> {
      const url = `/api/v1/Processes('${processName}')/tm1.ExecuteWithReturn?$expand=ErrorLogFile`;
      const body = { Parameters: parameters };
      const result = await this.http.POST(url, body);
      return result as unknown as ProcessExecuteResult
    }

    async compile(processName: string) {
      const url = `/api/v1/Processes('${processName}')/tm1.Compile`;
      const res = await this.http.POST(url, null);
      return res['value']
      
    }

    async compileProcess (process: Process): Promise<AxiosResponse<ProcessSyntaxError[]>> {
      const body = { Process: process.body };
      const res = await this.http.POST('/api/v1/CompileProcess', body)
      return res['value']
    }

    async getErrorLogFileContent(filename: string) {
      return await this.http.GET(
        `/api/v1/ErrorLogFiles('${filename}')/Content`,
        { responseType: 'text' }
      );
    }

    async exists(processName: string): Promise<boolean> {
        try {
            await this.http.GET(`/api/v1/Processes('${processName}')?$select=Name`);
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