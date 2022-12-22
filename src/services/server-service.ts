import { Configuration, ServerSettings } from '../models'
import { RestService } from './rest-service'

/**
 * Service to handle interactions with the TM1 server itself
 */

class ServerService {
  private http: RestService
  constructor(http: RestService) {
    this.http = http
  }

  /**
   * Get the name of the TM1 server
   *
   * @returns {string}
   */
  async getServerName(): Promise<string> {
    const response = await this.http.GET(
      '/api/v1/Configuration/ServerName/$value',
      { responseType: 'text' }
    )
    return response.data
  }

  /**
   * Get the version of the TM1 server
   *
   * @returns {string}
   */
  async getServerVersion(): Promise<string> {
    const response = await this.http.GET(
      '/api/v1/Configuration/ProductVersion/$value',
      { responseType: 'text' }
    )

    return response.data
  }

  /**
   * Get the location of the Data directory for the TM1 server
   *
   * @returns {string}
   */
  async getDataDirectory(): Promise<string> {
    const response = await this.http.GET(
      '/api/v1/Configuration/DataBaseDirectory/$value',
      { responseType: 'text' }
    )
    return response.data
  }

  /**
   * Get the Admin Host for the TM1 server
   *
   * @returns {string}
   */
  async getAdminHost(): Promise<string> {
    const response = await this.http.GET(
      '/api/v1/Configuration/AdminHost/$value',
      {
        responseType: 'text'
      }
    )
    return response.data
  }

  /**
   * Get the configuration of the TM1 server
   *
   * @returns {Configuration}
   */

  async getConfiguration(): Promise<Configuration> {
    const response = await this.http.GET<Configuration>('/api/v1/Configuration')
    return response.data
  }

  /**
   * Get the *active* configuration of the TM1 server
   *
   * @returns {ServerSettings}
   */

  async getActiveConfiguration(): Promise<ServerSettings> {
    const response = await this.http.GET<ServerSettings>(
      '/api/v1/ActiveConfiguration'
    )
    return response.data
  }

  /**
   * Get the static configuration of the TM1 server
   *
   * @returns {ServerSettings}
   */

  async getStaticConfiguration(): Promise<ServerSettings> {
    const response = await this.http.GET<ServerSettings>(
      '/api/v1/StaticConfiguration'
    )
    return response.data
  }
}

export default ServerService
