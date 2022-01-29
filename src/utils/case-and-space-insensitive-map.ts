interface CaseAndSpaceInsensitiveMap<T, U> extends Map<T, U> {}
class CaseAndSpaceInsensitiveMap<T, U> {
  constructor (entries?: Array<[T, U]> | Iterable<[T, U]>) {
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

  forEach (callbackfn: (value: U, key: T, map: CaseAndSpaceInsensitiveMap<T, U>) => void, thisArg?: any): void {
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

export default CaseAndSpaceInsensitiveMap
