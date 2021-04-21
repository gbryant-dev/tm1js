import { User } from "./user";


class Group { 

  public name: string;
  public users?: User[];

  constructor(name: string, users?: User[]) {
    this.name = name;

    if (users) {
      this.users = [];
      for (const u of users) {
        const user = User.fromJson(u);
        this.users.push(user);
      }
    }
  }


  static fromJson(data: any) {
    return new Group(
      data.Name,
      data.Users
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