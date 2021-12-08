import { HierarchyElement, NativeView } from "../../src/models";
import Cube from "../../src/models/Cube";
import Dimension from "../../src/models/dimension";
import Hierarchy from "../../src/models/hierarchy";
import Subset from "../../src/models/subset";


describe('CellService', () => {

  const prefix = 'TM1ts_test_cell_';
  const cubeName = prefix + 'cube';
  const nativeViewName = prefix + 'native_view';
  const dimNamePrefix = prefix + 'dim';
  const dimNames = Array.from({ length: 3 }).map((_, i) => `${dimNamePrefix}${i}`)

  const setupDimension = (dimName: string, elementCount: number) => {
    const elements = Array.from({ length: elementCount }).map((_, i) => {
      return new HierarchyElement(`Element ${i + 1}`, 'Numeric');
    })
    const hierarchy = new Hierarchy(dimName, dimName, elements);
    const dimension = new Dimension(dimName, [hierarchy]);

    return dimension;
  }

  const setup = async () => {

    // Create 3 dimensions with elements

    const dimensions = dimNames.map(dimName => {
      const dimension = setupDimension(dimName, 5);
      return dimension
    });

    if (await global.tm1.cubes.exists(cubeName)) {
      await global.tm1.cubes.delete(cubeName)
    }

    for (const d of dimensions) {
      if (await global.tm1.dimensions.exists(d.name)) {
        await global.tm1.dimensions.delete(d.name)
      }
      await global.tm1.dimensions.create(d);
    }

    // Create cube
    const cube = new Cube(cubeName, dimNames);
    await global.tm1.cubes.create(cube)

    // Create view
    const nativeView = new NativeView(nativeViewName)


    const columnSubset = new Subset('', dimNames[0])
    columnSubset.expression = `{[${dimNames[0]}].Members}`;
    nativeView.addColumn(columnSubset)

    const rowSubset1 = new Subset('', dimNames[1])
    rowSubset1.expression = `{[${dimNames[1]}].Members}`;
    nativeView.addRow(rowSubset1)

    const rowSubset2 = new Subset('', dimNames[2])
    rowSubset2.expression = `{[${dimNames[2]}].Members}`;
    nativeView.addRow(rowSubset2)


    if (await global.tm1.views.exists(cubeName, nativeViewName)) {
      await global.tm1.views.delete(cubeName, nativeViewName)  
    }

    await global.tm1.views.create(cubeName, nativeView)


  }
  const cleanUp = async () => {
    // Delete view
    if (await global.tm1.views.exists(cubeName, nativeViewName)) {
      await global.tm1.views.delete(cubeName, nativeViewName);
    }

    // Delete cube
    if (await global.tm1.cubes.exists(cubeName)) {
      await global.tm1.cubes.delete(cubeName);
    }

    // Delete dimensions
    for (const dimName of dimNames) {
      if (await global.tm1.dimensions.exists(dimName)) {
        await global.tm1.dimensions.delete(dimName);
      }
    }
  }

  beforeAll(async () => {
    await setup();
  })

  afterAll(async () => {
    await cleanUp();
  })


  it('Should execute a view and return a cellset', async () => {

    // Execute view 
    const cellset = await global.tm1.cells.executeView(cubeName, nativeViewName);

    // Verify components of returned Cellset
    const { ID, Cells, Axes } = cellset as any
    expect(ID).toBeTruthy()

    // 3 dimensions, 5 elements in each, no suppression so 5**3
    expect(Cells.length).toEqual(5**3)
    expect(Axes.length).toEqual(2)

    const [columns, rows] = Axes

    expect(columns.Hierarchies.length).toEqual(1)
    expect(rows.Hierarchies.length).toEqual(2)

    const [columnHier] = columns.Hierarchies
    const [rowHier1, rowHier2] = rows.Hierarchies

    // Verify hierarchies on axes
    expect(columnHier.Name).toEqual(dimNames[0])
    expect(rowHier1.Name).toEqual(dimNames[1])
    expect(rowHier2.Name).toEqual(dimNames[2])

  })

  it('Should execute MDX and return a cellset', async () => {

    const mdx = `
      SELECT
        { [${dimNames[0]}].[${dimNames[0]}].Members } ON COLUMNS,
        { [${dimNames[1]}].[${dimNames[1]}].Members } * 
        { [${dimNames[2]}].[${dimNames[2]}].Members }
      ON ROWS
      FROM [${cubeName}]
    `;

    const cellset = await global.tm1.cells.executeMDX(mdx);
    
    const { ID, Cells, Axes } = cellset as any
    expect(ID).toBeTruthy()

    // 3 dimensions, 5 elements in each, no suppression so 5**3
    expect(Cells.length).toEqual(5**3)
    expect(Axes.length).toEqual(2)

    const [columns, rows] = Axes

    expect(columns.Hierarchies.length).toEqual(1)
    expect(rows.Hierarchies.length).toEqual(2)

    const [columnHier] = columns.Hierarchies
    const [rowHier1, rowHier2] = rows.Hierarchies

    // Verify hierarchies on axes
    expect(columnHier.Name).toEqual(dimNames[0])
    expect(rowHier1.Name).toEqual(dimNames[1])
    expect(rowHier2.Name).toEqual(dimNames[2])

  })

  it('Should update the value for a single cell through a cube', async () => {
    const mdx = `
    SELECT
      { [${dimNames[0]}].[${dimNames[0]}].[Element 1] } * 
      { [${dimNames[1]}].[${dimNames[1]}].[Element 1] }
      ON COLUMNS,
      { [${dimNames[2]}].[${dimNames[2]}].[Element 1] }
    ON ROWS
    FROM [${cubeName}]
  `;

    const result1 = await global.tm1.cells.executeMDX(mdx) as any
    const currentValue = result1.Cells[0].Value
    expect(currentValue).toEqual(null)

    const elements = ['Element 1', 'Element 3', 'Element 4']

    await global.tm1.cells.writeValue(100, cubeName, elements);
    
    const result2 = await global.tm1.cells.executeMDX(mdx) as any
    const newValue1 = result2.Cells[0].Value
    expect(newValue1).toEqual(100)

    await global.tm1.cells.writeValue(200, cubeName, elements, dimNames)

    const result3 = await global.tm1.cells.executeMDX(mdx) as any
    const newValue2 = result3.Cells[0].Value
    expect(newValue2).toEqual(200)
    
  })

  it('Should update the values for multiple cells through a cube', async () => {

    // Create map for holding coords and values to update
    const cellsetMap = new Map()

    cellsetMap.set(['Element 1', 'Element 1', 'Element 1'], 100)
    cellsetMap.set(['Element 1', 'Element 2', 'Element 1'], 300)
    cellsetMap.set(['Element 1', 'Element 2', 'Element 2'], 800)
    
    // Write values 
    await global.tm1.cells.writeValues(cubeName, cellsetMap)

    // Verify that the values have been updated correctly
    const mdx = `
      SELECT {
        ([${dimNames[0]}].[${dimNames[0]}].[Element 1], [${dimNames[1]}].[${dimNames[1]}].[Element 1], [${dimNames[2]}].[${dimNames[2]}].[Element 1]), 
        ([${dimNames[0]}].[${dimNames[0]}].[Element 1], [${dimNames[1]}].[${dimNames[1]}].[Element 2], [${dimNames[2]}].[${dimNames[2]}].[Element 1]), 
        ([${dimNames[0]}].[${dimNames[0]}].[Element 1], [${dimNames[1]}].[${dimNames[1]}].[Element 2], [${dimNames[2]}].[${dimNames[2]}].[Element 2]) 
      } 
      ON COLUMNS
      FROM [${cubeName}]
    `;

    const { Cells } = await global.tm1.cells.executeMDX(mdx) as any

    const values = Cells.map(cell => cell.Value)
    
    expect(Cells.length).toEqual(3)
    expect(values).toEqual([100, 300, 800])
    
  });

  it('Should get a single value from a cube', async () => {
    const elements = dimNames.map(dimName => 'Element 1');

    const { Cells: [cell] } = await global.tm1.cells.getValue(cubeName, elements) as any
    
    expect(cell.Value).toEqual(100)

  })

  it('Should write values through a cellset', async () => {

    // Create a cellset to write to
    const mdx = `
      SELECT {[${dimNames[0]}].[${dimNames[0]}].[Element 1]} ON COLUMNS,
      {
        [${dimNames[1]}].[${dimNames[1]}].[Element 1],
        [${dimNames[1]}].[${dimNames[1]}].[Element 3],
        [${dimNames[1]}].[${dimNames[1]}].[Element 5]
      } ON ROWS
      FROM [${cubeName}]
      WHERE ([${dimNames[2]}].[${dimNames[2]}].[Element 1])
    `;

    // Update cellset
    const values = [100, 300, 800];
    await global.tm1.cells.writeValuesThroughCellset(mdx, values)

    // Verify updates
    const { Cells } = await global.tm1.cells.executeMDX(mdx) as any;
    const cellValues = Cells.map(cell => cell.Value);
    expect(cellValues).toEqual(values)
    
  })

})