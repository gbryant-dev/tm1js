import { Group } from "../models/group";
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

  // createUser
  async createUser(user: User) {
    return this.http.POST(`/api/v1/Users('${user.name}')`, user.body);
  }

  // updateUser
  async updateUser(user: User) {
    return this.http.PATCH(`/api/v1/Users('${user.name}')`, user.body);
  }

  // deleteUser
  async deleteUser(user: User) {
    return this.http.DELETE(`/api/v1/Users('${user.name}')`);
  }

  // getAllGroups
  async getAllGroups () {
    const response = this.http.GET('/api/v1/Groups');
    return response['value'].map(group => Group.fromJson(group));
  }

  // getGroup
  async getGroup (groupName: string) {
    const response = this.http.GET(`/api/v1/Groups('${groupName}')`);
    return Group.fromJson(response);
  }

  async getUserGroups (userName: string): Promise<Group[]> {
    const response = this.http.GET(`/api/v1/Users('${userName}')/Groups`);
    return response['value'].map((group: Group) => Group.fromJson(group));
  }

  // createGroup
  async createGroup (group: Group) {
    return this.http.POST('/api/v1/Groups', group.body);
  }

  // updateGroup
  async updateGroup (group: Group) {
    return this.http.PATCH(`/api/v1/Group('${group.name}')`, group.body);
  }

  // deleteGroup
  async deleteGroup (groupName: string) {
    return this.http.DELETE(`/api/v1/Groups('${groupName}')`);
  }

  // addUserToGroup
  async addUserToGroups (user: User, groups: string[]) {
    const currentGroups = await this.getUserGroups(user.name);
    
    const body = {
      'Groups@odata.bind': [
        ...currentGroups.map((group: Group) => `Groups('${group.name}')`),
        ...groups.map((group: string) => `Groups('${group}')`)
      ]
    }
    return this.http.PATCH(`/api/v1/Users('${user.name}')`, body);
  }
  
  // removeUserFromGroup
  async removeUserFromGroup(userName: string, groupName: string) {
    const url = `/api/v1/Users('${userName}')/Groups?$id=Groups('${groupName}')`;
    return this.http.DELETE(url);
  }
}


export { SecurityService }