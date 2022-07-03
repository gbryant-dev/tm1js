// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CaseAndSpaceInsensitiveSet<T> extends Set<T> {}

// eslint-disable-next-line no-redeclare
class CaseAndSpaceInsensitiveSet<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor (values?: T[] | Iterable<T>) {
    // eslint-disable-next-line prefer-rest-params
    return Reflect.construct(Set, arguments, CaseAndSpaceInsensitiveSet)
  }

  add (value: T): this {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.add.call(this, value)
  }

  clear (): void {
    Set.prototype.clear.call(this)
  }

  delete (value: T): boolean {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.delete.call(this, value)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forEach (callbackfn: (value: T, value2: T, set: CaseAndSpaceInsensitiveSet<T>) => void, thisArg?: any): void {
    return Set.prototype.forEach.call(this, callbackfn)
  }

  has (value: T): boolean {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.has.call(this, value) as boolean
  }

  keys (): IterableIterator<T> {
    return Set.prototype.keys.call(this)
  }

  values (): IterableIterator<T> {
    return Set.prototype.values.call(this)
  }

  get size (): number {
    return Array.from(this.keys()).length
  }
}

export default CaseAndSpaceInsensitiveSet
