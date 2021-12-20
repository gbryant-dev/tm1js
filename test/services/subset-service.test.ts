

describe('SubsetService', () => {

    const prefix = 'TM1_test_'
    const subsetName = prefix + 'subset';
    const dimensionName = prefix + 'subset_dimension';
    const elementNames = Array.from({ length: 100 }).map((_, i) => `Element ${i}`);

    const setup = async () => {


    }
    const cleanUp = async () => {}

    beforeAll(async () => setup())
    afterAll(async () => cleanUp())

it.todo('Should fetch a single subset')
it.todo('Should fetch all subset names')
it.todo('Should create and delete a subset')
it.todo('Should update a subset')