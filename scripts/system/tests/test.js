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
                // TODO apply doubles
                doubleTraining : data.doubleTraining || false,
                doubleFocus : data.doubleFocus || false
            },
            context : {
                speaker : data.speaker,
                targetSpeaker : data.targetSpeaker,
                rollClass : this.constructor.name
            },
            result : {}
        }
    }

    static recreate(data)
    {
        let test = new game.aos.rollClass[data.context.rollClass]()
        test.data = data;
        return data
    }

    async rollTest() {
        this.roll = new Roll(`${this.numberOfDice}d6cs>=${this.testData.dn.difficulty}`);  
        await this.roll.evaluate({async:true})  
        this.data.result = this._computeResult()   
    }


    _computeResult()
    {
        let result = this._applyFocus();
        result.hasSucceed = result.total >= this.testData.dn.complexity,
        result.success = result.total - this.testData.dn.complexity,
        result.missing = this.testData.dn.complexity - result.total,
        result.failed = result.dice.length - result.total,
        result.dn = this.testData.dn,
        result.focus =  this.testData.doubleFocus ? this.skill.focus * 2 : this.skill.focus;
        return result
    }

    _applyFocus() {
        let retVal = 
        {
            total : this.roll.total,
            dice : []
        }
        // Sorted to effiencently apply success not filtered since we would need 
        // to make another function to highlight dice in chat 
        let sorted = Test._getSortedDiceFromRoll(this.roll);
        let newTotal = this.roll.total;
        let triggered = false; 
        let f = this.testData.doubleFocus ? this.skill.focus * 2 : this.skill.focus;
        let dn = this.testData.dn

        for(let i = 0; i < sorted.length; i++) {
            let die = {
                value : sorted[i],
                highlight : false,
                success: false
            }
    
            if (this.testData.allocation == "success") {
                if (die.value >= dn.difficulty) {
                    die.success = true;
                }
                else {
                    if (f >= dn.difficulty - die.value) {
                        f -= (dn.difficulty - die.value);
                        die.value += (dn.difficulty - die.value);
                        die.success = true;
                        newTotal++;
                        die.highlight = true;
                    }
                }
                retVal.dice.push(die);
                continue;
            }
    
            if (this.testData.allocation == "sixes") {
                if (die.value >= dn.difficulty) {
                    die.success = true;
                     // was successful, checking for sixes now
                }
                if (die.value < 6) {
                     // ie.value is smaller than six
                    if (f >= dn.difficulty - die.value && die.success == false) {
                         //  still have focus to push to DN
                        f -= (dn.difficulty - die.value);
                        die.value += (dn.difficulty - die.value);
                        if (die.success == false) {
                             // pushed to DN, focus remaining: " + f
                            die.success = true;
                            newTotal++;
                        }   
                        die.highlight = true;
                    }
                    if (f >= 6 - die.value) {
                         //  still have focus to push to 6
                        f -= (6 - die.value);
                        die.value += (6 - die.value);
                        die.highlight = true;
                         // promoted to 6, focus remaining: " + f
                    }
                }
                retVal.dice.push(die);
                continue;
            }
    
            if (this.testData.allocation == "trigger") {
                if (die.value >= dn.difficulty) {
                    die.success = true;
                     // was successful
                    if (die.value >= 6) {
                        triggered = true;
                         // ding
                    }
                }
                if (triggered == false) {
                     // wasn't triggered so check for sixes
                    if (die.value < 6) {
                         // ie.value +" is smaller than six
                        if (f >= dn.difficulty - die.value && die.success == false) {
                             //  still have focus to push to DN
                            f -= (dn.difficulty - die.value);
                            die.value += (dn.difficulty - die.value);
                            if (die.success == false) {
                                 // pushed to DN, focus remaining: " + f
                                die.success = true;
                                newTotal++;
                            }   
                            die.highlight = true;
                        }
                        if (f >= 6 - die.value) {
                             //  still have focus to push to 6
                            f -= (6 - die.value);
                            die.value += (6 - die.value);
                            die.highlight = true;
                             // promoted to 6, focus remaining: " + f
                        }
                    }
                }
                else {
                     // has already been triggered so just go for DN
                    if (f >= dn.difficulty - die.value && die.success == false) {
                         //  +" focus remain, push to DN
                        f -= (dn.difficulty - die.value);
                        die.value += (dn.difficulty - die.value);
                        if (die.success == false) {
                            die.success = true;
                            newTotal++;
                        }
                        die.highlight = true;
                    }
                }
                retVal.dice.push(die);
                continue;
            }
    
            if (this.testData.allocation == "manual") {
                if (die.value >= dn.difficulty) {
                    die.success = true;
                    newTotal++;
                }
                retVal.dice.push(die);
                continue;
            }
        }            
    
        retVal.total = newTotal;
        
        return retVal;
    }


    async sendToChat()
    {
        const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/chat/roll.html", this);
        let chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
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
        ChatMessage.create(chatData);
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
        return this.attribute.total +  this.testData.bonusDice + (this.testData.doubleTraining ? this.skill.roll * 2 : this.skill.roll)
    }


}