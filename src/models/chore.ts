import Process from "./process";

class Chore {

  public name: string;
  public startTime: Date;
  public DSTSensitive: boolean;
  public active: boolean;
  public executionMode: ChoreExecutionMode;
  public frequency: number;
  public tasks: ChoreTask[] = [];

  constructor(
    name: string,
    startTime: Date,
    DSTSensitive: boolean,
    active: boolean,
    executionMode: ChoreExecutionMode,
    frequency: number,
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

  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {}

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
  public process?: Process;

  constructor(step: number, process?: Process) {
    this.step = step;
    this.process = process;
  }


  get body() {
    return this.constructBody()
  }

  constructBody() {
    const body = {}

    return body
  }

  static fromJson(data: any) {
    return new ChoreTask(
      data.Step,
      Process.fromJson(data.Process)
    )
  }

}

enum ChoreExecutionMode {
  SingleCommit = 0,
  MultipleCommit = 1
}

export { Chore as default, ChoreTask, ChoreExecutionMode };