import Test from "./test.js";

export default class PowerTest extends Test{

    constructor(data)
    {
        super(data)
        if(data)
            this.testData.combat = data.combat
    }

    _computeResult()
    {
        let result = super._computeResult()
        if (this.item.type == "spell")
        {
            result.overcast = this.power.overcast;
            result.duration = this.power.duration;
            result.resist = this.power.test;
            let complexity = result.total - this.testData.dn.complexity + 1 // complexity of spelltest is 1 + successes Core p.266 
            if(result.resist !== null && complexity > 0) {
                result.resist = result.resist.replace(/:s/ig, ":" + complexity);
            }
        }
        return result
    }

    get power() {
        return this.item
    }

    get spellFailed()
    {
        return !this.result.success
    }
}