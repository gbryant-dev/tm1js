class CaseAndSpaceInsensitiveMap<T, U> extends Map<T, U> {
  set(key: T, value: U): this {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return super.set(key, value)
  }

  get(key: T): U | undefined {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }
    return super.get(key)
  }

  has(key: T): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase().replace(/\s/g, '') as any as T
    }

    return super.has(key)
  }
  
}

export default CaseAndSpaceInsensitiveMap;