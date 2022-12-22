describe('ServerService', () => {
  it('Should get the name of the TM1 server', async () => {
    const serverName = await global.tm1.server.getServerName()
    expect(serverName).not.toBeUndefined()
    expect(typeof serverName).toBe('string')
    expect(serverName.length).toBeGreaterThan(0)
  })

  it('Should get the data directory of the TM1 server', async () => {
    const dataDirectory = await global.tm1.server.getDataDirectory()
    expect(dataDirectory).not.toBeUndefined()
    expect(typeof dataDirectory).toBe('string')
    expect(dataDirectory.length).toBeGreaterThan(0)
  })

  it('Should get the version of the TM1 server', async () => {
    const version = await global.tm1.server.getServerVersion()
    expect(version).not.toBeUndefined()
    expect(version).toEqual(global.tm1.version)
  })

  it('Should get the admin host for the TM1 server', async () => {
    const adminHost = await global.tm1.server.getAdminHost()
    expect(adminHost).not.toBeUndefined()
    expect(typeof adminHost).toBe('string')
    expect(adminHost.length).toBeGreaterThan(0)
  })

  it('Should get the configuration of the TM1 server', async () => {
    const configuration = await global.tm1.server.getConfiguration()
    expect(configuration).not.toBeUndefined()
    expect(configuration).toBeInstanceOf(Object)
    expect('ServerName' in configuration).toBeTruthy()
    expect('HTTPPortNumber' in configuration).toBeTruthy()
    expect('AdminHost' in configuration).toBeTruthy()
  })
})
