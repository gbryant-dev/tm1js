import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import { CookieJar } from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Accept': 'application/json; odata.metadata=none, text/plain',
  'Tm1-SessionContext': 'TM1ts'
}


class RestService {

  public address: string;
  public port: number;
  public user: string;
  public password: string;
  public ssl: boolean;
  public namespace?: string;
  public impersonate?: string;
  private baseUrl: string;
  private http: AxiosInstance;
  private _version: string;

  constructor(
    address: string,
    port: number,
    user: string,
    password: string,
    ssl: boolean,
    namespace?: string,
    impersonate?: string

  ) {
    this.address = address;
    this.port = port;
    this.user = user;
    this.password = password;
    this.ssl = ssl;
    this.namespace = namespace;
    this.baseUrl = `http${ssl ? 's' : ''}://${address ? address : 'localhost'}:${port}`;
    this.http = axios.create({
      headers: HEADERS,
      withCredentials: true,
      httpsAgent: new Agent({ rejectUnauthorized: false })
    });

    axiosCookieJarSupport(this.http);
    this.http.defaults.jar = new CookieJar();
    this.http.defaults.baseURL = this.baseUrl;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.http.interceptors.request.use(
      config => {
        return config;
      }, err => err
    );

    this.http.interceptors.response.use(
      res => {
        // console.log(res.config.jar);
        return res.data
      }, (err: AxiosError) => {
        let error: any;
        if (err.response) {
          const { status, statusText, headers, data, request } = err.response;

          error = {
            status,
            statusText,
            headers,
            data: data.error || data
          }
        } else {
          error = { status: 500, statusText: 'Unknown Error', data: null, headers: {} }
        }

        return Promise.reject(error);
      }
    )
  }

  public async startSession(user: string, password: string, namespace: string, impersonate: string) {
    // Build auth header
    console.log('Starting session...');

    const url = '/api/v1/Configuration/ProductVersion/$value';

    try {
      let authHeader: string;

      if (this.namespace) {
        authHeader = 'CAMNamespace ' + Buffer.from(`${this.user}:${this.password}:${this.namespace}`).toString('base64');
      } else {
        authHeader = 'Basic ' + Buffer.from(`${this.user}:${this.password}`).toString('base64');
      }

      const additionalHeaders = {
        Authorization: authHeader
      }

      if (impersonate) {
        additionalHeaders['TM1-Impersonate'] = impersonate
      }

      const version = await this.GET(url, { headers: additionalHeaders, responseType: 'text' })
      this._version = version as unknown as string;

    } catch (error) {
      throw error;
    }

  }

  get version() {
    return this._version;
  }

  async GET(url: string, config: AxiosRequestConfig = {}) {
    return this.http.get(url, config);
  }

  async POST(url: string, data: any, config: AxiosRequestConfig = {}) {
    return this.http.post(url, JSON.stringify(data), config)
  }

  async PATCH(url: string, data: any, config: AxiosRequestConfig = {}) {
    return this.http.patch(url, JSON.stringify(data), config);
  }

  async DELETE(url: string, config: AxiosRequestConfig = {}) {
    return this.http.delete(url, config);
  }
}

export default RestService;