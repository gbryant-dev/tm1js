
class Chore {

  public name: string;
  public startTime: Date; // *TODO* 
  public DSTSensitive: boolean;
  public active: boolean;
  public executionMode: ChoreExecutionMode | ChoreExecuteModeString;
  public frequency: string;
  public tasks: ChoreTask[] = [];

  constructor(
    name: string,
    startTime: Date,
    DSTSensitive: boolean,
    active: boolean,
    executionMode: ChoreExecutionMode | ChoreExecuteModeString,
    frequency: string,
    tasks: ChoreTask[]
  ) {
    this.name = name;
    this.startTime = startTime;
    this.DSTSensitive = DSTSensitive;
    this.active = active;
    this.executionMode = executionMode;
    this.frequency = frequency;
    this.tasks = tasks;
  }


  addTask(processName: string, parameters?: ChoreTaskParameter[]) {
    const task = new ChoreTask(this.tasks.length - 1, processName, parameters);
    this.tasks.push(task);
  }

  removeTask(step: number) {
    const taskIndex = this.tasks.findIndex(task => task.step === step);
    this.tasks.splice(taskIndex, 1);

    // Update steps based on index in array
    this.tasks.map((task: ChoreTask, index: number) => ({ ...task, step: index }));
  }

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {
      Name: this.name,
      StartTime: this.startTime.toISOString(),
      DSTSensitive: this.DSTSensitive,
      Active: this.active,
      ExecutionMode: this.executionMode,
      Frequency: this.frequency,
      Tasks: []
    }

    // *TODO*
    for (const task of this.tasks) {
      body.Tasks.push(task.body)
    }

    return body
  }

  static fromJson(data: any) {
    return new Chore(
      data.Name,
      data.StartTime,
      data.DSTSensitive,
      data.Active,
      data.ExecutionMode,
      data.Frequency,
      data.Tasks.map(task => ChoreTask.fromJson(task))
    );
  }

}

class ChoreTask {

  public step: number;
  public processName?: string;
  public parameters: ChoreTaskParameter[];

  constructor(step: number, processName?: string, parameters?: ChoreTaskParameter[]) {
    this.step = step;
    this.processName = processName;
    this.parameters = parameters;
  }


  get body() {
    return this.constructBody()
  }

  constructBody() {

    const body = {
      Step: this.step,
      'Process@odata.bind': `Processes('${this.processName}')`,
      Parameters: this.parameters
    }

    return body
  }

  static fromJson(data: any) {
    return new ChoreTask(
      data.Step,
      data.Process.Name,
      data.Parameters
    )
  }

}

enum ChoreExecutionMode {
  SingleCommit = 0,
  MultipleCommit = 1
}

type ChoreExecuteModeString = keyof typeof ChoreExecutionMode;

interface ChoreTaskParameter {
  Name: string;
  Value?: string | number;
}

export { Chore as default, ChoreTask, ChoreExecutionMode };