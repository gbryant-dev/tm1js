import Cube from '../../src/models/Cube';
import Dimension from "../../src/models/dimension";
import Hierarchy from "../../src/models/hierarchy";
import { HierarchyElement, MDXView, NativeView, ViewAxisSelection, ViewAxisTitle } from "../../src/models";
import Subset from "../../src/models/subset";

describe('ViewService', () => {

  const prefix = 'TM1ts_test_view_'
  const cubeName = prefix + 'cube'
  const dimensionNames = [prefix + 'dimension1', prefix + 'dimension2', prefix + 'dimension3']
  const nativeViewName = prefix + 'native_view'
  const mdxViewName = prefix + 'mdx_view'


  const setupDimension = (dimName: string) => {
    const elements = Array.from({ length: 100 }).map((_, i) => new HierarchyElement(`Element ${i}`, 'Numeric'))
    const hierarchy = new Hierarchy(dimName, dimName, elements)
    const dimension = new Dimension(dimName, [hierarchy])
    return dimension
  }

  const setup = async () => {

    // Create dimensions
    for (const dimName of dimensionNames) {
      const dimension = setupDimension(dimName)
      await global.tm1.dimensions.create(dimension)
    }

    // Create cube 
    const cube = new Cube(cubeName, dimensionNames)
    await global.tm1.cubes.create(cube)

    // Create native view

    const columnSubset1 = new Subset('', dimensionNames[0], dimensionNames[0], ['Element 1', 'Element 3', 'Element 5'])
    const columnSubset2 = new Subset('', dimensionNames[1], dimensionNames[1], ['Element 7', 'Element 9', 'Element 11'])

    const viewAxisColumns: ViewAxisSelection[] = [new ViewAxisSelection(columnSubset1), new ViewAxisSelection(columnSubset2)]

    const titleSubset = new Subset('', dimensionNames[2], dimensionNames[2], ['Element 9', 'Element 13', 'Element 15'])
    const selectedElement = new HierarchyElement('Element 20', 'Numeric')
    const viewAxisTitle: ViewAxisTitle = new ViewAxisTitle(titleSubset, selectedElement)

    const nativeView = new NativeView(nativeViewName, viewAxisColumns, null, [viewAxisTitle])

    await global.tm1.cubes.views.create(cubeName, nativeView)

    // Create mdx view

    const mdx = `
            SELECT {[${dimensionNames[0]}].[${dimensionNames[0]}].Members} * 
            {
                [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 10],
                [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 11],
                [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 12]
            
            } ON COLUMNS, 
            {[${dimensionNames[2]}].[${dimensionNames[2]}].Members} ON ROWS 
            FROM [${cubeName}]
        `;

    const mdxView = new MDXView(mdxViewName, mdx)

    await global.tm1.cubes.views.create(cubeName, mdxView)


  }
  const cleanup = async () => {

    // Delete views
    const viewNames = [nativeViewName, mdxViewName]

    for (const viewName of viewNames) {
      if (await global.tm1.cubes.views.exists(cubeName, viewName)) {
        await global.tm1.cubes.views.delete(cubeName, viewName)
      }
    }
    // Delete cube
    if (await global.tm1.cubes.exists(cubeName)) {
      await global.tm1.cubes.delete(cubeName)
    }

    // Delete dimensions
    for (const dimensionName of dimensionNames) {
      if (await global.tm1.dimensions.exists(dimensionName)) {
        await global.tm1.dimensions.delete(dimensionName)
      }
    }
  }

  beforeAll(async () => await setup())
  afterAll(async () => await cleanup())


  it.todo('Should fetch a native view')
  it.todo('Should fetch a mdx view')
  it.todo('Should fetch all views for a cube')
  it.todo('Should create and delete a view')
  it.todo('Should update a view')
})