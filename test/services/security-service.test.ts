import { Group, User, UserType } from '../../src/models'

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
    expect(user.groups.size).toEqual(1)
    expect(user.groups.keys().next().value).toEqual(groupName1.toLowerCase())
    expect(user.type).toEqual(UserType.User)
  })

  it('Should fetch all users', async () => {
    const users = await global.tm1.security.getAllUsers()
    users.forEach(user => expect(user).toBeInstanceOf(User))
  })

  it('Should fetch the current user', async () => {
    const currentUser = await global.tm1.security.getCurrentUser()
    expect(currentUser.type).toEqual(UserType.Admin)
    expect(currentUser.groups.has('ADMIN')).toBeTruthy()
  })

  it('Should create and delete a user', async () => {
    const newUserName = prefix + 'new_user'
    const newUser = new User(newUserName, '', [groupName1])
    await global.tm1.security.createUser(newUser)

    const createdUser = await global.tm1.security.getUser(newUserName)
    expect(createdUser).toBeInstanceOf(User)
    expect(createdUser.name).toEqual(newUserName)
    expect(createdUser.type).toEqual(UserType.User)
    expect(createdUser.groups.size).toEqual(1)
    expect(createdUser.groups.has(groupName1)).toBeTruthy()

    await global.tm1.security.deleteUser(newUserName)
    const exists = await global.tm1.security.userExists(newUserName)
    expect(exists).toBeFalsy()
  })

  it('Should update a user', async () => {
    const user1 = await global.tm1.security.getUser(userName1)
    expect(user1.groups.size).toEqual(1)
    expect(user1.type).toEqual(UserType.User)

    // Add group via User instance
    user1.addGroup('DataAdmin')
    await global.tm1.security.updateUser(user1)

    // Validate update
    const userAfterGroupAdd = await global.tm1.security.getUser(userName1)
    expect(userAfterGroupAdd.groups.size).toEqual(2)
    expect(userAfterGroupAdd.groups.has('DataAdmin')).toBeTruthy()
    expect(userAfterGroupAdd.type).toEqual(UserType.DataAdmin)

    // Remove group via User instance
    userAfterGroupAdd.removeGroup('DataAdmin')

    await global.tm1.security.updateUser(userAfterGroupAdd)

    const userAfterGroupRemove = await global.tm1.security.getUser(userName1)
    expect(userAfterGroupRemove.groups.size).toEqual(1)
    expect(userAfterGroupRemove.groups).not.toContain('DataAdmin')
    expect(userAfterGroupRemove.type).toEqual(UserType.User)
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

  it('Should create and delete a group', async () => {
    const groupName = 'New Group'
    const group = new Group(groupName)
    await global.tm1.security.createGroup(group)

    const exists = await global.tm1.security.groupExists(groupName)
    expect(exists).toBeTruthy()

    const createdGroup = await global.tm1.security.getGroup(groupName)
    expect(createdGroup).toBeInstanceOf(Group)
    expect(createdGroup.name).toEqual(groupName)

    await global.tm1.security.deleteGroup(groupName)
    const shouldExist = await global.tm1.security.groupExists(groupName)
    expect(shouldExist).toBeFalsy()
  })

  it('Should add a user to groups', async () => {
    const user = await global.tm1.security.getUser(userName1)
    expect(user.groups.size).toEqual(1)
    expect(user.groups.has(groupName1)).toBeTruthy()

    await global.tm1.security.addUserToGroups(user, [groupName2, groupName3])
    const updatedUser = await global.tm1.security.getUser(userName1)
    expect(updatedUser.groups.size).toEqual(3)
    const expectedGroups = [groupName1, groupName2, groupName3]
    expect(expectedGroups.every(group => updatedUser.groups.has(group))).toBeTruthy()
  })

  it('Should remove a user from a group', async () => {
    const group = await global.tm1.security.getGroup(groupName2)
    const user = await global.tm1.security.getUser(userName2)
    expect(user.groups.has(groupName2)).toBeTruthy()
    expect(group.users.map(user => user.name).includes(userName2)).toBeTruthy()

    await global.tm1.security.removeUserFromGroup(userName2, groupName2)
    const updatedGroup = await global.tm1.security.getGroup(groupName2)
    const updatedUser = await global.tm1.security.getUser(userName2)

    expect(updatedGroup.users.map(user => user.name).includes(userName2)).toBeFalsy()
    expect(updatedUser.groups.has(userName2)).toBeFalsy()
  })

  it('Should fetch groups belonging to a user', async () => {
    const groups = await global.tm1.security.getUserGroups(userName3)
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toEqual(groupName3)
  })
})
