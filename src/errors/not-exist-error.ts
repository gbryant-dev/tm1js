

class NotExistError extends Error {
  constructor(objectType: string, objectName: string) {
    super(`${objectType} '${objectName}' already exists`)
  }
}

export { NotExistError }