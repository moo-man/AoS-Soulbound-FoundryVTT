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
                focusAllocated : false
            },
            result : {}
        }
    }

    static recreate(data)
    {
        let test = new game.aos.rollClass[data.context.rollClass]()
        test.data = data;
        test.roll = Roll.fromData(test.testData.roll)
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
        
        // Sorted to effiencently apply success not filtered since we would need 
        // to make another function to highlight dice in chat 
        let sorted = Test._getSortedDiceFromRoll(this.roll);
        let dn = this.testData.dn

        for(let i = 0; i < sorted.length; i++) {
                let die = {
                    value : sorted[i],
                    highlight : false,
                    success: false
                }
                if (this.testData.allocation.includes(i))
                {
                    die.value++
                    if (die.value > 6)
                        die.value = 6;
                    die.highlight = true;
                }
                if (die.value >= dn.difficulty)
                {
                    die.success = true;
                }
                result.dice.push(die)
            }            
    
            // if (this.testData.allocation == "success") {
            //     if (die.value >= dn.difficulty) {
            //         die.success = true;
            //     }
            //     else {
            //         if (f >= dn.difficulty - die.value) {
            //             f -= (dn.difficulty - die.value);
            //             die.value += (dn.difficulty - die.value);
            //             die.success = true;
            //             newTotal++;
            //             die.highlight = true;
            //         }
            //     }
            //     result.dice.push(die);
            //     continue;
            // }
    
            // if (this.testData.allocation == "sixes") {
            //     if (die.value >= dn.difficulty) {
            //         die.success = true;
            //          // was successful, checking for sixes now
            //     }
            //     if (die.value < 6) {
            //          // ie.value is smaller than six
            //         if (f >= dn.difficulty - die.value && die.success == false) {
            //              //  still have focus to push to DN
            //             f -= (dn.difficulty - die.value);
            //             die.value += (dn.difficulty - die.value);
            //             if (die.success == false) {
            //                  // pushed to DN, 
            //                 die.success = true;
            //                 newTotal++;
            //             }   
            //             die.highlight = true;
            //         }
            //         if (f >= 6 - die.value) {
            //              //  still have focus to push to 6
            //             f -= (6 - die.value);
            //             die.value += (6 - die.value);
            //             die.highlight = true;
            //              // promoted to 6
            //         }
            //     }
            //     result.dice.push(die);
            //     continue;
            // }
    
            // if (this.testData.allocation == "trigger") {
            //     if (die.value >= dn.difficulty) {
            //         die.success = true;
            //          // was successful
            //         if (die.value >= 6) {
            //             triggered = true;
            //              // ding
            //         }
            //     }
            //     if (triggered == false) {
            //          // wasn't triggered so check for sixes
            //         if (die.value < 6) {
            //              // ie.value +" is smaller than six
            //             if (f >= dn.difficulty - die.value && die.success == false) {
            //                  //  still have focus to push to DN
            //                 f -= (dn.difficulty - die.value);
            //                 die.value += (dn.difficulty - die.value);
            //                 if (die.success == false) {
            //                      // pushed to DN
            //                     die.success = true;
            //                     newTotal++;
            //                 }   
            //                 die.highlight = true;
            //             }
            //             if (f >= 6 - die.value) {
            //                  //  still have focus to push to 6
            //                 f -= (6 - die.value);
            //                 die.value += (6 - die.value);
            //                 die.highlight = true;
            //                  // promoted to 6
            //             }
            //         }
            //     }
            //     else {
            //          // has already been triggered so just go for DN
            //         if (f >= dn.difficulty - die.value && die.success == false) {
            //              //  +" focus remain, push to DN
            //             f -= (dn.difficulty - die.value);
            //             die.value += (dn.difficulty - die.value);
            //             if (die.success == false) {
            //                 die.success = true;
            //                 newTotal++;
            //             }
            //             die.highlight = true;
            //         }
            //     }
            //     result.dice.push(die);
            //     continue;
            // }
    
            // if (this.testData.allocation == "manual") {
            //     if (die.value >= dn.difficulty) {
            //         die.success = true;
            //         newTotal++;
            //     }
            //     result.dice.push(die);
            //     continue;
            // }
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
        if (allocation.length > this.result.focus)
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
}