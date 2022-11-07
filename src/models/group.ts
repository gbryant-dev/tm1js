import { User, UserResponse } from './user'

class Group {
  public name: string
  public users: User[]

  constructor(name: string, users?: User[]) {
    this.name = name

    if (users) {
      this.users = []
      for (const user of users) {
        this.users.push(user)
      }
    }
  }

  static fromJson(data: GroupResponse) {
    return new Group(
      data.Name,
      data.Users?.map((user) => User.fromJson(user)) ?? []
    )
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {
      Name: this.name
    }

    return body
  }
}

interface GroupResponse {
  Name: string
  Users: UserResponse[]
}

interface GroupsResponse {
  value: GroupResponse[]
}

export { Group, GroupResponse, GroupsResponse }
