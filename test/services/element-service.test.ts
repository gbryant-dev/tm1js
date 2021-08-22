import { ElementType, HierarchyElement } from "../../src/models";
import Dimension from "../../src/models/dimension";
import Hierarchy from "../../src/models/hierarchy";


describe('ElementService', () => {

  const prefix = 'TM1ts_test_';
  const dimensionName = prefix + 'dimension_element';
  const hierarchyName = dimensionName;
  const element1 = 'Element 1';
  const element2 = 'Element 2';

  const setup = async () => {
    const elements = [
      new HierarchyElement(element1, 'Numeric'),
      new HierarchyElement(element2, 'Numeric')
    ]

    const hierarchy = new Hierarchy(hierarchyName, dimensionName, elements)
    const dimension = new Dimension(dimensionName, [hierarchy]);

    if (await global.tm1.dimensions.exists(dimensionName)) {
      await global.tm1.dimensions.delete(dimensionName);
    }
    await global.tm1.dimensions.create(dimension);

  }
  const cleanup = async () => {
    await global.tm1.dimensions.delete(dimensionName);
  }


  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single element in a hierarchy', async () => {
    const element = await global.tm1.dimensions.hierarchies.elements.get(dimensionName, hierarchyName, element1);
    expect(element).toBeInstanceOf(HierarchyElement);
    expect(element.name).toEqual(element1);
    expect(element.type).toEqual(ElementType.Numeric)
  })

  it('Should fetch all elements in a hierarchy', async () => {
    const elements = await global.tm1.dimensions.hierarchies.elements.getAll(dimensionName, hierarchyName);
    expect(elements).toHaveLength(2);
  })

  it.todo('Should fetch all element names in a hierarchy')
  it.todo('Should create a new element in a hierarchy')
  it.todo('Should update an element in a hierarchy')
  it.todo('Should delete an element from a hierarchy')
  it.todo('Should should fetch all leaf level elements in a hierarchy')
  it.todo('Should should fetch all leaf level element names in a hierarchy')

})