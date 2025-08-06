import SoulboundTest from "./test.js";

export default class SpellTest extends SoulboundTest{

    constructor(data)
    {
        super(data)
        if(data)
        {
            this.testData.overcasts = {spent : 0, options : this.spell.overcasts}
        }

    }

    get template() {
        return "systems/age-of-sigmar-soulbound/templates/chat/spell/spell-roll.hbs"
    }

    async runPreScripts()
    {
        super.runPreScripts();
        await Promise.all(this.actor.runScripts("preRollSpellTest", this));
        await Promise.all(this.item.runScripts("preRollSpellTest", this));
    }

    async runPostScripts()
    {
        super.runPostScripts();
        await Promise.all(this.actor.runScripts("rollSpellTest", this));
        await Promise.all(this.item.runScripts("rollSpellTest", this));
    }

    computeResult()
    {
        super.computeResult()
        let result = this.result
        result.overcast = this.spell.overcast;
        result.duration = foundry.utils.deepClone(this.spell.duration);
        result.damage = this.computeDamage(result);
        
        if (result.success)
            this.computeOvercastAllocation()
        

        return result
    }

    computeDamage(result) {
        let damage = {}
        if (result.success) {
            damage.total = parseInt(this.item.damage)
        }
        
        if(result.triggerToDamage) {
            damage.total += result.triggers; 
        }
            
        return damage
    }

    computeOvercastAllocation()
    {
        this.result.overcasts = this.testData.overcasts
        let overcasts = this.result.overcasts

        // Start spent counter at 0
        overcasts.spent = 0
        for (let option of overcasts.options)
        {
            if (!option.allocation)
                option.allocation = 0

            // Set overcast property to be (overcasts allocated * value per overcast + initial value)
            setProperty(this.result, option.property, (parseInt(getProperty(this.result, option.property)) || 0) + option.allocation * option.ratio.value + (option.initial || 0))
            overcasts.spent += option.allocation * option.ratio.success
            if (option.property != "damage.total" && option.property != "duration.value")
                option.showTotal = true
        }
    }

    resetOvercasts() {
        for (let overcast of this.testData.overcasts.options)
        {
            overcast.allocation = 0
        }
        this.computeResult();
        this.sendToChat()
    }

    allocateOvercast(index)
    {
        let options = this.testData.overcasts.options
        let chosenOption = options[index]
        let hasEnoughSuccesses = (this.result.degree - this.result.overcasts.spent) >= chosenOption.ratio.success 

        if (!hasEnoughSuccesses)
            return ui.notifications.error(game.i18n.localize("ERROR.NotEnoughSuccesses"))

        if (!Number.isNumeric(chosenOption.allocation))
            chosenOption.allocation = 0

        chosenOption.allocation += 1
        this.computeResult();
        this.sendToChat()

    }


    get spell() {
        return this.item
    }

    get spellFailed()
    {
        return !this.result.success
    }

    get overcasts() {
        return this.result.overcasts
    }

    get canOvercast() {
        
        return (this.result.overcasts && this.result.overcasts.options.length > 0 && this.result.degree > 0)
    }
}