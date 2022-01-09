import { Group, User, UserType } from "../../src/models"
import TM1Service from '../../src/services/tm1-service'

declare global {
  namespace NodeJS {
    interface Global {
      tm1: TM1Service
    }
  }
}

describe('SecurityService', () => {

  const prefix = 'TM1ts_test_security_'
  const [userName1, userName2, userName3] = [prefix + 'user_1', prefix + 'user_2', prefix + 'user_3']
  const [groupName1, groupName2, groupName3] = [prefix + 'group_1', prefix + 'group_2', prefix + 'group_3']


  const createUserWithGroup = async (userName: string, groupName: string) => {
    const group = new Group(groupName)
    await global.tm1.security.createGroup(group)
    const newUser = new User(userName, 'apple', [groupName])
    await global.tm1.security.createUser(newUser)
  }

  const setup = async () => {
    for (const [userName, groupName] of [[userName1, groupName1], [userName2, groupName2], [userName3, groupName3]]) {
      await createUserWithGroup(userName, groupName)
    }
  }

  const cleanUp = async () => {

    for (const userName of [userName1, userName2, userName3]) {
      if (await global.tm1.security.userExists(userName)) {
        await global.tm1.security.deleteUser(userName)
      }
    }

    for (const groupName of [groupName1, groupName2, groupName3]) {
      if (await global.tm1.security.groupExists(groupName)) {
        await global.tm1.security.deleteGroup(groupName)
      }
    }
  }

  beforeAll(async () => await setup())
  afterAll(async () => await cleanUp())

  it('Should fetch a single user', async () => {
    const user = await global.tm1.security.getUser(userName1)
    expect(user).toBeInstanceOf(User)
    expect(user.name).toEqual(userName1)
    expect(user.groups.length).toEqual(1)
    expect(user.groups[0]).toEqual(groupName1)
    expect(user.type).toEqual(UserType.User)
  })

  it('Should fetch all users', async () => {
    const users = await global.tm1.security.getAllUsers()
    // Created users + Admin
    expect(users).toHaveLength(4)
    const userNames = users.map(user => user.name)
    expect(userNames).toEqual(['Admin', userName1, userName2, userName3])
  })

  it('Should fetch the current user', async () => {
    const currentUser = await global.tm1.security.getCurrentUser()
    expect(currentUser.name).toEqual('Admin')
    expect(currentUser.type).toEqual(UserType.Admin)
    expect(currentUser.groups).toEqual(['ADMIN'])
  })

  it('Should create and delete a user', async () => {

    const newUserName = prefix + 'new_user'
    const newUser = new User(newUserName, '', [groupName1])
    await global.tm1.security.createUser(newUser)

    const createdUser = await global.tm1.security.getUser(newUserName)
    expect(createdUser).toBeInstanceOf(User)
    expect(createdUser.name).toEqual(newUserName)
    expect(createdUser.type).toEqual(UserType.User)
    expect(createdUser.groups).toHaveLength(1)
    expect(createdUser.groups).toEqual([groupName1])

    await global.tm1.security.deleteUser(newUserName)
    const exists = global.tm1.security.userExists(newUserName)
    expect(exists).toBeFalsy()

  })

  it('Should update a user', async () => {
    const user1 = await global.tm1.security.getUser(userName1)
    expect(user1.groups).toHaveLength(1)
    expect(user1.type).toEqual(UserType.User)

    // Add group via User instance
    user1.addGroup('DataAdmin')
    await global.tm1.security.updateUser(user1)

    // Validate update
    const updatedUser = await global.tm1.security.getUser(userName1)
    expect(updatedUser.groups).toHaveLength(2)
    expect(updatedUser.groups).toContain('DataAdmin')
    expect(updatedUser.type).toEqual(UserType.DataAdmin)
    
  })
  
  it('Should fetch a single group', async () => {
    const group = await global.tm1.security.getGroup(groupName2)
    expect(group).toBeInstanceOf(Group)
    expect(group.name).toEqual(groupName2)
  })

  it('Should fetch all groups', async () => {
    const groups = await global.tm1.security.getAllGroups()
    // Four predefined groups plus three created groups
    expect(groups.length).toEqual(7)
  })

  it.todo('Should fetch groups belonging to a user')
  it.todo('Should create and delete a group')
  it.todo('Should update a group')
  it.todo('Should add a user to groups')
  it.todo('Should remove a user from a group')







})