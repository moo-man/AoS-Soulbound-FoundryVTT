import Test from "./test.js";

export default class SpellTest extends Test{

    constructor(data)
    {
        super(data)
        if(data)
            this.testData.combat = data.combat
    }

    get template() {
        return "systems/age-of-sigmar-soulbound/template/chat/spell/spell-roll.html"
    }

    computeResult()
    {
        let result = super.computeResult()
        result.overcast = this.spell.overcast;
        result.duration = this.spell.duration;
        result.damage = this.computeDamage(result);
        return result
    }

    computeDamage(result) {
        let damage = {}
        if (result.success)
        {
            let formula = this.item.damage;
            formula = formula.toLowerCase().replace("s", result.degree)
            damage.total = eval(formula)
        }
        return damage
    }


    get spell() {
        return this.item
    }

    get spellFailed()
    {
        return !this.result.success
    }
}