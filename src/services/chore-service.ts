import Chore from "../models/chore";
import RestService from "./rest-service";


class ChoreService {

  private http: RestService
  constructor(http: RestService) {
    this.http = http;
  }

  async get(choreName: string): Promise<Chore> {
    const url = `/api/v1/Chores('${choreName}')?$expand=Tasks($expand=Process($select=Name,Parameters))`;
    const response = await this.http.GET(url);
    return Chore.fromJson(response);
  }

  async getAll(): Promise<Chore[]> {
    const url = '/api/v1/Chores?$expand=Tasks($expand=Process($select=Name,Parameters))';
    const response = await this.http.GET(url);
    return response['value'].map((chore: any) => Chore.fromJson(chore))
  }

  async getAllNames(): Promise<string[]> {
    const url = '/api/v1/Chores?$select=Name';
    const response = await this.http.GET(url);
    return response['value'].map((c: any) => c['Name']);
  }

  async create(chore: Chore): Promise<any> {
    const url = `/api/v1/Chores`;
    return await this.http.POST(url, chore.body);
  }

  async update(chore: Chore): Promise<any> {
    const url =  `/api/v1/Chores('${chore.name}')`;
    return await this.http.PATCH(url, chore.body);
  }

  async delete(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${choreName}')`;
    return await this.http.DELETE(url);
  }

  // *TODO
  async execute(choreName: string): Promise<any> {}
  async executeChore(choreName: string): Promise<any> {}

  async activate(choreName: string): Promise<any> { 
    const url = `/api/v1/Chores('${choreName}')/tm1.Activate`;
    return await this.http.POST(url, null);
  }

  async deactivate(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${choreName}')/tm1.Deactivate`;
    return await this.http.POST(url, null);
  }

  async exists(choreName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Chores('${choreName}')?$select=Name`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }

}

export default ChoreService;