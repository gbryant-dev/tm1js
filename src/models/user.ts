import { Group } from "./group";
import { Session } from './session';


class User { 

  public name: string;
  public password?: string;
  public groups?: string[];
  public friendlyName?: string;
  private _type?: UserTypeString;
  public isActive?: boolean;
  public enabled?: boolean;
  
  constructor(
    name: string,
    password?: string,
    groups?: string[],
    friendlyName?: string,
    type?: UserTypeString,
    isActive?: boolean,
    enabled?: boolean
  ) {
    this.name = name;
    this.password = password;
    
    this.groups = [];
    if (groups) {
      for (const g of groups) {
        this.groups.push(g);
      }
    }
    
    this.friendlyName = friendlyName;

    // Determine type based on group membership if not set
    if (type) {
      this._type = type
    } else {
      if (this.groups.includes('ADMIN')) {
        this._type = "Admin"
      } else if (this.groups.includes('SecurityAdmin')) {
        this._type = "SecurityAdmin"
      } else if (this.groups.includes('DataAdmin')) {
        this._type = "DataAdmin"
      } else if (this.groups.includes('OperationsAdmin')) {
        this._type = "OperationsAdmin"
      } else {
        this._type = "User"
      }
    }


    this.isActive = isActive;
    this.enabled = enabled;
  }

  get type() {
    return UserType[this._type.toString()]
  }

  set type(value: UserTypeString) {
    this._type = value
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
      data.Groups?.map(group => group.Name) ?? [],
      data.FriendlyName,
      data.Type,
      data.IsActive,
      data.Enabled
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

type UserTypeString = keyof typeof UserType

export { User, UserType }