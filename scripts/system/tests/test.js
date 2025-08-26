import FocusAllocation from "../../apps/focus-allocation";

export default class SoulboundTest extends WarhammerTestBase {
    constructor(data) {
        super(data);
        if (!data)
            return 
        this.data = {
            testData : {
                attribute : data.attribute,
                skill : data.skill,
                numOfDice : data.dice,
                focus : data.focus,
                bonusDice : data.bonusDice,
                bonusFocus : data.bonusFocus,
                dn : data.dn || {difficulty : data.difficulty, complexity : data.complexity, name : data.context.title},
                allocation: data.allocation || [],
                itemId : data.itemId,
                doubleTraining : data.doubleTraining || false,
                doubleFocus : data.doubleFocus || false,
                triggerToDamage: data.triggerToDamage || false,
            },
            context : {
                speaker : data.speaker,
                targetSpeakers : data.targets || [],
                rollClass : this.constructor.name,
                focusAllocated : false,
                messageId : undefined,
                rollMode : data.rollMode,
                flags: data.context?.flags || {}
            },
            result : {}
        }
    }

    static fromData(setupData)
    {
        return new this(setupData);
    }

    get template() {
        return "systems/age-of-sigmar-soulbound/templates/chat/base/base-roll.hbs"
    }

    static recreate(data)
    {
        let test = new game.aos.config.rollClasses[data.context.rollClass]()
        test.data = data;
        test.dice = Roll.fromData(test.testData.dice)
        if (test.context.rerolled)
            test.rerolledDice = Roll.fromData(test.testData.reroll)
        return test
    }

    async roll() {
        this.dice = this.testData.dice ? Roll.fromData(this.testData.dice) : new Roll(`${this.numberOfDice}d6cs>=${this.testData.dn.difficulty}`);  
        this.testData.dice = this.dice.toJSON()
        await this.runPreScripts()
        await this.dice.evaluate()  
        this.dice.dice[0].results.forEach((result, i) => {
            result.index = i;
        })
        this.computeResult()   
        if (this.item)
        {
            this.context.description = await TextEditor.enrichHTML(this.item.system.description, {secrets: false, relativeTo: this.item})
        }
        await this.promptAllocation();
        await this.runPostScripts()
    }


    computeResult()
    {
        let result = this._computeRoll();
        result.success = result.successes >= this.testData.dn.complexity
        result.degree = result.success ? result.successes - this.testData.dn.complexity : this.testData.dn.complexity - result.successes
        result.dn = this.testData.dn
        this.data.result = result
        return result
    }

    _computeRoll() {
        let result = 
        {
            triggers : 0,
            dice : [],
            focus : this.testData.focus || this.skill?.focus || 0,
            triggerToDamage : this.testData.triggerToDamage || false,
            other : [],
        }
        result.focus = (this.testData.doubleFocus ? result.focus * 2 : result.focus) + this.testData.bonusFocus
        let dn = this.testData.dn
        
        // Sorted to effiencently apply success not filtered since we would need 
        // to make another function to highlight dice in chat 
        let sorted = SoulboundTest._getSortedDiceFromRoll(this.dice);

        if (this.context.rerolled) 
        {
            let sortedReroll = SoulboundTest._getSortedDiceFromRoll(this.rerolledDice);
            sorted = sorted.map((die) => {
                let index = die.index
                if (this.testData.shouldReroll[index])
                    return sortedReroll.find(i => i.index == index)
                else
                    return sorted.find(i => i.index == index)
            })
        }


        for(let i = 0; i < sorted.length; i++) {
                let die = {
                    value : this.context.maximized ? 6 : sorted[i].result,
                    index : sorted[i].index,
                    highlight : false,
                    success: false,
                    rerolled : this.context.rerolled ? this.testData.shouldReroll[sorted[i].index] : false 
                }
                if (this.testData.allocation[die.index] > 0)
                {
                    die.value += this.testData.allocation[die.index]
                    die.focus = this.testData.allocation[die.index]
                    if (die.value > 6)
                        die.value = 6;
                    die.highlight = true;
                }
                if (die.value >= dn.difficulty)
                    die.success = true;
                    
                if (die.value == 6)
                    die.trigger = true;
                result.dice.push(die)
            }            
    
        result.triggers = result.dice.filter(die => die.value === 6).length
        result.successes = result.dice.reduce((prev, current) => prev += current.success, 0)

        let path = game.aos.config.dicePath;
        result.dice.forEach(die => {
            die.img = `${path}/dice-${die.value}-failed.webp`
            if (die.success)
                die.img = `${path}/dice-${die.value}-chat.webp`
            if (die.highlight)
                die.img = `${path}/dice-${die.value}-highlight.webp`
        })
        
        return result;
    }

    async promptAllocation()
    {
        if (this.context.focusAllocated)
        {
            return;
        }

        if (!this.message)
        {
            let message = await ChatMessage.create(ChatMessage.applyRollMode({content : "<em>Allocating Focus...</em>", type : "test", speaker : this.context.speaker}, this.context.rollMode));
            this.context.messageId = message.id;
        }

        if (this.result.focus)
        {
            let pos = document.querySelector(`#chat-message`).getBoundingClientRect();
            // let pos = document.querySelector(`[data-message-id="${message.id}"]`)?.getBoundingClientRect() || {};
            this.testData.allocation = (await FocusAllocation.prompt(this, {position : {left : pos.x - (pos.width), top: pos.y - (pos.height * 2)}})) || [];
            this.context.focusAllocated = true;
            this.computeResult();
        }
    }


    async resetFocus()
    {
        this.testData.allocation = [];
        this.context.focusAllocated = false;
        await this.roll();
        this.sendToChat();
    }

    async reroll(shouldReroll)
    {
        this.rerolledDice = await this.dice.reroll();
        this.rerolledDice.dice[0].results.forEach((result, i) => {
            result.index = i
        })
        this.context.rerolled = true;
        this.testData.reroll = this.rerolledDice.toJSON()
        this.testData.shouldReroll = shouldReroll
        
        if (game.dice3d)
        {
            let dsnRerollData = duplicate(this.testData.reroll);
            dsnRerollData.terms[0].results = dsnRerollData.terms[0].results.filter((die) => this.testData.shouldReroll[die.index])
            let dsnReroll = Roll.fromData    (dsnRerollData)
            await game.dice3d.showForRoll(dsnReroll)
        }

        await this.roll();
        // this.computeResult();
        this.sendToChat();
    }

    async maximize()
    {
        this.context.maximized = true;
        await this.roll();
        this.sendToChat();
    }

    async sendToChat({newMessage = false} = {})
    {
        const html = await renderTemplate(this.template, this);
        let chatData = ChatMessage.applyRollMode({
            user: game.user.id,
            speaker : this.context.speaker,
            rolls: [this.dice],
            content: html,
            type : "test",
            system : this.data
        }, this.context.rollMode);

        if (this.message && !newMessage)
        {
            // Updating with a roll object causes validation error
            delete chatData.rolls
            this.message.update(chatData)
        }
        else
        {
            return ChatMessage.create(chatData).then(msg => {
                this.context.messageId = msg.id;
                msg.update({system : this.data})
            });
        }
    }

    static _getSortedDiceFromRoll(roll) {
        return roll.terms
                    .flatMap(term => term.results)
                    .map(die => {return {result : die.result, index : die.index}})
                    .sort((a, b) => b.result - a.result);
    }

    get testData() { return this.data.testData }
    get context() { return this.data.context}
    get result() { return this.data.result}

    get actor() {
        return ChatMessage.getSpeakerActor(this.context.speaker)
    }

    get targets() {
        return this.context.targetSpeakers.map(speaker => ChatMessage.getSpeakerActor(speaker))
    }

    get targetTokens() {
        return this.context.targetSpeakers.map(speaker => game.scenes.get(speaker.scene).tokens.get(speaker.token))
    }

    get target() {
        return this.targets[0]
    }

    get attribute() {
        return this.actor.attributes?.[this.testData.attribute]
    }

    get skill() {
        return this.actor.skills?.[this.testData.skill]
    }

    get item() {
        return fromUuidSync(this.testData.itemId)
    }

    get succeeded() {
        return this.result.success
    }

    get failed() {
        return !this.succeeded
    }

    get numberOfDice()
    {
        if (this.testData.numOfDice)
        {
            return this.testData.numOfDice + this.testData.bonusDice;
        }
        let num = this.attribute.value +  this.testData.bonusDice
        if (this.skill)
            num += (this.testData.doubleTraining ? this.skill.training * 2 : this.skill.training) + this.skill.bonus
        return num
    }

    get message() {
        return game.messages.get(this.context.messageId);
    }
    
    get itemTest() {
        return this._itemTest(this.item)
    }

    get ItemTestDisplay() {
        return this._ItemTestDisplay(this.item)
    }

    get hasTest() {

        let effects = this.targetEffects.concat(this.damageEffects).concat(this.zoneEffects)
    
        // Effects already prompt a test
        if (effects.some(e => e.system.transferData.avoidTest.value == "item"))
        {
            return false;
        }
        else
        {
            return this._hasTest(this.item)
        }

    }

    _itemTest(item) {
        let DN = item.test.dn
        if (DN.includes("S"))
            DN = DN.replace("S", 1 + this.result.degree)
        
        return {dn : DN, attribute : item.test.attribute, skill : item.test.skill} 
    }

    _ItemTestDisplay(item) {
        let test = this._itemTest(item);
        return `DN ${test.dn} ${game.aos.config.attributes[test.attribute]} (${game.aos.config.skills[test.skill]})`
    }

    _hasTest(item) {
        return this.result.success && item?.hasTest
    }

}