export default class SoulboundTest extends WarhammerTestBase {
    constructor(data) {
        super(data);
        if (!data)
            return 
        this.data = {
            testData : {
                attribute : data.attribute,
                skill : data.skill,
                bonusDice : data.bonusDice,
                bonusFocus : data.bonusFocus,
                dn : data.dn || {difficulty : data.difficulty, complexity : data.complexity, name : data.options.title},
                allocation: data.allocation || [],
                itemId : data.itemId,
                doubleTraining : data.doubleTraining || false,
                doubleFocus : data.doubleFocus || false,
                triggerToDamage: data.triggerToDamage || false,
                options : data.options || {}
            },
            context : {
                speaker : data.speaker,
                targetSpeakers : data.targets || [],
                rollClass : this.constructor.name,
                focusAllocated : false,
                messageId : undefined,
            },
            result : {}
        }
    }

    static fromData(setupData)
    {
        return new this(setupData);
    }

    get template() {
        return "systems/age-of-sigmar-soulbound/template/chat/base/base-roll.hbs"
    }

    static recreate(data)
    {
        let test = new game.aos.rollClass[data.context.rollClass]()
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
            focus : this.skill?.focus || 0,
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

    async allocateFocus(allocation)
    {
        if (allocation.reduce((prev, current) => prev + current, 0) > this.result.focus)
            return ui.notifications.error(game.i18n.localize("ERROR.NotEnoughFocus"))
        this.testData.allocation = allocation;
        this.context.focusAllocated = true;
        await this.roll();
        this.sendToChat();
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
        let chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            speaker : this.context.speaker,
            rolls: [this.dice],
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
            type : "test",
            system : this.data
        };
        chatData.speaker.alias = this.actor.token ? this.actor.token.name : this.actor.prototypeToken.name
        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");
        } else if (chatData.rollMode === "selfroll") {
            chatData.whisper = [game.user];
        }

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
        return this.actor.attributes[this.testData.attribute]
    }

    get skill() {
        return this.actor.skills[this.testData.skill]
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
        return this._hasTest(this.item)
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