import { ElementType, HierarchyElement } from "../../src/models"
import Dimension from "../../src/models/dimension"
import Edge from "../../src/models/edge"
import Hierarchy from "../../src/models/hierarchy"


describe('DimensionService', () => {


  const prefix = 'TM1ts_test_'
  const dimensionName = prefix + 'some_dimension'

  const setup = async () => {

    if (await global.tm1.dimensions.exists(dimensionName)) {
      await global.tm1.dimensions.delete(dimensionName)
    }

    const topElement = new HierarchyElement('Top', ElementType.Consolidated);
    const elements = [topElement]
    const edges: Edge[] = []

    Array.from({ length: 250 }).forEach((_, i) => {
      const element = new HierarchyElement(`Element ${i}`, ElementType.Numeric);
      elements.push(element)
      const edge = new Edge(topElement.name, element.name, 1)
      edges.push(edge)
    });

    const hierarchy = new Hierarchy(dimensionName, dimensionName, elements, edges)
    const dimension = new Dimension(dimensionName, [hierarchy])

    await global.tm1.dimensions.create(dimension)


  }

  const cleanup = async () => {
    await global.tm1.dimensions.delete(dimensionName)
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })


  it('should fetch a single dimension', async () => {
    const dim = await global.tm1.dimensions.get(dimensionName)
    expect(dim).toBeInstanceOf(Dimension)
    expect(dim.name).toEqual(dimensionName)
    expect(dim.hierarchies.length).toEqual(1)

    const hier = dim.hierarchies[0]
    expect(hier).toBeInstanceOf(Hierarchy)
    expect(hier.name).toEqual(dimensionName)
    expect(hier.elements.length).toEqual(251)
    expect(hier.edges.length).toEqual(250)

  })

  it('should fetch a list of dimensions', async () => {
    const allDimsRequest = global.tm1.dimensions.getAll()
    const allModelDimsRequest = global.tm1.dimensions.getModelDimensions()
    const allControlDimsRequest = global.tm1.dimensions.getControlDimensions()

    const [allDims, modelDims, controlDims] = await Promise.all([allDimsRequest, allModelDimsRequest, allControlDimsRequest])
    expect(allDims.length).toEqual(modelDims.length + controlDims.length);

  })

  it('should create a new dimension and delete it', async () => {
    const newDimName = prefix + 'new';
    const hierarchy = new Hierarchy(newDimName, newDimName)
    const dimension = new Dimension(newDimName, [hierarchy])

    await global.tm1.dimensions.create(dimension)

    const createdDim = await global.tm1.dimensions.get(newDimName)
    expect (createdDim).toBeInstanceOf(Dimension)
    expect (createdDim.name).toEqual(newDimName)
    expect (createdDim.hierarchies.length).toEqual(1)
    const hier = createdDim.hierarchies[0]
    expect (hier).toBeInstanceOf(Hierarchy)
    expect (hier.elements.length).toEqual(0)

    let exists = await global.tm1.dimensions.exists(newDimName)
    expect(exists).toBeTruthy()

    await global.tm1.dimensions.delete(newDimName)
    exists = await global.tm1.dimensions.exists(newDimName)
    expect(exists).toBeFalsy()

  });
  
  it.todo('should update a dimension');

})