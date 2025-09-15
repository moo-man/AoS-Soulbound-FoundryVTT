import SoulboundTest from "./test.js";

export default class MiracleTest extends SoulboundTest{


    get template() {
        return "systems/age-of-sigmar-soulbound/templates/chat/miracle/miracle-roll.hbs"
    }


    async roll() {
        if (this.item.test.opposed)
        {
            this.dice = this.testData.dice ? Roll.fromData(this.testData.dice) : new Roll(`${this.numberOfDice}d6cs>=${this.testData.dn.difficulty}`);
            await this.dice.roll()  
            this.dice.dice[0].results.forEach((result, i) => {
                result.index = i;
            })  
            this.computeResult();
            await this.promptAllocation();

        }
        else 
        {
            this.dice = new Roll("0");
            await this.dice.roll(); // Chat Messages must have an evaluated test
        }

        this.testData.dice = this.dice.toJSON();

        this.context.description = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.description, {secrets: false, relativeTo: this.item})

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