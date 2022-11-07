import { ProcessExecuteStatusCode } from '../../src/models'
import {
  Process,
  ProcessDataSource,
  ProcessParameter,
  ProcessProcedure
} from '../../src/models/process'

describe('ProcessService', () => {
  const prefix = 'TM1ts_test_'
  const processName = prefix + 'process'

  const setup = async () => {
    const parameters: ProcessParameter[] = []
    const dataSource: ProcessDataSource = {
      Type: 'None'
    }

    const process = new Process(processName)

    if (await global.tm1.processes.exists(processName)) {
      await global.tm1.processes.delete(processName)
    }

    await global.tm1.processes.create(process)
  }
  const cleanup = async () => {
    await global.tm1.processes.delete(processName)
  }

  beforeAll(async () => {
    await setup()
  })

  afterAll(async () => {
    await cleanup()
  })

  it('Should fetch a single process', async () => {
    const process = await global.tm1.processes.get(processName)
    expect(process).toBeInstanceOf(Process)
    expect(process.name).toEqual(processName)
  })

  it('Should fetch all processes', async () => {
    const processes = await global.tm1.processes.getAll()
    expect(processes[0]).toBeInstanceOf(Process)
  })

  it('Should fetch all process names', async () => {
    const processNames = await global.tm1.processes.getAllNames()
    expect(processNames.find((name) => name === processName)).toBeTruthy()
  })

  it('Should create a process and delete it', async () => {
    const newProcessName = prefix + 'new'
    const parameters: ProcessParameter[] = [
      { Name: 'p1', Type: 'String' },
      { Name: 'p2', Type: 'Numeric', Prompt: 'First parameter', Value: 5 }
    ]
    const newProcess = new Process(
      newProcessName,
      true,
      { prolog: 'SecurityRefresh();', epilog: 'SaveDataAll();' },
      { Type: 'None' },
      parameters
    )
    await global.tm1.processes.create(newProcess)
    const createdProcess = await global.tm1.processes.get(newProcessName)
    expect(createdProcess).toBeInstanceOf(Process)
    expect(createdProcess.name).toEqual(newProcessName)
    expect(createdProcess.hasSecurityAccess).toEqual(true)
    expect(createdProcess.dataSource.Type).toEqual('None')
    expect(createdProcess.parameters).toHaveLength(2)

    const processCount = await global.tm1.processes.getAllNames()
    const exists = await global.tm1.processes.exists(newProcessName)
    expect(exists).toBeTruthy()

    // Delete process
    await global.tm1.processes.delete(newProcessName)
    const stillExists = await global.tm1.processes.exists(newProcessName)
    expect(stillExists).toBeFalsy()
  })

  it('Should update a process', async () => {
    const process = await global.tm1.processes.get(processName)
    expect(process.name).toEqual(processName)
    expect(process.parameters).toHaveLength(0)
    expect(process.dataSource.Type).toEqual('None')

    process.hasSecurityAccess = true
    process.prologProcedure = 'ProcessBreak;'
    process.addParameter('p1', 5)

    await global.tm1.processes.update(process)
    const updated = await global.tm1.processes.get(processName)

    expect(updated.hasSecurityAccess).toEqual(true)
    expect(updated.prologProcedure).toContain('ProcessBreak;')
    expect(updated.parameters).toHaveLength(1)

    const [parameter] = updated.parameters
    expect(parameter.Name).toEqual('p1')
    expect(parameter.Type).toEqual('Numeric')
    expect(parameter.Value).toEqual(5)
  })

  it('Should execute an existing process', async () => {
    // Create process that can be executed
    const processToExecuteName = prefix + 'execute'
    const procedures: ProcessProcedure = { prolog: 'Sleep(200);' }
    const processObj = new Process(processToExecuteName, false, procedures)
    await global.tm1.processes.create(processObj)

    try {
      const executeResult = await global.tm1.processes.execute(
        processToExecuteName
      )
    } catch (e) {
      throw e
    } finally {
      await global.tm1.processes.delete(processToExecuteName)
    }
  })

  it('Should execute a process and return the result', async () => {
    const processName2 = prefix + 'execute_return'
    const processObj2 = new Process(processName2, false, {
      prolog: 'Sleep(200);'
    })
    await global.tm1.processes.create(processObj2)

    try {
      const res = await global.tm1.processes.executeWithReturn(processName2)
      expect(res.ProcessExecuteStatusCode).toEqual(
        ProcessExecuteStatusCode.CompletedSuccessfully
      )
    } catch (e) {
      console.log(e)
      throw e
    } finally {
      await global.tm1.processes.delete(processName2)
    }
  })

  it('Should execute TI code', async () => {
    const res = await global.tm1.processes.executeTICode('Sleep(200);')
    expect(res?.ProcessExecuteStatusCode).toEqual(
      ProcessExecuteStatusCode.CompletedSuccessfully
    )
  })

  it('Should execute an unbound process', async () => {
    const unboundProcessName = prefix + 'execute_unbound'
    const unboundProcessObj = new Process(unboundProcessName, true, {
      prolog: 'Sleep(pSleep);'
    })
    const parameters: ProcessParameter[] = [
      { Name: 'pSleep', Value: 500, Type: 'Numeric' }
    ]
    const res = await global.tm1.processes.executeProcessWithReturn(
      unboundProcessObj,
      parameters
    )
    expect(res.ProcessExecuteStatusCode).toEqual(
      ProcessExecuteStatusCode.CompletedSuccessfully
    )
  })

  it('Should compile an unbound process', async () => {
    const processName3 = prefix + 'compile'
    const processObj3 = new Process(processName3, true, {
      prolog: 'Sleep(200);'
    })
    const errors = await global.tm1.processes.compileProcess(processObj3)
    expect(errors).toHaveLength(0)

    processObj3.epilogProcedure += '\r\nError'
    const errors2 = await global.tm1.processes.compileProcess(processObj3)
    expect(errors2).toHaveLength(1)
  })

  it('Should compile a bound process', async () => {
    const processName4 = prefix + 'compile_bound'
    const processObj4 = new Process(processName4, true, {
      prolog: 'Sleep(200);'
    })
    await global.tm1.processes.create(processObj4)
    const errors = await global.tm1.processes.compile(processName4)
    expect(errors).toHaveLength(0)

    await global.tm1.processes.delete(processName4)
  })

  it('Should get content from a process error log file', async () => {
    const processName5 = prefix + 'execute_return'
    const processObj5 = new Process(processName5, false, {
      prolog: 'Sleep(200)'
    })
    await global.tm1.processes.create(processObj5)

    try {
      const res = await global.tm1.processes.executeWithReturn(processName5)
      const errors = await global.tm1.processes.getErrorLogFileContent(
        res.ErrorLogFile?.Filename ?? ''
      )
      expect(res.ProcessExecuteStatusCode).not.toEqual(
        ProcessExecuteStatusCode.CompletedSuccessfully
      )
      expect(errors).not.toBeUndefined()
    } catch (e) {
      console.log(e)
      throw e
    } finally {
      await global.tm1.processes.delete(processName5)
    }
  })
})
