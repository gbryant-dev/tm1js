import { Chore, ChoreTask } from '../models/chore'
import RestService from './rest-service'
import { fixedEncodeURIComponent } from '../utils/helpers'

/**
 * A service to handle chore operations in TM1
 */
class ChoreService {
  private http: RestService
  constructor (http: RestService) {
    this.http = http
  }

  /**
   * Fetch a single chore along with their processes from TM1
   *
   * @param {string} choreName The name of the chore
   * @returns An instance of the `Chore` model
   */

  async get (choreName: string): Promise<Chore> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')?$expand=Tasks($expand=Process($select=Name,Parameters))`
    const response = await this.http.GET(url)
    return Chore.fromJson(response)
  }

  /**
   * Fetch all chores along with their processes from TM1
   *
   * @returns An array of the `Chore` model
   */

  async getAll (): Promise<Chore[]> {
    const url = '/api/v1/Chores?$expand=Tasks($expand=Process($select=Name,Parameters))'
    const response = await this.http.GET(url)
    return response['value'].map((chore: any) => Chore.fromJson(chore))
  }

  /**
   * Fetch the names of all chores in TM1
   *
   * @returns An array from chore names
   */

  async getAllNames (): Promise<string[]> {
    const url = '/api/v1/Chores?$select=Name'
    const response = await this.http.GET(url)
    return response['value'].map((c: any) => c['Name'])
  }

  /**
   * Create a chore in TM1
   *
   * @param {Chore} chore An instance of the `Chore` model
   * @returns
   */

  async create (chore: Chore): Promise<any> {
    const url = '/api/v1/Chores'
    return this.http.POST(url, chore.body)
  }

  /**
   * Update a chore in TM1
   *
   * @param {Chore} chore An instance of the `Chore` model
   */
  async update (chore: Chore): Promise<void> {
    // Disable chore if active before updates
    const reactivate = chore.active
    if (reactivate) {
      chore.active = false
      await this.deactivate(chore.name)
    }

    const url = `/api/v1/Chores('${fixedEncodeURIComponent(chore.name)}')`

    const choreWithoutTasks = Chore.fromJson({ ...chore.body, Tasks: [] })

    await this.http.PATCH(url, choreWithoutTasks.body)

    // Update tasks
    const { tasks: existingTasks } = await this.get(chore.name)

    for (const task of chore.tasks) {
      if (task.step >= existingTasks.length) {
        await this.addTask(chore.name, task)
      } else {
        // Check and Update task
        const existingTask = existingTasks[task.step]
        if (JSON.stringify(existingTask.body) !== JSON.stringify(task.body)) {
          await this.updateTask(chore.name, task)
        }
      }
    }

    // Delete tasks that have been removed
    const tasksToRemove = existingTasks.slice(chore.tasks.length).reverse()

    for (const task of tasksToRemove) {
      await this.deleteTask(chore.name, task.step)
    }

    // Reactivate chore if required
    if (reactivate) {
      await this.activate(chore.name)
    }
  }

  /**
   * Delete a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns
   */
  async delete (choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')`
    return this.http.DELETE(url)
  }

  /**
   * Add a task to a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @param {ChoreTask} task The new taks. An instance of the `ChoreTask` model
   * @returns
   */

  async addTask (choreName: string, task: ChoreTask) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')`
    const body = { Tasks: [task.body] }
    return this.http.PATCH(url, body)
  }

  /**
   * Delete a task from a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @param {number} step The step of the chore to delete
   * @returns
   */

  async deleteTask (choreName: string, step: number) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/Tasks('${step}')`
    return this.http.DELETE(url)
  }

  /**
   *
   * @param {string} choreName The name of the chore
   * @param {ChoreTask} task The task to update. An instance of the `ChoreTask` model
   * @returns
   */

  async updateTask (choreName: string, task: ChoreTask) {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/Tasks('${task.step}')`
    return this.http.PATCH(url, task.body)
  }

  /**
   * Execute a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns
   */

  async execute (choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Execute`
    return this.http.POST(url, null)
  }

  /**
   * Execute an unbound chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns
   */

  async executeChore (choreName: string): Promise<any> {
    const url = '/api/v1/ExecuteChore'
    const body = {
      'Chore@odata.bind': `Chores('${fixedEncodeURIComponent(choreName)}')`
    }
    return this.http.POST(url, body)
  }

  /**
   * Activate a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns
   */

  async activate (choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Activate`
    return this.http.POST(url, null)
  }

  /**
   * Deactivate a chore in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns
   */

  async deactivate (choreName: string): Promise<any> {
    const url = `/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')/tm1.Deactivate`
    return await this.http.POST(url, null)
  }

  /**
   * Check if a chore exists in TM1
   *
   * @param {string} choreName The name of the chore
   * @returns {boolean} If the chore exists
   */

  async exists (choreName: string): Promise<boolean> {
    try {
      await this.http.GET(`/api/v1/Chores('${fixedEncodeURIComponent(choreName)}')?$select=Name`)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }
}

export default ChoreService
