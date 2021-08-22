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
        const element = new HierarchyElement(`Element ${i}`, 'Numeric')
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
    await setup()
  })
  
  afterAll(async () => {
    await cleanUp()
  })

  it('should fetch a single cube', async () => {
    const cube = await global.tm1.cubes.get(cubeName)

    expect(cube).toBeInstanceOf(Cube)
    expect(cube.name).toEqual(cubeName)
    expect(cube.dimensions.length).toEqual(3)
  })

  it('should fetch a list of cubes', async () => {
    const allCubesRequest = global.tm1.cubes.getAll()
    const modelCubesRequest = global.tm1.cubes.getModelCubes()
    const controlCubesRequest = global.tm1.cubes.getControlCubes()

    const [allCubes, modelCubes, controlCubes] = await Promise.all([allCubesRequest, modelCubesRequest, controlCubesRequest])
    expect(allCubes.length).toEqual(modelCubes.length + controlCubes.length);

  })

  it('should create a new cube and delete it', async () => {
    const newCubeName = prefix + 'new';
    const newCube = new Cube(newCubeName, dimensionNames);
    await global.tm1.cubes.create(newCube);
    const cube = await global.tm1.cubes.get(newCubeName);
    
    expect(cube).toBeInstanceOf(Cube);
    expect(cube.name).toEqual(newCubeName);
    expect(cube.dimensions.length).toEqual(3)
    expect(cube.rules).toBeNull()

    await global.tm1.cubes.delete(newCubeName)
    const exists = await global.tm1.cubes.exists(newCubeName)
    expect(exists).toBeFalsy()
  });

  it('should update a cube', async () => {
    const rule = 'SKIPCHECK;\n\nFEEDERS;';
    const cube = await global.tm1.cubes.get(cubeName);
    cube.rules = rule;
    await global.tm1.cubes.update(cube);
    const updatedCube = await global.tm1.cubes.get(cubeName);
    expect (updatedCube.rules).toEqual(rule)
  });

  
})