import { ProcessResponse } from './process'

class Chore {
  public name: string
  public startTime: ChoreStartTime
  public dstSensitive: boolean
  public active: boolean
  public _executionMode: ChoreExecuteModeString
  public frequency: ChoreFrequency
  public tasks: ChoreTask[] = []

  constructor(
    name: string,
    startTime: ChoreStartTime,
    dstSensitive: boolean,
    active: boolean,
    executionMode: ChoreExecuteModeString,
    frequency: ChoreFrequency,
    tasks?: ChoreTask[]
  ) {
    this.name = name
    this.startTime = startTime
    this.dstSensitive = dstSensitive
    this.active = active
    this._executionMode = executionMode
    this.frequency = frequency
    this.tasks = tasks || []
  }

  get executionMode() {
    return ChoreExecutionMode[this._executionMode.toString()]
  }

  set executionMode(value: ChoreExecuteModeString) {
    this._executionMode = value
  }

  addTask(processName: string, parameters?: ChoreTaskParameter[]) {
    const task = new ChoreTask(this.tasks.length, processName, parameters)
    this.tasks.push(task)
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {
      Name: this.name,
      StartTime: this.startTime.toStartTimeString(),
      DSTSensitive: this.dstSensitive,
      Active: this.active,
      ExecutionMode: this.executionMode,
      Frequency: this.frequency.toFrequencyString(),
      Tasks: []
    }

    // *TODO*
    for (const task of this.tasks) {
      body.Tasks.push(task.body)
    }

    return body
  }

  static fromJson(data: ChoreResponse) {
    return new Chore(
      data.Name,
      ChoreStartTime.fromString(data.StartTime),
      data.DSTSensitive,
      data.Active,
      data.ExecutionMode,
      ChoreFrequency.fromString(data.Frequency),
      data.Tasks.map((task) => ChoreTask.fromJson(task))
    )
  }
}

// TODO: verify in API
interface ChoreResponse {
  Name: string
  StartTime: string
  DSTSensitive: boolean
  Active: boolean
  ExecutionMode: ChoreExecuteModeString
  Frequency: string
  Tasks: ChoreTaskResponse[]
}

interface ChoresResponse {
  value: ChoreResponse[]
}

class ChoreTask {
  public step: number
  public processName?: string
  public parameters: ChoreTaskParameter[]

  constructor(
    step: number,
    processName?: string,
    parameters?: ChoreTaskParameter[]
  ) {
    this.step = step
    this.processName = processName
    this.parameters = parameters || []
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {
      // Step: this.step,
      'Process@odata.bind': `Processes('${this.processName}')`,
      Parameters: this.parameters
    }

    return body
  }

  static fromJson(data: ChoreTaskResponse) {
    return new ChoreTask(data.Step, data.Process.Name, data.Parameters)
  }
}

interface ChoreTaskResponse {
  Step: number
  Process: ProcessResponse
  Parameters: ChoreTaskParameter[]
}

class ChoreStartTime {
  private _datetime: Date

  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number
  ) {
    this._datetime = new Date(year, month, day, hour, minute, second)
  }

  get datetime() {
    return this._datetime
  }

  toStartTimeString() {
    return this._datetime.toISOString()
  }

  static fromDate(date: Date) {
    return new ChoreStartTime(
      date.getFullYear(),
      date.getMonth(),
      date.getDay(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  }

  static fromString(startTime: string) {
    const datetime = new Date(startTime)

    return new ChoreStartTime(
      datetime.getFullYear(),
      datetime.getMonth(),
      datetime.getDay(),
      datetime.getHours(),
      datetime.getMinutes(),
      datetime.getSeconds()
    )
  }
}

class ChoreFrequency {
  private _days: string
  private _hours: string
  private _minutes: string
  private _seconds: string

  constructor(
    days: string | number = 0,
    hours: string | number = 0,
    minutes: string | number = 0,
    seconds: string | number = 0
  ) {
    this._days = days.toString().padStart(2, '0')
    this._hours = hours.toString().padStart(2, '0')
    this._minutes = minutes.toString().padStart(2, '0')
    this._seconds = seconds.toString().padStart(2, '0')
  }

  get days() {
    return this._days
  }

  set days(value: string | number) {
    this._days = value.toString().padStart(2, '0')
  }

  get hours() {
    return this._hours
  }

  set hours(value: string | number) {
    this._hours = value.toString().padStart(2, '0')
  }

  get minutes() {
    return this._minutes
  }

  set minutes(value: string | number) {
    this._minutes = value.toString().padStart(2, '0')
  }

  get seconds() {
    return this._seconds
  }

  set seconds(value: string | number) {
    this._seconds = value.toString().padStart(2, '0')
  }

  toFrequencyString() {
    return `P${this._days}DT${this._hours}H${this._minutes}M${this._seconds}S`
  }

  static fromString(frequency: string): ChoreFrequency {
    const [days, hours, minutes, seconds] = frequency.match(/\d+/g)
    return new ChoreFrequency(days, hours, minutes, seconds)
  }
}

enum ChoreExecutionMode {
  SingleCommit = 0,
  MultipleCommit = 1
}

type ChoreExecuteModeString = keyof typeof ChoreExecutionMode

interface ChoreTaskParameter {
  Name: string
  Value?: string | number
}

export {
  Chore,
  ChoreTask,
  ChoreStartTime,
  ChoreFrequency,
  ChoreExecutionMode,
  ChoreExecuteModeString,
  ChoreResponse,
  ChoresResponse
}
