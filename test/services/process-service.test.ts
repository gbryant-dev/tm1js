import Process, { DataSourceType, ProcessDataSource, ProcessParameter } from "../../src/models/process";

describe('ProcessService', () => {

  const prefix = 'TM1ts_test_';
  const processName = prefix + 'process';

  const setup = async () => {
    const parameters: ProcessParameter[] = []
    const dataSource: ProcessDataSource = {
      type: 'None',
      
    }
    const process = new Process(processName);
    

    if (await global.tm1.processes.exists(processName)) {
      await global.tm1.processes.delete(processName)
    }

    await global.tm1.processes.create(process);
  }
  const cleanup = async () => {
    await global.tm1.processes.delete(processName);
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single process', async () => {
    const process = await global.tm1.processes.get(processName);
    expect(process).toBeInstanceOf(Process);
    expect(process.name).toEqual(processName);
  })


})