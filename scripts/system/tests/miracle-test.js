import Test from "./test.js";

export default class MiracleTest extends Test{

    constructor(data)
    {
        super(data)
        if(data)
            this.testData.combat = data.combat
    }

    computeResult()
    {
        let result = super.computeResult()
        if (this.item.type == "miracle" && !this.item.test.opposed)
        {
            result.success = true;
            result.degree = 0
        }
        if (this.item.type == "spell")
        {
            result.overcast = this.power.overcast;
            result.duration = this.power.duration;
        }
        result.damage = this.computeDamage(result);
        return result
    }

    computeDamage(result) {
        let damage = {}
        if (this.item.type == "spell" && result.success)
        {
            let formula = this.item.damage;
            formula = formula.toLowerCase().replace("s", result.degree)
            damage.total = eval(formula)
        }
        return damage
    }

    _computeRoll()
    {
        if(this.item.type == "spell")
            return super._computeRoll();
        else if (this.item.type == "miracle" && !this.item.test.opposed)
        {
            return {
                triggers : 0,
                dice : [],
                focus : this.skill?.focus || 0
            }
        }
    }

    get power() {
        return this.item
    }

    

    get spellFailed()
    {
        return !this.result.success
    }
}