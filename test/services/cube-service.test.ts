import { ElementType, HierarchyElement } from "../../src/models";
import Cube from "../../src/models/Cube";
import Dimension from "../../src/models/dimension";
import Hierarchy from "../../src/models/hierarchy";
import TM1Service from "../../src/services/tm1-service";

describe('CubeService', () => {
  
  const prefix = 'TM1ts_test_'
  const dimensionNames = [prefix + 'dimension1', prefix + 'dimension2', prefix + 'dimension3']
  const cubeName = prefix + 'cube'

  const setup = async () => {

    if (await global.tm1.cubes.exists(cubeName)) {
      await global.tm1.cubes.delete(cubeName)
    }

    for (const dimensionName of dimensionNames) {

      if (await global.tm1.dimensions.exists(dimensionName)) {
        await global.tm1.dimensions.delete(dimensionName)
      }

      const elements: HierarchyElement[] = []
      Array.from({ length: 250 }).forEach((_, i) => {
        const element = new HierarchyElement(`Element ${i}`, ElementType.Numeric)
        elements.push(element)
      })
      const hierarchy = new Hierarchy(dimensionName, dimensionName, elements)
      const dimension = new Dimension(dimensionName, [hierarchy])
      // Create dimension
      await global.tm1.dimensions.create(dimension)
      
    }

    // Create cube
    const cube = new Cube(cubeName, dimensionNames);

    await global.tm1.cubes.create(cube)
  }


  const cleanUp = async() => {
    await global.tm1.cubes.delete(cubeName)
    for (const dimensionName of dimensionNames) {
      await global.tm1.dimensions.delete(dimensionName)
    }
  }

  beforeAll(async () => {
    console.log('Setting up tests for [cube-service]');
    await setup()
  })
  
  afterAll(async () => {
    console.log('Cleaning up tests for [cube-service]');
    await cleanUp()
  })

  it('should fetch a single cube', async () => {
    const cube = await global.tm1.cubes.get(cubeName)
    expect(cube).toBeInstanceOf(Cube)
    expect(cube.name).toEqual(cubeName)
    expect(cube.dimensions.length).toEqual(3)
  })

  it.todo('should fetch a list of cubes')
  it.todo('should fetch a list of cube names');
  it.todo('should create a new cube');
  it.todo('should update an exisiting cube');
  it.todo('should delete a cube');
})