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
    if (await global.tm1.processes.exists(prefix + 'new')) {
      await global.tm1.processes.delete(prefix + 'new');
    }
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

  it('Should fetch all processes', async () => {
    const processes = await global.tm1.processes.getAll();
    expect(processes[0]).toBeInstanceOf(Process);
  })
  
  it('Should fetch all process names', async () => {
    const processNames = await global.tm1.processes.getAllNames();
    expect(processNames.find(name => name === processName)).toBeTruthy();
  })

  it('Should create a process', async () => {
    const newProcessName = prefix + 'new';
    const parameters: ProcessParameter[] = [
      { Name: 'p1', Type: 'String' },
      { Name: 'p2', Type: 'Numeric', 'Prompt': 'First parameter', Value: 5 }
    ]
    const newProcess = new Process(newProcessName, true, { prolog: 'SecurityRefresh();', epilog: 'SaveDataAll();' }, { type: 'None' }, parameters);
    await global.tm1.processes.create(newProcess)
    const createdProcess = await global.tm1.processes.get(newProcessName);
    expect(createdProcess).toBeInstanceOf(Process);
    expect(createdProcess.name).toEqual(newProcessName);
    expect(createdProcess.hasSecurityAccess).toEqual(true);
    expect(createdProcess.dataSource.type).toEqual('None');
    expect(createdProcess.parameters).toHaveLength(2);
  })

  it('Should update an existing process', async () => {
    const process = await global.tm1.processes.get(processName);
    expect(process.name).toEqual(processName);
    expect(process.parameters).toHaveLength(0);
    expect(process.dataSource.type).toEqual('None');

    // process.dataSource.type = 'TM1CubeView';
    process.hasSecurityAccess = true;
    process.prologProcedure = 'ProcessBreak;';

    await global.tm1.processes.update(process);
    const updated = await global.tm1.processes.get(processName);

    // expect(updated.dataSource.type).toEqual('TM1CubeView');
    expect(updated.hasSecurityAccess).toEqual(true);
    expect(updated.prologProcedure).toContain('ProcessBreak;');

  })

  it.todo('Should delete a process')
  it.todo('Should execute an existing process')
  it.todo('Should execute an unbound process')
  it.todo('Should execute a process and return the result')
  it.todo('Should compile a process')
  it.todo('Should get content from a process error log file')


})