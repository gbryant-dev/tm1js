import RestService from "./rest-service";


class CellService {
  
  private http: RestService
  constructor(http: RestService) {
    this.http = http;
  }
}

export default CellService;