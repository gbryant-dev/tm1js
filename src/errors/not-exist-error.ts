class NotExistError extends Error {
  constructor (objectType: string, objectName: string) {
    super(`${objectType} '${objectName}' does not exist`)
  }
}

export { NotExistError }
