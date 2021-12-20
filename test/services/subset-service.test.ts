import { HierarchyElement } from "../../src/models";
import Dimension from "../../src/models/dimension";
import Hierarchy from "../../src/models/hierarchy";
import Subset from "../../src/models/subset";


describe('SubsetService', () => {

  const prefix = 'TM1_test_'
  const subsetName = prefix + 'subset';
  const dimensionName = prefix + 'subset_dimension';
  const elementNames = Array.from({ length: 100 }).map((_, i) => `Element ${i}`);

  const setup = async () => {

    // Create dimension with elements
    const elements = elementNames.map(element => new HierarchyElement(element, "Numeric"))
    const hierarchy = new Hierarchy(dimensionName, dimensionName, elements)
    const dimension = new Dimension(dimensionName, [hierarchy])
    
    await global.tm1.dimensions.create(dimension)

    // Create subset
    const subset = new Subset(subsetName, dimensionName, dimensionName, elementNames)
    
    await global.tm1.dimensions.hierarchies.subsets.create(subset)

  }
  const cleanUp = async () => {
    
    if (await global.tm1.dimensions.hierarchies.subsets.exists(dimensionName, dimensionName, subsetName)) {
      await global.tm1.dimensions.hierarchies.subsets.delete(dimensionName, dimensionName, subsetName)    
    }

    if (await global.tm1.dimensions.exists(dimensionName)) {
      await global.tm1.dimensions.delete(dimensionName)
    }
  }

  beforeAll(async () => await setup())
  afterAll(async () => await cleanUp())

  it('Should fetch a single subset', async () => {
    const subset = await global.tm1.dimensions.hierarchies.subsets.get(dimensionName, dimensionName, subsetName)
    expect(subset).toBeInstanceOf(Subset)
    expect(subset.name).toEqual(subsetName)
    expect(subset.dimensionName).toEqual(dimensionName)
    expect(subset.hierarchyName).toEqual(dimensionName)
    expect(subset.elements.length).toEqual(100)
    expect(subset.expression).toBeFalsy()

  })

  it('Should fetch all subset names', async () => {
    const subsetNames = await global.tm1.dimensions.hierarchies.subsets.getAllNames(dimensionName, dimensionName)
    expect(subsetNames).toEqual([subsetName])
  })
  
  it.todo('Should create and delete a subset')
  it.todo('Should update a subset')

})