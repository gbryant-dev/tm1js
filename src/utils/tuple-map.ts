import CaseAndSpaceInsensitiveMap from "./case-and-space-insensitive-map";

class TupleMap {

  private _map: CaseAndSpaceInsensitiveMap<string, string | number>;

  constructor() {
    this._map = new CaseAndSpaceInsensitiveMap();
  }

  get(key: [string, string]): string | number {
    return this._map.get(JSON.stringify(key));
  }

  set(key: [string, string], value: string | number): this {
    this._map.set(JSON.stringify(key), value);
    return this;
  }

  clear() {
    this._map.clear();
  }

  delete(key: [string, string]): boolean {
    return this._map.delete(JSON.stringify(key));
  }

  has(key: [string, string]): boolean {
    return this._map.has(JSON.stringify(key))
  }

  forEach(callback: (value: string | number, key: [string, string], map: Map<[string, string], string | number>) => void, thisArg?: any): void {
    this._map.forEach((value, key) => {
      callback.call(thisArg, value, JSON.parse(key), this);
    });
  }

  values() {
    return this._map.values()
  }

  size() {
    return this._map.size;
  }

}

export default TupleMap;