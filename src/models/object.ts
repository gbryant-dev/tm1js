/* eslint-disable @typescript-eslint/no-empty-function */
abstract class ObjectModel {
  static fromJson () {}

  get body () {
    return this.constructBody()
  }

  abstract constructBody(): any
}

export default ObjectModel
