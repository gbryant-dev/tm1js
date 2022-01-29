import { HierarchyElement } from '../../src/models'
import Dimension from '../../src/models/dimension'
import Hierarchy from '../../src/models/hierarchy'
import Subset from '../../src/models/subset'

describe('SubsetService', () => {
  const prefix = 'TM1_test_'
  const subsetName = prefix + 'subset'
  const dimensionName = prefix + 'subset_dimension'
  const elementNames = Array.from({ length: 100 }).map((_, i) => `Element ${i}`)

  const setup = async () => {
    // Create dimension with elements
    const elements = elementNames.map(element => new HierarchyElement(element, 'Numeric'))
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

  it('Should create and delete a subset', async () => {
    const newSubsetName = prefix + 'subset_new'
    const elements = ['Element 1', 'Element 4', 'Element 7']
    const newSubsetObj = new Subset(newSubsetName, dimensionName, dimensionName, elements)
    await global.tm1.dimensions.hierarchies.subsets.create(newSubsetObj)

    const newSubset = await global.tm1.dimensions.hierarchies.subsets.get(dimensionName, dimensionName, newSubsetName)
    expect(newSubset.name).toEqual(newSubsetName)
    expect(newSubset.dimensionName).toEqual(dimensionName)
    expect(newSubset.elements.length).toEqual(3)
    expect(newSubset.elements).toEqual(elements)

    await global.tm1.dimensions.hierarchies.subsets.delete(dimensionName, dimensionName, newSubsetName)
    const exists = await global.tm1.dimensions.hierarchies.subsets.exists(dimensionName, dimensionName, newSubsetName)
    expect(exists).toBeFalsy()
  })

  it('Should update a subset', async () => {
    const originalSubset = await global.tm1.dimensions.hierarchies.subsets.get(dimensionName, dimensionName, subsetName)
    originalSubset.elements = ['Element 3', 'Element 6', 'Element 9']
    originalSubset.addElement('Element 12')
    await global.tm1.dimensions.hierarchies.subsets.update(originalSubset)

    const staticSubset = await global.tm1.dimensions.hierarchies.subsets.get(dimensionName, dimensionName, subsetName)
    expect(staticSubset.expression).toBeFalsy()
    expect(staticSubset.elements.length).toEqual(4)

    // Make subset dynamic
    const elements = ['Element 5', 'Element 10', 'Element 15']
    const uniqueNames = elements.map(element => `[${staticSubset.dimensionName}].[${staticSubset.hierarchyName}].[${element}]`)
    const expression = `{ ${uniqueNames.join(',')} }`
    staticSubset.expression = expression

    await global.tm1.dimensions.hierarchies.subsets.update(staticSubset)

    const dynamicSubset = await global.tm1.dimensions.hierarchies.subsets.get(dimensionName, dimensionName, subsetName)
    expect(dynamicSubset.name).toEqual(subsetName)
    expect(dynamicSubset.expression).toEqual(expression)
  })
})
