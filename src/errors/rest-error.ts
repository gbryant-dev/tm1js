

class RestError extends Error {
  
  constructor(statusCode: number, data: any, headers: { [key: string]: string }) {
    super(`Request failed with status: ${statusCode}. Response: ${JSON.stringify(data)}. Headers: ${JSON.stringify(headers)}`)
  }
  
}

export { RestError }