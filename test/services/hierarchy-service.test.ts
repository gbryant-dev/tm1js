import { ElementType, HierarchyElement } from "../../src/models"
import Dimension from "../../src/models/dimension"
import Edge from "../../src/models/edge"
import ElementAttribute from "../../src/models/element-attribute"
import Hierarchy from "../../src/models/hierarchy"

describe('HierarchyService', () => {

  const prefix = 'TM1ts_test_'
  const hierarchyName = prefix + 'some_hierarchy'


  const setup = async () => {

    if (await global.tm1.dimensions.exists(hierarchyName)) {
      await global.tm1.dimensions.delete(hierarchyName);
    }
    
    const elements: HierarchyElement[] = [
      new HierarchyElement('Top', ElementType.Consolidated),
      new HierarchyElement('Element 1', ElementType.Numeric),
      new HierarchyElement('Element 2', ElementType.Numeric),
      new HierarchyElement('Element 3', ElementType.Numeric)
    ]

    const edges: Edge[] = [
      new Edge('Top', 'Element 1')
    ]

    const elementAttributes: ElementAttribute[] = [
      new ElementAttribute('Attribute 1', 'Numeric'),
      new ElementAttribute('Attribute 2', 'Alias')
    ]
    const hierarchy = new Hierarchy(hierarchyName, hierarchyName, elements, edges, elementAttributes);
    const dimension = new Dimension(hierarchyName, [hierarchy]);

    await global.tm1.dimensions.create(dimension);


  }
  const cleanup = async () => {
    await global.tm1.dimensions.delete(hierarchyName);
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single hierarchy', async () => {
    const hierarchy = await global.tm1.dimensions.hierarchies.get(hierarchyName, hierarchyName);
    expect(hierarchy).toBeInstanceOf(Hierarchy);
    expect(hierarchy.dimensionName).toEqual(hierarchyName);
    expect(hierarchy.elements).toHaveLength(4);
    expect(hierarchy.elements[0]).toBeInstanceOf(HierarchyElement);
    expect(hierarchy.edges).toHaveLength(1);
    expect(hierarchy.elementAttributes).toHaveLength(2);
    expect(hierarchy.elementAttributes[0]).toBeInstanceOf(ElementAttribute);
  });

  it.todo('Should fetch a list of hierarchies');
  it.todo('Should create a hierarchy');
  it.todo('Should update a hierarchy');
  it.todo('Should delete a hierarchy');
  it.todo('Should update element attributes in a hierarchy');



})