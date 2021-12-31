import { Group } from "./group";
import { Session } from './session';


class User { 

  public name: string;
  public password?: string;
  public groups?: string[];
  public friendlyName?: string;
  public type?: UserType;
  public isActive?: boolean;
  public enabled?: boolean;
  public sessions?: Session[];
  
  constructor(
    name: string,
    password?: string,
    groups?: string[],
    friendlyName?: string,
    type?: UserType,
    isActive?: boolean,
    enabled?: boolean,
    sessions?: Session[]
  ) {
    this.name = name;
    this.friendlyName = friendlyName;
    this.type = type;
    this.isActive = isActive;
    this.enabled = enabled;
    this.password = password;

    this.groups = [];
    if (groups) {
      for (const g of groups) {
        this.groups.push(g);
      }
    }

    this.sessions = [];
    if (sessions) {
      for (const s of sessions) {
        this.sessions.push(s);
      }
    }
  }

  addGroup(groupName: string) {
    if (!this.groups.includes(groupName)) {
      this.groups.push(groupName)
    }
  }

  removeGroup(groupName: string) {
    const index = this.groups.findIndex(group => group === groupName)
    if (index !== -1) {
      this.groups.splice(index)
    }
  }


  static fromJson(data: any) {
    return new User(
      data.Name,
      data.Password,
      data.Groups.map(group => Group.fromJson(group.Name)),
      data.FriendlyName,
      data.Type,
      data.isActive,
      data.Enabled,
      data.Sessions.map(session => Session.fromJson(session))
    );
  }

  get body() {
    return this.constructBody();
  }

  constructBody() {
    const body = {
      Name: this.name,
      FriendlyName: this.friendlyName ?? this.name,
      Type: this.type,
      Enabled: this.enabled
    };

    if (this.password) {
      body['Password'] = this.password
    }

    if (this.groups?.length > 0) {
      body['Groups@odata.bind'] = [];
      for (const group of this.groups) {
        body['Groups@odata.bind'].push(`Groups('${group}')`);
      }
    }

    return body;
  }
}

enum UserType {
  User = "0",
  SecurityAdmin = "1",
  DataAdmin = "2",
  Admin = "3",
  OperationsAdmin = "4"
}

export { User, UserType }