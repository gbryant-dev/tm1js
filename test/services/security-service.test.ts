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
    console.log(currentUser)
    expect(currentUser.name).toEqual('Admin')
    expect(currentUser.type).toEqual(UserType.Admin)
    expect(currentUser.groups).toEqual(['ADMIN'])
  })

  it.todo('Should create and delete a user')
  it.todo('Should update a user')
  
  it.todo('Should fetch a single group')
  it.todo('Should fetch all groups')
  it.todo('Should fetch groups belonging to a user')
  it.todo('Should create and delete a group')
  it.todo('Should update a group')
  it.todo('Should add a user to groups')
  it.todo('Should remove a user from a group')







})