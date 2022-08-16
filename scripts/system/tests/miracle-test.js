import Test from "./test.js";

export default class MiracleTest extends Test{


    get template() {
        return "systems/age-of-sigmar-soulbound/template/chat/miracle/miracle-roll.html"
    }


    async rollTest() {
        if (this.item.test.opposed)
        {
            this.roll = this.testData.roll ? Roll.fromData(this.testData.roll) : new Roll(`${this.numberOfDice}d6cs>=${this.testData.dn.difficulty}`);
            await this.roll.evaluate({async:true})  
            this.roll.dice[0].results.forEach((result, i) => {
                result.index = i;
            })  
            this.computeResult()   
        }
        else 
            this.roll = new Roll("")

        this.testData.roll = this.roll.toJSON()

        if (!this.context.mettleSubtracted)
        {
            this.actor.update({"system.combat.mettle.value" : this.actor.combat.mettle.value - this.item.cost})
            this.context.mettleSubtracted = true
        }
    }

    computeResult()
    {
        let result
        if (this.item.test.opposed)
        {
            result = this._computeRoll();
            result.success = result.successes >= this.testData.dn.complexity
            result.degree = result.success ? result.successes - this.testData.dn.complexity : this.testData.dn.complexity - result.successes
            result.dn = this.testData.dn
            result.rolled = true
        }
        else {
            result = {
                triggers : 0,
                dice : [],
                focus : this.skill?.focus || 0,
                success : true
            }
        }


        result.duration = this.item.duration

        this.data.result = result
        return result
    }

    get miracle() {
        return this.item
    }

    // Remove successful condition to show the test
    get hasTest() {
        return this.item?.hasTest
    }

    _ItemTestDisplay(item) {
        return `DN 4:1 ${game.aos.config.attributes[item.test.attribute]} (${game.aos.config.skills[item.test.skill]})`
    }


}