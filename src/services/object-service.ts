import { RestService } from './rest-service'

abstract class ObjectSevice {
  protected http: RestService

  constructor (http: RestService) {
    this.http = http
  }

  protected async exists (url: string): Promise<boolean> {
    try {
      await this.http.GET(url)
      return true
    } catch (e) {
      if (e.status === 404) {
        return false
      }
      throw e
    }
  }
}

export default ObjectSevice
