import { User } from "./user";


class Group { 

  public name: string;
  public users?: User[];

  constructor(name: string, users?: User[]) {
    this.name = name;

    if (users) {
      this.users = [];
      for (const user of users) {
        this.users.push(user);
      }
    }
  }


  static fromJson(data: any) {
    return new Group(
      data.Name,
      data.Users?.map(user => User.fromJson(user)) ?? []
    );
  }

  get body() {
    return this.constructBody();
  }

  constructBody() {
    const body = {
      Name: this.name
    };

    return body;
  }
}

export { Group }