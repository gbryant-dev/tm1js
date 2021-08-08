import { ElementType, HierarchyElement } from "../../src/models"
import Dimension from "../../src/models/dimension"
import Edge from "../../src/models/edge"
import ElementAttribute from "../../src/models/element-attribute"
import Hierarchy from "../../src/models/hierarchy"

describe('HierarchyService', () => {

  const prefix = 'TM1ts_test_'
  const dimensionName = prefix + 'some_hierarchy';
  const hierarchyName = dimensionName;


  const setup = async () => {

    if (await global.tm1.dimensions.exists(dimensionName)) {
      await global.tm1.dimensions.delete(dimensionName);
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
    const hierarchy = new Hierarchy(hierarchyName, dimensionName, elements, edges, elementAttributes);
    const dimension = new Dimension(dimensionName, [hierarchy]);

    await global.tm1.dimensions.create(dimension);


  }
  const cleanup = async () => {
    if (await global.tm1.dimensions.exists(dimensionName)) {
      await global.tm1.dimensions.delete(dimensionName);
    }
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single hierarchy', async () => {
    const hierarchy = await global.tm1.dimensions.hierarchies.get(dimensionName, hierarchyName);
    expect(hierarchy).toBeInstanceOf(Hierarchy);
    expect(hierarchy.name).toEqual(hierarchyName);
    expect(hierarchy.dimensionName).toEqual(dimensionName);
    expect(hierarchy.elements).toHaveLength(4);
    expect(hierarchy.elements[0]).toBeInstanceOf(HierarchyElement);
    expect(hierarchy.elementAttributes).toHaveLength(2);
    expect(hierarchy.elementAttributes[0]).toBeInstanceOf(ElementAttribute);
  });

  it('Should fetch a list of hierarchies', async () => {
    const hierarchies = await global.tm1.dimensions.hierarchies.getAll(dimensionName);
    expect(hierarchies[0]).toBeInstanceOf(Hierarchy);
  });
  
  it('Should create a hierarchy', async () => {
    const newHierarchyName = prefix + 'new';
    const elements = [
      new HierarchyElement('El 1', ElementType.Numeric),
      new HierarchyElement('El 2', ElementType.Numeric)
    ];
    
    const newHierarchy = new Hierarchy(newHierarchyName, dimensionName, elements);
    await global.tm1.dimensions.hierarchies.create(newHierarchy);
    const hierarchy = await global.tm1.dimensions.hierarchies.get(dimensionName, newHierarchyName);
    expect (hierarchy).toBeInstanceOf(Hierarchy);
    expect(hierarchy.name).toEqual(newHierarchyName);
    expect(hierarchy.dimensionName).toEqual(dimensionName);
    expect(hierarchy.elements).toHaveLength(2);

  });

  it('Should update a hierarchy', async () => {
    
    const hierarchy = await global.tm1.dimensions.hierarchies.get(dimensionName, hierarchyName);
    hierarchy.addElement('Parent 1', 'Consolidated');
    hierarchy.addEdge('Parent 1', 'Element 1', 1);
    
    await global.tm1.dimensions.hierarchies.update(hierarchy);
    const updatedHier = await global.tm1.dimensions.hierarchies.get(dimensionName, hierarchyName);
    expect(updatedHier.elements).toHaveLength(5);
    expect(updatedHier._edges.size).toEqual(2);
    

  });

  it('Should create and delete a hierarchy', async () => {
    const hierName = prefix + 'new_delete'
    const hierarchy = new Hierarchy(hierName, dimensionName);
    await global.tm1.dimensions.hierarchies.create(hierarchy);
    let exists = await global.tm1.dimensions.hierarchies.exists(dimensionName, hierName);
    expect(exists).toBeTruthy();
    await global.tm1.dimensions.hierarchies.delete(dimensionName, hierName);
    exists = await global.tm1.dimensions.hierarchies.exists(dimensionName, hierName);
    expect(exists).toBeFalsy();
  });

  it('Should update element attributes in a hierarchy', async () => {
    let hierarchy = await global.tm1.dimensions.hierarchies.get(dimensionName, hierarchyName);
    expect(hierarchy.elementAttributes).toHaveLength(2);
    hierarchy.deleteElementAttribute('Attribute 2');
    hierarchy.addElementAttribute('Attribute 3', 'Alias');
    hierarchy.addElementAttribute('Attribute 4', 'String');
    await global.tm1.dimensions.hierarchies.update(hierarchy);
    hierarchy = await global.tm1.dimensions.hierarchies.get(dimensionName, hierarchyName);
    expect(hierarchy.elementAttributes).toHaveLength(3);
  });

})