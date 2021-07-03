

describe('CubeService', () => {
  
  const setup = async () => {}

  it('should fetch a specific cube', async () => {    

    const cube = await global.tm1.cubes.get('Detail');
    expect(cube.name).toEqual('Detail')
  })
})