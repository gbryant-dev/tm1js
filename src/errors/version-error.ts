
class VersionError extends Error {
  
  constructor(funcName: string | symbol, version: number) {
    super(`Function ${String(funcName)} requires TM1 server version >= ${version}`);
  }
}

export { VersionError }