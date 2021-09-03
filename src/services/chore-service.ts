import Chore from "../models/chore";
import RestService from "./rest-service";


class ChoreService {

  private http: RestService
  constructor(http: RestService) {
    this.http = http;
  }

  async get(choreName: string): Promise<Chore> {
    const url = `Chores('${choreName}')?$expand=Tasks($expand=Process($select=Name,Parameters))`;
    const response = await this.http.GET(url);
    return Chore.fromJson(response);
  }



}

export default ChoreService;