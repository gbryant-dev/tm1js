import CaseAndSpaceInsensitiveSet from "../../src/utils/case-and-space-insensitive-set"


describe('CaseAndSpaceInsensitiveSet', () => {

    it('Should initialise an empty set', () => {
        const set = new CaseAndSpaceInsensitiveSet<string>()
        expect(set).toBeDefined()
    })

    it('Should initialise a set with values', () => {
        const set = new CaseAndSpaceInsensitiveSet<string>(['value 1', 'value 2'])
        expect(set.size).toEqual(2)
        expect(set.has('value 1')).toBeTruthy()
        expect(set.has('value 2')).toBeTruthy()
        expect(set.has('value 3')).toBeFalsy()
    })

    it('Should add a value to the set', () => {
        const set = new CaseAndSpaceInsensitiveSet<string>()
        set.add('Value 1')
        expect(set.size).toEqual(1)
        expect(set.has('Value 1')).toBeTruthy()

        set.add('val    U e1')
        expect(set.size).toEqual(1)
        expect(set.has('V a l u E 1')).toBeTruthy()

        set.add('ValUE    2')
        expect(set.size).toEqual(2)
        expect(set.has('Value 2')).toBeTruthy()
    })

    it('Should delete an value from the set', () => {
        const set = new CaseAndSpaceInsensitiveSet<string>()
        set.add('Element 1')
        set.add('Element 2')
        expect(set.size).toEqual(2)

        set.delete('Element 1')
        expect(set.size).toEqual(1)

        set.delete('element2')
        expect(set.size).toEqual(0)
    })
    
    it('Should clear the set', () => {
        const set = new CaseAndSpaceInsensitiveSet<string>()
        set.add('Element 1')
        set.add('Element 2')
        expect(set.size).toEqual(2)

        set.clear()
        expect(set.size).toEqual(0)
    })

    it.todo('Should check if a value exists in the set')



})