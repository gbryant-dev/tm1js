
class Server {
  public name: string;
  public productVersion: string;
  public portNumber: number;
  public clientMessagePortNumber: number;
  public httpPortNumber: number;
  public usingSSL: boolean;
  public securityPackageName: string;
  public servicePrincipalName: string;
  public integratedSecurityMode: string;
  public clientCAMURI: string;
  public clientPingCAMPassport: number;

  constructor (
    name: string,
    productVersion: string,
    portNumber: number,
    clientMessagePortNumber: number,
    httpPortNumber: number,
    usingSSL: boolean,
    securityPackageName: string,
    servicePrincipalName: string,
    integratedSecurityMode: string,
    clientCAMURI: string,
    clientPingCAMPassport: number
  ) {
    this.name = name
    this.productVersion = productVersion
    this.portNumber = portNumber
    this.clientMessagePortNumber = clientMessagePortNumber
    this.httpPortNumber = httpPortNumber
    this.usingSSL = usingSSL
    this.securityPackageName = securityPackageName
    this.servicePrincipalName = servicePrincipalName
    this.integratedSecurityMode = integratedSecurityMode
    this.clientCAMURI = clientCAMURI
    this.clientPingCAMPassport = clientPingCAMPassport
  }

  static fromJson (data: any) {
    return new Server(
      data.Name,
      data.ProductVersion,
      data.PortNumber,
      data.ClientMessagePortNumber,
      data.HTTPPortNumber,
      data.UsingSSL,
      data.SecurityPackageName,
      data.ServicePrincipalName,
      data.IntegratedSecurityMode,
      data.ClientCAMURI,
      data.ClientPingCAMPassport
    )
  }

  get body () {
    return this.constructBody()
  }

  constructBody () {
    const body = {}

    return body
  }
}

export { Server }
