
class Session {
  static fromJson () {
    return new Session()
  }

  get body () {
    return this.constructBody()
  }

  constructBody () {
    const body = {}

    return body
  }
}

export { Session }
