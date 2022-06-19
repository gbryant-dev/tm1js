import { Cube } from '../../src/models/Cube'
import { Dimension } from '../../src/models/dimension'
import { Hierarchy } from '../../src/models/hierarchy'
import { HierarchyElement, MDXView, NativeView, ViewAxisSelection, ViewAxisTitle } from '../../src/models'
import { Subset } from '../../src/models/subset'

describe('ViewService', () => {
  const prefix = 'TM1ts_test_view_'
  const cubeName = prefix + 'cube'
  const dimensionNames = [prefix + 'dimension1', prefix + 'dimension2', prefix + 'dimension3']
  const nativeViewName = prefix + 'native_view'
  const mdxViewName = prefix + 'mdx_view'
  const mdx = `
  SELECT {[${dimensionNames[0]}].[${dimensionNames[0]}].Members} * 
  {
      [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 10],
      [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 11],
      [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 12]
  
  } ON COLUMNS, 
  {[${dimensionNames[2]}].[${dimensionNames[2]}].Members} ON ROWS 
  FROM [${cubeName}]
`

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

    const titleSubset = new Subset('', dimensionNames[2], dimensionNames[2], ['Element 10', 'Element 12', 'Element 14'])
    const viewAxisTitle: ViewAxisTitle = new ViewAxisTitle(titleSubset, 'Element 10')

    const nativeView = new NativeView(nativeViewName, viewAxisColumns, null, [viewAxisTitle])
    await global.tm1.cubes.views.create(cubeName, nativeView)

    // Create mdx view
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

  it('Should fetch a native view', async () => {
    const view = await global.tm1.cubes.views.get(cubeName, nativeViewName) as NativeView

    expect(view).toBeInstanceOf(NativeView)
    expect(view.name).toEqual(nativeViewName)
    expect(view.columns.length).toEqual(2)
    expect(view.columns[0].subset.elements).toEqual(['Element 1', 'Element 3', 'Element 5'])
    expect(view.columns[1].subset.elements).toEqual(['Element 7', 'Element 9', 'Element 11'])
    expect(view.titles.length).toEqual(1)
    expect(view.titles[0].subset.elements).toEqual(['Element 10', 'Element 12', 'Element 14'])
    expect(view.titles[0].selected).toEqual('Element 10')
  })
  it('Should fetch a mdx view', async () => {
    const view = await global.tm1.cubes.views.get(cubeName, mdxViewName) as MDXView

    expect(view).toBeInstanceOf(MDXView)
    expect(view.name).toEqual(mdxViewName)
    expect(view.mdx).toEqual(mdx)
  })

  it('Should fetch all views for a cube', async () => {
    const views = await global.tm1.cubes.views.getAll(cubeName)
    expect(views.length).toEqual(2)
    const [nativeView, mdxView] = views
    expect(nativeView).toBeInstanceOf(NativeView)
    expect(mdxView).toBeInstanceOf(MDXView)
  })

  it('Should create and delete a view', async () => {
    // Create view
    const newViewName = prefix + 'new_mdx_view'

    const newMDX = `SELECT {
      ([${dimensionNames[0]}].[${dimensionNames[0]}].[Element 10], 
        [${dimensionNames[1]}].[${dimensionNames[1]}].[Element 15]) 
      } ON COLUMNS
      FROM [${cubeName}] 
      WHERE ([${dimensionNames[2]}].[${dimensionNames[2]}].[Element 20])
    `

    const newViewObj = new MDXView(newViewName, newMDX)
    await global.tm1.cubes.views.create(cubeName, newViewObj)

    const newViewExists = await global.tm1.cubes.views.exists(cubeName, newViewName)
    expect(newViewExists).toEqual(true)

    const newView = await global.tm1.cubes.views.get(cubeName, newViewName) as MDXView

    expect(newView).toBeInstanceOf(MDXView)
    expect(newView.name).toEqual(newViewName)
    expect(newView.mdx).toEqual(newMDX)

    // Delete view
    await global.tm1.cubes.views.delete(cubeName, newViewName)

    // Verify view has been deleted
    const exists = await global.tm1.cubes.views.exists(cubeName, newViewName)
    expect(exists).toEqual(false)
  })

  it('Should update a view', async () => {
    const viewToUpdate = await global.tm1.cubes.views.get(cubeName, nativeViewName) as NativeView

    // Move one column dimension to row
    const subset = viewToUpdate.columns[1].subset
    viewToUpdate.removeColumn(dimensionNames[1])
    viewToUpdate.addRow(subset)
    // Suppress columns
    viewToUpdate.suppressEmptyColumns = true

    await global.tm1.cubes.views.update(cubeName, viewToUpdate)

    const updatedView = await global.tm1.cubes.views.get(cubeName, nativeViewName) as NativeView
    expect(updatedView.columns.length).toEqual(1)
    expect(updatedView.rows.length).toEqual(1)
    expect(updatedView.rows[0].subset).toEqual(subset)
    expect(updatedView.suppressEmptyColumns).toEqual(true)
  })
})
