import { User } from "../models/user";
import RestService from "./rest-service";

class SecurityService {

  private http: RestService;
  constructor(http: RestService) {
    this.http = http;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.http.GET('/api/v1/Users?$expand=Groups');
    return response['value'].map((user: any) => User.fromJson(user)) as User[];
  }

  async getUser(userName: string): Promise<User> {
    const response = await this.http.GET(`/api/v1/Users('${encodeURIComponent(userName)}')?$expand=Groups,Sessions`);
    return User.fromJson(response);
  }

  async getCurrentUser (): Promise<User> {
    const response = this.http.GET('/api/v1/ActiveUser?$expand=Groups,Sessions');
    return User.fromJson(response);
  }

  // updateUser

  // deleteUser

  // getAllGroups

  // getGroup

  // updateGroup

  // deleteGroup

  // addUserToGroup
  
  // removeUserFromGroup

}


export { SecurityService }