/* eslint-disable @typescript-eslint/no-empty-interface */
interface CaseAndSpaceInsensitiveMap<T, U> extends Map<T, U> {}
// eslint-disable-next-line no-redeclare
class CaseAndSpaceInsensitiveMap<T, U> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor (entries?: Array<[T, U]> | Iterable<[T, U]>) {
    // eslint-disable-next-line prefer-rest-params
    return Reflect.construct(Map, arguments, CaseAndSpaceInsensitiveMap)
  }

  set (key: T, value: U): this {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Map.prototype.set.call(this, key, value) as this
  }

  get (key: T): U | undefined {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Map.prototype.get.call(this, key) as U
  }

  has (key: T): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Map.prototype.has.call(this, key) as boolean
  }

  delete (key: T): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Map.prototype.delete.call(this, key) as boolean
  }

  forEach (callbackfn: (value: U, key: T, map: CaseAndSpaceInsensitiveMap<T, U>) => void): void {
    return Map.prototype.forEach.call(this, callbackfn)
  }

  entries (): IterableIterator<[T, U]> {
    return Map.prototype.entries.call(this)
  }

  keys (): IterableIterator<T> {
    return Map.prototype.keys.call(this)
  }

  values () {
    return Map.prototype.values.call(this)
  }
}

export { CaseAndSpaceInsensitiveMap }
