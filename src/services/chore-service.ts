import Chore, { ChoreFrequency, ChoreTask } from "../models/chore";
import RestService from "./rest-service";
import { fixedEncodeURIComponent } from "../utils/helpers";

class ChoreService {

  private http: RestService
  constructor(http: RestService) {
    this.http = http;
  }

  async get(choreName: string): Promise<Chore> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')?$expand=Tasks($expand=Process($select=Name,Parameters))`;
    const response = await this.http.GET(url);
    return Chore.fromJson(response);
  }

  async getAll(): Promise<Chore[]> {
    const url = '/api/v1/Chores?$expand=Tasks($expand=Process($select=Name,Parameters))';
    const response = await this.http.GET(url);
    return response['value'].map((chore: any) => Chore.fromJson(chore))
  }

  async getAllNames(): Promise<string[]> {
    const url = '/api/v1/Chores?$select=Name';
    const response = await this.http.GET(url);
    return response['value'].map((c: any) => c['Name']);
  }

  async create(chore: Chore): Promise<any> {
    const url = `/api/v1/Chores`;
    return this.http.POST(url, chore.body);
  }

  async update(chore: Chore): Promise<void> {

    // Disable chore if active before updates
    const reactivate = chore.active;
    if (reactivate) {
      chore.active = false;
      await this.deactivate(chore.name);
    }

    const url = `/api/v1/Chores('${fixedEncodeURIComponent(chore.name)}')`;

    const choreWithoutTasks = Chore.fromJson({ ...chore.body, Tasks: [] })

    await this.http.PATCH(url, choreWithoutTasks.body);

    // Update tasks
    const { tasks: existingTasks } = await this.get(chore.name);


    for (const task of chore.tasks) {

      if (task.step >= existingTasks.length) {
        await this.addTask(chore.name, task)
      } else {
        // Check and Update task
        const existingTask = existingTasks[task.step];
        if (JSON.stringify(existingTask.body) !== JSON.stringify(task.body)) {
          await this.updateTask(chore.name, task);
        }
      }
    }

    // Delete tasks that have been removed
    const tasksToRemove = existingTasks.slice(chore.tasks.length).reverse();

    for (const task of tasksToRemove) {
      await this.deleteTask(chore.name, task.step);
    }

    // Reactivate chore if required
    if (reactivate) {
      await this.activate(chore.name)
    }
  }

  async delete(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')`;
    return this.http.DELETE(url);
  }

  async addTask(choreName: string, task: ChoreTask) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')`;
    const body = { Tasks: [task.body] };
    return this.http.PATCH(url, body);
  }

  async deleteTask(choreName: string, step: number) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/Tasks('${step}')`;
    return this.http.DELETE(url);
  }

  async updateTask(choreName: string, task: ChoreTask) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/Tasks('${task.step}')`;
    return this.http.PATCH(url, task.body);
  }

  async execute(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Execute`;
    return this.http.POST(url, null);
  }

  async executeChore(choreName: string): Promise<any> {
    const url = `/api/v1/ExecuteChore`;
    const body = {
      'Chore@odata.bind': `Chores('${fixedEncodeURIComponent(choreName)}')`
    }
    return this.http.POST(url, body);
  }

  async activate(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Activate`;
    return this.http.POST(url, null);
  }

  async deactivate(choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Deactivate`;
    return await this.http.POST(url, null);
  }

  async exists(choreName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')?$select=Name`);
      return true;
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }

}

export default ChoreService;