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

  it('Should fetch all element names in a hierarchy', async () => {
    const elementNames = await global.tm1.dimensions.hierarchies.elements.getAllNames(dimensionName, hierarchyName);
    expect(elementNames).toEqual(['Element 1', 'Element 2']);
  })

  it('Should create a new element in a hierarchy', async () => {
    const newElementName = 'Element 3';
    const newElement = new HierarchyElement(newElementName, 'Numeric');
    await global.tm1.dimensions.hierarchies.elements.create(dimensionName, hierarchyName, newElement);
    const createdElement = await global.tm1.dimensions.hierarchies.elements.get(dimensionName, hierarchyName, newElementName);
    expect(createdElement).toBeInstanceOf(HierarchyElement);
    expect(createdElement.name).toEqual(newElementName);
    expect(createdElement.type).toEqual(ElementType.Numeric);
  })

  it('Should update an element in a hierarchy', async () => {
    const element = await global.tm1.dimensions.hierarchies.elements.get(dimensionName, hierarchyName, 'Element 3');
    element.type = 'String';
    await global.tm1.dimensions.hierarchies.elements.update(dimensionName, hierarchyName, element);
    const updatedElement = await global.tm1.dimensions.hierarchies.elements.get(dimensionName, hierarchyName, 'Element 3');
    expect(updatedElement.type).toEqual(ElementType.String);
  })

  it('Should delete an element from a hierarchy', async () => {
    const elementToDelete = 'Element 1';
    const elements = await global.tm1.dimensions.hierarchies.elements.getAll(dimensionName, hierarchyName);
    const originalCount = elements.length;
    await global.tm1.dimensions.hierarchies.elements.delete(dimensionName, hierarchyName, elementToDelete);
    const updated = await global.tm1.dimensions.hierarchies.elements.getAll(dimensionName, hierarchyName);
    const updatedCount = updated.length;
    expect(updatedCount).toEqual(originalCount - 1);
    expect(updated.find(el => el.name === elementToDelete)).toBeUndefined();
  })

  it('Should should fetch all leaf level elements in a hierarchy', async () => {
    const elements = await global.tm1.dimensions.hierarchies.elements.getAllLeaf(dimensionName, hierarchyName); 
    const originalCount = elements.length;
    const newConsolName = 'Consol 1';
    const newConsol = new HierarchyElement(newConsolName, 'Consolidated');
    await global.tm1.dimensions.hierarchies.elements.create(dimensionName, hierarchyName, newConsol);
    const updated = await global.tm1.dimensions.hierarchies.elements.getAllLeaf(dimensionName, hierarchyName);
    const updatedCount = updated.length;
    expect(updated.find(el => el.type === 'Consolidated')).toBeUndefined();
    expect(originalCount).toEqual(updatedCount);
  })

  it('Should should fetch all leaf level element names in a hierarchy', async () => {
    // First recreate hierarchy
    await setup();
    const elements = await global.tm1.dimensions.hierarchies.elements.getAllLeafNames(dimensionName, hierarchyName);
    expect(elements).toEqual(['Element 1', 'Element 2']);
  })
})