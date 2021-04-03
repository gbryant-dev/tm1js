
function MinimalVersion(version: number) {
  return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      console.log(this.http.version, version < Number(this.http.version.slice(0, 4)));
      if (version <= Number(this.http.version.slice(0, 4))) {
        const result = original.apply(this, args);
        return result;
      } else {
        throw new Error(`Function ${String(key)} requires TM1 server version >= ${version}`);
      }
    }

    return descriptor;
  }
}

export { MinimalVersion }