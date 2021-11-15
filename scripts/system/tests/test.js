export default class Test {
    constructor(data) {
        if (!data)
            return 
        this.data = {
            testData : {
                attribute : data.attribute,
                skill : data.skill,
                bonusDice : data.bonusDice,
                dn : data.dn,
                allocation: data.allocation,
                itemId : data.itemId,
                doubleTraining : data.doubleTraining || false,
                doubleFocus : data.doubleFocus || false
            },
            context : {
                speaker : data.speaker,
                targetSpeaker : data.targetSpeaker,
                rollClass : this.constructor.name,
                focusAllocated : false,
                messageId : undefined
            },
            result : {}
        }
    }

    static recreate(data)
    {
        let test = new game.aos.rollClass[data.context.rollClass]()
        test.data = data;
        test.roll = Roll.fromData(test.testData.roll)
        if (test.context.rerolled)
            test.rerolledDice = Roll.fromData(test.testData.reroll)
        return test
    }

    async rollTest() {
        this.roll = this.testData.roll ? Roll.fromData(this.testData.roll) : new Roll(`${this.numberOfDice}d6cs>=${this.testData.dn.difficulty}`);  
        this.testData.roll = this.roll.toJSON()
        await this.roll.evaluate({async:true})  
        this.data.result = this.computeResult()   
    }


    computeResult()
    {
        let result = this._computeRoll();
        result.success = result.successes >= this.testData.dn.complexity
        result.degree = result.success ? result.successes - this.testData.dn.complexity : this.testData.dn.complexity - result.successes
        result.dn = this.testData.dn
        return result
    }

    _computeRoll() {
        let result = 
        {
            triggers : 0,
            dice : [],
            focus : this.skill?.focus || 0
        }
        result.focus = this.testData.doubleFocus ? result.focus * 2 : result.focus
        let dn = this.testData.dn
        
        // Sorted to effiencently apply success not filtered since we would need 
        // to make another function to highlight dice in chat 
        let sorted = Test._getSortedDiceFromRoll(this.roll);

        if (this.context.rerolled) 
        {
            let sortedReroll = Test._getSortedDiceFromRoll(this.rerolledDice);
            sorted = sorted.map((die, index) => {
                if (this.testData.shouldReroll[index])
                    return sortedReroll[index]
                else
                    return sorted[index]
            })
        }


        for(let i = 0; i < sorted.length; i++) {
                let die = {
                    value : this.context.maximized ? 6 : sorted[i],
                    highlight : false,
                    success: false,
                    rerolled : this.context.rerolled ? this.testData.shouldReroll[i] : false 
                }
                if (this.testData.allocation[i] > 0)
                {
                    die.value += this.testData.allocation[i]
                    die.focus = this.testData.allocation[i]
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

        let path;
        if (game.modules.get("soulbound-core")?.active)
            path = `modules/soulbound-core/assets/dice`
        else  
            path = `systems/age-of-sigmar-soulbound/asset/image`
    
        result.dice.forEach(die => {
            die.img = `${path}/dice-${die.value}-failed.png`
            if (die.success)
                die.img = `${path}/dice-${die.value}-chat.png`
            if (die.highlight)
                die.img = `${path}/dice-${die.value}-highlight.png`
        })
        
        return result;
    }

    allocateFocus(allocation)
    {
        if (allocation.reduce((prev, current) => prev + current, 0) > this.result.focus)
            return ui.notifications.error(game.i18n.localize("ERROR.NotEnoughFocus"))
        this.testData.allocation = allocation;
        this.context.focusAllocated = true;
        this.data.result = this.computeResult();
        this.sendToChat();
    }

    resetFocus()
    {
        this.testData.allocation = [];
        this.context.focusAllocated = false;
        this.data.result = this.computeResult();
        this.sendToChat();
    }

    async reroll(shouldReroll)
    {
        this.rerolledDice = this.roll.reroll();
        this.context.rerolled = true;
        this.testData.reroll = this.rerolledDice.toJSON()
        this.testData.shouldReroll = shouldReroll
        
        if (game.dice3d)
        {
            let dsnRerollData = duplicate(this.testData.reroll);
            dsnRerollData.terms[0].results = Test._getSortedDiceFromRoll(dsnRerollData).map(i => {return {result: i}})
            dsnRerollData.terms[0].results = dsnRerollData.terms[0].results.filter((die, index) => this.testData.shouldReroll[index])
            let dsnReroll = Roll.fromData    (dsnRerollData)
            await game.dice3d.showForRoll(dsnReroll)
        }

        this.data.result = this.computeResult();
        this.sendToChat();
    }

    maximize()
    {
        this.context.maximized = true;
        this.data.result = this.computeResult();
        this.sendToChat();
    }

    async sendToChat({newMessage = false} = {})
    {
        const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/chat/roll.html", this);
        let chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            speaker : this.context.speaker,
            roll: this.roll,
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
            flags: {
                "age-of-sigmar-soulbound.rollData" : this.data
            }
        };
        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");
        } else if (chatData.rollMode === "selfroll") {
            chatData.whisper = [game.user];
        }

        if (this.message && !newMessage)
        {
            chatData.roll = chatData.roll.toJSON()
            this.message.update(chatData)
        }
        else
        {
            return ChatMessage.create(chatData).then(msg => {
                this.context.messageId = msg.id;
                msg.update({"flags.age-of-sigmar-soulbound.rollData" : this.data})
            });
        }
    }

    static _getSortedDiceFromRoll(roll) {
        return roll.terms
                    .flatMap(term => term.results)
                    .map(die => die.result)
                    .sort((a, b) => b - a);
    }

    get testData() { return this.data.testData }
    get context() { return this.data.context}
    get result() { return this.data.result}

    get actor() {
        return game.aos.utility.getSpeaker(this.context.speaker)
    }

    get target() {
        return game.aos.utility.getSpeaker(this.context.targetSpeaker)
    }

    get attribute() {
        return this.actor.attributes[this.testData.attribute]
    }

    get skill() {
        return this.actor.skills[this.testData.skill]
    }

    get item() {
        return this.actor.items.get(this.testData.itemId)
    }

    get numberOfDice()
    {
        let num = this.attribute.value +  this.testData.bonusDice
        if (this.skill)
            num += (this.testData.doubleTraining ? this.skill.training * 2 : this.skill.training) + this.skill.bonus
        return num
    }

    get message() {
        return game.messages.get(this.context.messageId);
    }

    get effects() {
        if(!this.item)
            return []
        return this.item.effects.filter(e => !e.data.transfer)
    }

    get itemTest() {
        let DN = this.item.test.dn
        if (DN.includes("S"))
            DN = DN.replace("S", 1 + this.result.degree)
        
        return {dn : DN, attribute : this.item.test.attribute, skill : this.item.test.skill} 
    }

    get ItemTestDisplay() {
        let test = this.itemTest;
        return `DN ${test.dn} ${game.aos.config.attributes[test.attribute]} (${game.aos.config.skills[test.skill]})`
    }

    get hasTest() {
        return this.result.success && this.item?.hasTest
    }
}