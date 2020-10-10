class TupleMap {
    
    private _map = new Map<string, string | number>();

    constructor() {
        this._map = new Map();
    }
    
    get (key: [string, string]): string | number {
        return this._map.get(JSON.stringify(key));
    }

    set (key: [string, string], value: string | number): this {
        this._map.set(JSON.stringify(key), value);
        return this;
    }

    clear() {
        this._map.clear();
    }

    delete(key: [string, string]): boolean {
        return this._map.delete(JSON.stringify(key));
    }

    has (key: [string, string]): boolean {
        return this._map.has(JSON.stringify(key))
    }

    forEach (callbackfn: (value: string | number, key: [string, string], map: Map<[string, string], string | number>) => void, thisArg?: any): void {
        this._map.forEach((value, key) => {
            callbackfn.call(thisArg, value, JSON.parse(key), this);
        });
    }

    // Must be a better way of doing this. Should try an iterator 
    values () {
        const entries = Array.from(this._map.entries());
        let step = 0;
        const iterable = {
            *[Symbol.iterator]() {
                
                while (step < entries.length) {
                    const [key, value] = entries[step];
                    yield { [key] : value}, 
                    step++
                }

                return;
            }
        }

        const result = Array.from(iterable);

        return result;
    }


    size() {
        return this._map.size;
    }

}

export default TupleMap;