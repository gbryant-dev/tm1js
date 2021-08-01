import { ElementType, HierarchyElement } from "../../src/models"
import Dimension from "../../src/models/dimension"
import Edge from "../../src/models/edge"
import ElementAttribute from "../../src/models/element-attribute"
import Hierarchy from "../../src/models/hierarchy"
import { caseAndSpaceInsensitiveEquals } from "../../src/utils/helpers"


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
    const elementAttributes: ElementAttribute[] = [
      new ElementAttribute("Attribute 1", "Numeric"),
      new ElementAttribute("Attribute 2", "String")
    ]

    Array.from({ length: 250 }).forEach((_, i) => {
      const element = new HierarchyElement(`Element ${i}`, ElementType.Numeric);
      elements.push(element)
      const edge = new Edge(topElement.name, element.name, 1)
      edges.push(edge)
    });

    const hierarchy = new Hierarchy(dimensionName, dimensionName, elements, edges, elementAttributes)
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
    expect(hier.elementAttributes.length).toEqual(2)

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
  
  it('should update a dimension', async () => {
    
    const dimToUpdate = prefix + 'update';
    
    // Create dimension with a single element to begin with    
    const topElement = new HierarchyElement('Top', ElementType.Consolidated)
    const hierarchy = new Hierarchy(dimToUpdate, dimToUpdate, [topElement]);
    const dimension = new Dimension(dimToUpdate, [hierarchy]);
    await global.tm1.dimensions.create(dimension);

    const createdDim = await global.tm1.dimensions.get(dimToUpdate);
    expect(createdDim).toBeInstanceOf(Dimension);
    expect(createdDim.name).toEqual(dimToUpdate);
    expect(createdDim.hierarchies[0].elements).toHaveLength(1);


    // Add elements, edges
    Array.from({ length: 100 }).forEach((_, i) => {
      createdDim.hierarchies[0].addElement(`Element ${i}`, "Numeric");
      createdDim.hierarchies[0].addEdge('Top', `Element ${i}`, 1);      
    });

    // Add attributes
    const elementAttributes: ElementAttribute[] = [
      new ElementAttribute('Attribute 1', "String"),
      new ElementAttribute('Attribute 2', "Numeric")
    ];

    createdDim.hierarchies[0].elementAttributes.push(...elementAttributes);

    await global.tm1.dimensions.hierarchies.update(createdDim.hierarchies[0]);

    const updatedDim = await global.tm1.dimensions.get(dimToUpdate);
    expect(updatedDim).toBeInstanceOf(Dimension);
    expect(updatedDim.hierarchies[0].elements).toHaveLength(101);
    expect(updatedDim.hierarchies[0].edges).toHaveLength(100);
    expect(updatedDim.hierarchies[0].elementAttributes).toHaveLength(2);
    
    await global.tm1.dimensions.delete(dimToUpdate);
    
  });

  it('should add a hierarchy', async () => {
    const dimension = await global.tm1.dimensions.get(dimensionName);
    const elements = [
      new HierarchyElement('e1', ElementType.Numeric),
      new HierarchyElement('e2', ElementType.String)
    ]
    
    const newHierarchyName = 'Some Hierarchy';
    const hierObj = new Hierarchy(newHierarchyName, dimensionName, elements);
    dimension.addHierarchy(hierObj);
    
    await global.tm1.dimensions.update(dimension);
    const updatedDim = await global.tm1.dimensions.get(dimensionName);
    expect(updatedDim).toBeInstanceOf(Dimension);
    expect(updatedDim.hierarchies).toHaveLength(3);

    const newHierarchy = updatedDim.hierarchies.find(hier => hier.name === newHierarchyName);
    expect(newHierarchy).not.toBeUndefined();
    expect(newHierarchy.elements).toHaveLength(2);


  });

  it('should remove a hierarchy', async () => {
    const dimension = await global.tm1.dimensions.get(dimensionName);
    dimension.deleteHierarchy(dimensionName);
    await global.tm1.dimensions.update(dimension);

    const updatedDim = await global.tm1.dimensions.get(dimensionName);
    expect(updatedDim).toBeInstanceOf(Dimension);
    const hierSought = updatedDim.hierarchies.find(hier => hier.name === dimensionName);
    expect(hierSought).toBeUndefined()

  });

  it('should not update the Leaves hierarchy', async () => {
    const dimension = await global.tm1.dimensions.get(dimensionName);

    const leavesHier = dimension.hierarchies.find(hier => caseAndSpaceInsensitiveEquals(hier.name, 'Leaves'));
    expect (leavesHier).not.toBeUndefined();

    const lastElementCount = leavesHier.elements.length;
    leavesHier.addElement('new', 'Numeric');
    
    await global.tm1.dimensions.update(dimension);

    const updatedDim = await global.tm1.dimensions.get(dimensionName);
    const updatedHier = updatedDim.hierarchies.find(hier => caseAndSpaceInsensitiveEquals(hier.name, 'Leaves'));
    expect(updatedHier.elements).toHaveLength(lastElementCount);
    
  })

})