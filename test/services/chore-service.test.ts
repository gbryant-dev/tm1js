import { randomBytes } from 'crypto'
import {
  Chore,
  ChoreExecutionMode,
  ChoreFrequency,
  ChoreStartTime,
  ChoreTask
} from '../../src/models/chore'
import { Process } from '../../src/models/process'

describe('ChoreService', () => {
  const prefix = 'TM1ts_test_'
  const choreName = prefix + 'chore'
  const processName = prefix + 'chore_process'
  const allProcessNames: string[] = []

  const createInitialProcess = async () => {
    const process = new Process(processName)
    process.addParameter('pSleep', 0)

    await global.tm1.processes.create(process)
    allProcessNames.push(processName)
  }

  const createProcesses = async (count: number = 1) => {
    // const processNames = [prefix + 'chore_process_1', prefix + 'chore_process_2'];
    const processNames = Array.from({ length: count }).map(
      (_, i) => `${prefix}chore_process_${randomBytes(4).toString('hex')}`
    )
    for (const processName of processNames) {
      const processObj = new Process(processName)
      await global.tm1.processes.create(processObj)
    }
    allProcessNames.push(...processNames)
    return processNames
  }

  const setup = async () => {
    await createInitialProcess()

    const startTime = new Date()
    const chore = new Chore(
      choreName,
      ChoreStartTime.fromDate(startTime),
      false,
      true,
      'SingleCommit',
      new ChoreFrequency(1, 2, 30, 15),
      [new ChoreTask(0, processName, [{ Name: 'pSleep', Value: 3 }])]
    )

    await global.tm1.chores.create(chore)
  }

  const cleanup = async () => {
    if (await global.tm1.chores.exists(choreName)) {
      await global.tm1.chores.delete(choreName)
    }

    // Delete random processes
    for (const name of allProcessNames) {
      if (await global.tm1.processes.exists(name)) {
        await global.tm1.processes.delete(name)
      }
    }
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single chore', async () => {
    const chore = await global.tm1.chores.get(choreName)

    expect(chore).toBeInstanceOf(Chore)
    expect(chore.name).toEqual(choreName)
    expect(chore.startTime).toBeInstanceOf(ChoreStartTime)
    expect(chore.dstSensitive).toEqual(false)
    expect(chore.active).toEqual(true)
    expect(chore.executionMode).toEqual(ChoreExecutionMode.SingleCommit)
    expect(chore.frequency).toBeInstanceOf(ChoreFrequency)
    expect(chore.tasks).toHaveLength(1)
  })

  it('Should fetch all chores', async () => {
    const chores = await global.tm1.chores.getAll()
    expect(chores.length).toBeGreaterThanOrEqual(1)
    expect(chores[0]).toBeInstanceOf(Chore)
    expect(chores.find((chore) => chore.name === choreName)).not.toBeUndefined()
  })

  it('Should fetch all chore names', async () => {
    const choreNames = await global.tm1.chores.getAllNames()
    expect(choreNames.length).toBeGreaterThanOrEqual(1)
    expect(choreNames.find((name) => name === choreName)).not.toBeUndefined()
  })

  it('Should create and delete a chore', async () => {
    const newChoreName = prefix + 'chore_new'

    // Create a couple of processes to use in the Chore
    const processNames = await createProcesses(2)

    // Create tasks and Chore
    const tasks: ChoreTask[] = processNames.map(
      (name, i) => new ChoreTask(i, name)
    )

    const newChoreObj = new Chore(
      newChoreName,
      ChoreStartTime.fromDate(new Date()),
      false,
      false,
      'MultipleCommit',
      new ChoreFrequency(1),
      tasks
    )
    await global.tm1.chores.create(newChoreObj)
    const newChore = await global.tm1.chores.get(newChoreName)

    expect(newChore.name).toEqual(newChoreName)
    expect(newChore.active).toEqual(false)
    expect(newChore.executionMode).toEqual(ChoreExecutionMode.MultipleCommit)
    expect(newChore.frequency.toFrequencyString()).toEqual('P01DT00H00M00S')
    expect(newChore.tasks).toHaveLength(2)

    // Delete chore
    await global.tm1.chores.delete(newChoreName)

    // Delete processes
    for (const processName of processNames) {
      await global.tm1.processes.delete(processName)
    }

    // Verify chore has been deleted
    const choreExists = await global.tm1.chores.exists(newChoreName)
    expect(choreExists).toEqual(false)
  })

  it('Should update a chore', async () => {
    const chore = await global.tm1.chores.get(choreName)

    // Create process and add new task to Chore
    const [p1, p2, p3] = await createProcesses(3)
    chore.addTask(p1, [])
    await global.tm1.chores.update(chore)

    const updatedChore = await global.tm1.chores.get(choreName)
    const tasks = updatedChore.tasks
    expect(tasks.length).toEqual(chore.tasks.length)
    expect(tasks[tasks.length - 1].processName).toEqual(p1)

    updatedChore.tasks = []
    updatedChore.addTask(p2, [])
    updatedChore.addTask(p3, [])

    await global.tm1.chores.update(updatedChore)

    const updatedChore2 = await global.tm1.chores.get(choreName)
    const updatedChoreTasks = updatedChore2.tasks
    expect(updatedChoreTasks).toHaveLength(2)
    expect(updatedChoreTasks[0].processName).toEqual(p2)
    expect(updatedChoreTasks[1].processName).toEqual(p3)

    // Remove tasks and clean up
    updatedChore2.tasks = []
    await global.tm1.chores.update(updatedChore2)

    // Cleanup
    for (const processName of [p1, p2, p3]) {
      await global.tm1.processes.delete(processName)
    }
  })

  it('Should execute a chore', async () => {
    await expect(global.tm1.chores.executeChore(choreName)).resolves.toMatch('')
    await expect(global.tm1.chores.execute(choreName)).resolves.toMatch('')
  })
})
