import Chore, { ChoreExecutionMode, ChoreFrequency, ChoreStartTime, ChoreTask } from "../../src/models/chore";
import Process from "../../src/models/process";


describe('ChoreService', () => {

  const prefix = 'TM1ts_test_';
  const choreName = prefix + 'chore';

  const setup = async () => {
    const startTime = new Date()
    const chore = new Chore(
      choreName,
      ChoreStartTime.fromDate(startTime),
      false,
      true,
      'SingleCommit',
      new ChoreFrequency(1, 2, 30, 15),
      [
        new ChoreTask(0, 'Test', [{ Name: 'pSleep', Value: 0 }])
      ]
    )

    await global.tm1.chores.create(chore);
  }

  const cleanup = async () => {
    if (await global.tm1.chores.exists(choreName)) {
      await global.tm1.chores.delete(choreName)
    }
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single chore', async () => {
    const chore = await global.tm1.chores.get(choreName);

    expect(chore).toBeInstanceOf(Chore);
    expect(chore.name).toEqual(choreName);
    expect(chore.startTime).toBeInstanceOf(ChoreStartTime);
    expect(chore.dstSensitive).toEqual(false);
    expect(chore.active).toEqual(true);
    expect(chore.executionMode).toEqual(ChoreExecutionMode.SingleCommit);
    expect(chore.frequency).toBeInstanceOf(ChoreFrequency);
    expect(chore.tasks).toHaveLength(1);
  })

  it('Should fetch all chores', async () => {
    const chores = await global.tm1.chores.getAll();
    expect(chores.length).toBeGreaterThanOrEqual(1);
    expect(chores[0]).toBeInstanceOf(Chore);
    expect(chores.find(chore => chore.name === choreName)).not.toBeUndefined();
  })

  it('Should fetch all chore names', async () => {
    const choreNames = await global.tm1.chores.getAllNames();
    expect(choreNames.length).toBeGreaterThanOrEqual(1);
    expect(choreNames.find(name => name === choreName)).not.toBeUndefined();
  })

  it('Should create and delete a chore', async () => {
    const newChoreName = prefix + 'chore_new';

    // Create a couple of processes to use in the Chore
    const processNames = [prefix + 'chore_process_1', prefix + 'chore_process_2'];
    for (const processName of processNames) {
      const processObj = new Process(processName);
      await global.tm1.processes.create(processObj);
    }

    // Create tasks and Chore
    const tasks: ChoreTask[] = [
      new ChoreTask(0, processNames[0]),
      new ChoreTask(1, processNames[1])
    ]
    const newChoreObj = new Chore(newChoreName, ChoreStartTime.fromDate(new Date()), false, false, 'MultipleCommit', new ChoreFrequency(1), tasks);
    await global.tm1.chores.create(newChoreObj);
    const newChore = await global.tm1.chores.get(newChoreName);
    console.log(newChore);

    expect(newChore.name).toEqual(newChoreName);
    expect(newChore.active).toEqual(false);
    expect(newChore.executionMode).toEqual(ChoreExecutionMode.MultipleCommit);
    expect(newChore.frequency.toFrequencyString()).toEqual('P01DT00H00M00S');
    expect(newChore.tasks).toHaveLength(2);

    // Delete chore
    await global.tm1.chores.delete(newChoreName);

    // Delete processes
    for (const processName of processNames) {
      await global.tm1.processes.delete(processName)
    }

    // Verify chore has been deleted
    const choreExists = await global.tm1.chores.exists(newChoreName);
    expect(choreExists).toEqual(false);

  })

  it.todo('Should update a chore')
  it.todo('Should delete a chore')
  it.todo('Should execute a chore')


})