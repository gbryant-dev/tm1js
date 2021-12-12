

class RestError extends Error {
  public status: number;
  public reason: any;
  public headers: { [key: string]: string };

  constructor(status: number, reason: any, headers: { [key: string]: string }) {
    super(`Request failed with status: ${status}. Response: ${JSON.stringify(reason)}. Headers: ${JSON.stringify(headers)}`);
    this.status = status;
    this.reason = reason;
    this.headers = headers;
  }
  
}

export { RestError }