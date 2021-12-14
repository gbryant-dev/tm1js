import { VersionError } from '../errors/version-error';

function MinimumVersion(version: number) {
  return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {

    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      if (version <= Number(this.http.version.slice(0, 4))) {
        const result = original.apply(this, args);
        return result;
      } else {
        throw new VersionError(key, version);
      }
    }

    return descriptor;
  }
}

function RemoveCellset() {
  return function(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {

    const original = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      try {
        const result = await original.apply(this, args);
        return result
      } finally {
        const [cellsetID, options] = args
        const shouldDelete = options?.deleteCellset ?? true
        if (shouldDelete) {
          try {   
            await this.deleteCellset(cellsetID)
          } catch (e) {
            if (e.status !== 404) {
              throw e
            }
          }
        }        
      }
    }
    return descriptor;
  }
}

export { MinimumVersion, RemoveCellset }