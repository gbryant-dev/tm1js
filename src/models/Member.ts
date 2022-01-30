class Member {
  public name: string;
  public uniqueName: string;
  public type: string;
  public ordinal: number;
  public weight: number;
  public attributes: {[key: string]: string | number };
  public hierarchyName: string;
  public level: number;

  static fromJson () {
    return new Member()
  }

  get body () {
    return this.constructBody()
  }

  constructBody () {
    const body = {}

    return body
  }
}

export { Member }
