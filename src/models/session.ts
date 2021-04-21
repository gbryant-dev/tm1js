

class Session { 


  constructor() {

  }


  static fromJson(data: any) {
    return new Session();
  }

  get body() {
    return this.constructBody();
  }

  constructBody() {
    const body = {};

    return body;
  }
}

export { Session }