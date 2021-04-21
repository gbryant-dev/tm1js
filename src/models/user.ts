import { Group } from "./group";
import { Session } from './session';


class User { 

  public name: string;
  public friendlyName: string;
  public type: UserType;
  public isActive: boolean;
  public enabled: boolean;
  public password?: string;
  public groups?: Group[];
  public sessions?: Session[];
  
  constructor(
    name: string,
    friendlyName: string,
    type: UserType,
    isActive: boolean,
    enabled: boolean,
    password?: string,
    groups?: Group[],
    sessions?: Session[]
  ) {
    this.name = name;
    this.friendlyName = friendlyName;
    this.type = type;
    this.isActive = isActive;
    this.enabled = enabled;
    this.password = password;

    if (groups) {
      for (const g of groups) {
        this.groups = [];
        const group = Group.fromJson(g);
        this.groups.push(group);
      }
    }

    if (sessions) {
      for (const s of sessions) {
        this.sessions = [];
        const session = Session.fromJson(s);
        this.sessions.push(session);
      }
    }
  }


  static fromJson(data: any) {
    return new User(
      data.Name,
      data.FriendlyName,
      data.Type,
      data.isActive,
      data.Enabled,
      data.Password,
      data.Groups,
      data.Sessions
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
        body['Groups@odata.bind'].push(`Groups('${group.name}')`);
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