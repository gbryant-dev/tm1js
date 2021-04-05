import Process, { ProcessParameter } from "../models/process";
import RestService from "./rest-service";


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

    async execute(processName: string, parameters: ProcessParameter[]) {
      const url = `/api/v1/Processes('${processName})/tm1.Execute`;
      const body = { Parameters: parameters };
      return await this.http.POST(url, body);
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