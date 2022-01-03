interface CaseAndSpaceInsensitiveSet<T> extends Set<T> {} 
class CaseAndSpaceInsensitiveSet<T> {

  constructor(values?: T[] | Iterable<T> ) {
    return Reflect.construct(Set, arguments, CaseAndSpaceInsensitiveSet)
  }
  
  add(value: T): this {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.add.call(this, value)
  }

  clear(): void {
    Set.prototype.clear.call(this)
  }

  delete(value: T): boolean {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.delete.call(this, value)
  }

  forEach(callbackfn: (value: T, value2: T, set: CaseAndSpaceInsensitiveSet<T>) => void, thisArg?: any): void {
    return Set.prototype.forEach.call(this, callbackfn)
  }

  has(value: T): boolean {
    if (typeof value === 'string') {
      value = value.toLowerCase().replace(/\s/g, '') as any as T
    }
    return Set.prototype.has.call(this, value) as boolean;

  }

}
