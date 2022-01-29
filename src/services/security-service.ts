import { Group } from '../models/group'
import { User } from '../models/user'
import { fixedEncodeURIComponent } from '../utils/helpers'
import RestService from './rest-service'

/** Service to handle security operations in TM1 */
class SecurityService {
  private http: RestService;
  constructor (http: RestService) {
    this.http = http
  }

  /**
   * Fetch all users and their groups from TM1
   *
   * @returns {User[]} Instances of the `User` model
   */

  async getAllUsers (): Promise<User[]> {
    const response = await this.http.GET('/api/v1/Users?$expand=Groups')
    return response['value'].map((user: any) => User.fromJson(user))
  }

  /**
   * Fetch a single user and their gropups and sessions from TM1
   *
   * @param {string} userName The user name of the user
   * @returns {User} An instance of the `User` model
   */

  async getUser (userName: string): Promise<User> {
    const response = await this.http.GET(`/api/v1/Users('${fixedEncodeURIComponent(userName)}')?$expand=Groups,Sessions`)
    return User.fromJson(response)
  }

  /**
   * Fetch the current user and their groups and sessions from TM1
   *
   * @returns {User} An instance of the `User` model
   */

  async getCurrentUser (): Promise<User> {
    const response = await this.http.GET('/api/v1/ActiveUser?$expand=Groups,Sessions')
    return User.fromJson(response)
  }

  /**
   * Create a user in TM1
   *
   * @param {User} user The user to create. An instance of the `User` model
   * @returns
   */

  async createUser (user: User) {
    return this.http.POST('/api/v1/Users', user.body)
  }

  /**
   * Update a user, such as its group membership in TM1
   *
   * @param {User} user The user to update. An instance of the `User` model
   * @returns
   */

  async updateUser (user: User) {
    // Remove groups that are no longer in the user object
    const groups = await this.getUserGroups(user.name)
    for (const group of groups) {
      if (!user.groups.includes(group.name)) {
        await this.removeUserFromGroup(user.name, group.name)
      }
    }
    return this.http.PATCH(`/api/v1/Users('${fixedEncodeURIComponent(user.name)}')`, user.body)
  }

  /**
   * Delete a user in TM1
   *
   * @param {string} userName The user to delete
   * @returns
   */

  async deleteUser (userName: string) {
    return this.http.DELETE(`/api/v1/Users('${fixedEncodeURIComponent(userName)}')`)
  }

  /**
   * Fetch all security groups from TM1
   *
   * @returns {Group[]} Instances of the `Group` model
   */

  async getAllGroups (): Promise<Group[]> {
    const response = await this.http.GET('/api/v1/Groups')
    return response['value'].map(group => Group.fromJson(group))
  }

  /**
   * Fetch a single security group from TM1
   *
   * @param {string} groupName The name of the group
   * @returns {Group} An instance of the `Group` model
   */

  async getGroup (groupName: string): Promise<Group> {
    const response = await this.http.GET(`/api/v1/Groups('${fixedEncodeURIComponent(groupName)}')?$expand=Users`)
    return Group.fromJson(response)
  }

  /**
   * Fetch the list of security groups a user belongs to in TM1
   *
   * @param {string} userName The user name of the user
   * @returns {Group[]} Instances of the `Group` model
   */

  async getUserGroups (userName: string): Promise<Group[]> {
    const response = await this.http.GET(`/api/v1/Users('${fixedEncodeURIComponent(userName)}')/Groups`)
    return response['value'].map((group: Group) => Group.fromJson(group))
  }

  /**
   * Create a security group in TM1
   *
   * @param {Group} group The security group to create. An instance of the `Group` model
   * @returns
   */

  async createGroup (group: Group) {
    return this.http.POST('/api/v1/Groups', group.body)
  }

  /**
   * Delete a security group in TM1
   *
   * @param {string} groupName The name of the security group to delete
   * @returns
   */

  async deleteGroup (groupName: string) {
    return this.http.DELETE(`/api/v1/Groups('${fixedEncodeURIComponent(groupName)}')`)
  }

  /**
   * Add a user from one or more security groups in TM1
   *
   * @param {User} The user to update. An instance of the `User` model
   * @param {string[]} groups An array of strings representing existing security group names
   * @returns
   */

  async addUserToGroups (user: User, groups: string[]) {
    const currentGroups = await this.getUserGroups(user.name)

    const body = {
      'Groups@odata.bind': [
        ...currentGroups.map((group: Group) => `Groups('${fixedEncodeURIComponent(group.name)}')`),
        ...groups.map((group: string) => `Groups('${fixedEncodeURIComponent(group)}')`)
      ]
    }
    return this.http.PATCH(`/api/v1/Users('${fixedEncodeURIComponent(user.name)}')`, body)
  }

  /**
   * Remove a user from a security group in TM1
   *
   * @param {string} userName The user name of the user to update
   * @param {string} groupName The name of the security group to remove
   * @returns
   */

  async removeUserFromGroup (userName: string, groupName: string) {
    const url = `/api/v1/Users('${fixedEncodeURIComponent(userName)}')/Groups?$id=Groups('${fixedEncodeURIComponent(groupName)}')`
    return this.http.DELETE(url)
  }

  /**
   * Check if a user exists in TM1
   *
   * @param {string} userName The user name of the user
   * @returns {boolean} If the user exists
   */

  async userExists (userName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Users('${fixedEncodeURIComponent(userName)}')`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }

  /**
   * Check if a security group exists in TM1
   *
   * @param {string} groupName The name of the group
   * @returns {boolean} If the group exists
   */

  async groupExists (groupName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Groups('${fixedEncodeURIComponent(groupName)}')`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }
}

export { SecurityService }
