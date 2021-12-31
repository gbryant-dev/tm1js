import { Group, User } from "../../src/models"

describe('SecurityService', () => {

  const prefix = 'TM1ts_test_security_'
  const userNames = [prefix + 'user_1', prefix + 'user_2', prefix + 'user_3']
  const groupNames = [prefix + 'group_1', prefix + 'group_2', prefix + 'group_3']


  const setup = async () => {
    const group = new Group(groupNames[0])
    await global.tm1.security.createGroup(group)
    const newUser = new User(userNames[0], 'apple', [groupNames[0]])
    await global.tm1.security.createUser(newUser)
  }

  const cleanUp = async () => {
    if (await global.tm1.security.userExists(userNames[0])) {
      await global.tm1.security.deleteUser(userNames[0])
    }

    if (await global.tm1.security.groupExists(groupNames[0])) {
      await global.tm1.security.deleteGroup(groupNames[0])
    }
  }

  beforeAll(async () => await setup())
  afterAll(async () => await cleanUp())

  // **TODO** create a list of users first
  it.todo('Should fetch a single user')

  it.todo('Should create and delete a user')
  it.todo('Should fetch all users')
  it.todo('Should fetch the current user')
  it.todo('Should update a user')
  
  // **TODO** create a list of groups first
  it.todo('Should fetch a single group')
  it.todo('Should fetch all groups')
  it.todo('Should fetch groups belonging to a user')
  it.todo('Should create and delete a group')
  it.todo('Should update a group')
  it.todo('Should add a user to groups')
  it.todo('Should remove a user from a group')







})