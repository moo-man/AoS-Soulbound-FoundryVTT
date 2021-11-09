export default class SoulboundChat {

    static addChatMessageContextOptions(html, options) {


        let canApplyFocus = li => {
            return li.find(".selected").length > 0
        }

        let canResetFocus = li => {
            const message = game.messages.get(li.data("messageId"));
            let test = message.getTest();
            return test.context.focusAllocated
        }

        let canClearFocus = li => {
            const message = game.messages.get(li.data("messageId"));
            let test = message.getTest();
            if(test.context.focusAllocated)
                return false
            let hasFocusCounter = false;
            let counters = Array.from(li.find(".focus-counter"))
            counters.forEach(c => {
                if (parseInt(c.text) > 0 || c.style.display != "none")
                    hasFocusCounter = true;
            })
            return hasFocusCounter           
        }

        let canApplyDamage = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && message.getTest().result.damage; //is damage roll
        };

        let canApplyCleave = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && li.find('.cleave-value').length; //has cleave effect
        };

        let canApplyRend = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && li.find('.rend-value').length; //has rend effect
        };

        options.unshift(
            {
                name: "CHAT.APPLY_FOCUS",
                icon: '<i class="fas fa-angle-double-up"></i>',
                condition: canApplyFocus,
                callback: li => {
                    const message = game.messages.get(li.data("messageId"));
                    let test = message.getTest();
                    test.allocateFocus(Array.from(li.find(".focus-counter")).map(i => parseInt(i.textContent) || 0))
                }
            }
        );
        
        options.unshift(
            {
                name: "CHAT.RESET_FOCUS",
                icon: '<i class="fas fa-redo"></i>',
                condition: canResetFocus,
                callback: li => {
                    const message = game.messages.get(li.data("messageId"));
                    let test = message.getTest();
                    test.resetFocus();
                    SoulboundChat._clearFocusCounters(li)
                }
            }
        );

        options.unshift(
            {
                name: "CHAT.CLEAR_FOCUS",
                icon: '<i class="fas fa-redo"></i>',
                condition: canClearFocus,
                callback: li => {
                    SoulboundChat._clearFocusCounters(li)
                }
            }
        );

        options.push(
            {
                name: "CHAT.APPLY_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => SoulboundChat.applyChatCardDamage(li, 1)
            }
        );

        options.push(
            {
                name: "CHAT.APPLY_DAMAGE_IGNORE_ARMOUR",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => SoulboundChat.applyChatCardDamage(li, 1,  {ignoreArmour : true})
            }
        );
    

        options.push(
            {
                name: "CHAT.APPLY_DOUBLE_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => SoulboundChat.applyChatCardDamage(li, 2)
            }   
        );
    

        options.push(
            {
                name: "CHAT.APPLY_CLEAVE_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyCleave,
                callback: li => SoulboundChat.applyCleaveDamage(li)
            }
        )
        

        options.push(
            {
                name: "CHAT.APPLY_REND_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyRend,
                callback: li => SoulboundChat.applyRend(li)
            }
        )
    
        return options;
    };

    /**
     * @param {HTMLElement} messsage    The chat entry which contains the roll data
     * @return {Promise}
     */
    static applyChatCardDamage(li, multiplier, options) {
        const message = game.messages.get(li.data("messageId"));
        let damage = message.getTest().result.damage.total
        damage *= multiplier;
        // apply to any selected actors
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.applyDamage(damage, options);
        }));
    }

    /**
     * @param {HTMLElement} messsage    The chat entry which contains the roll data
     * @return {Promise}
     */
    static applyCleaveDamage(message) {    
        let test = message.getTest();
        let damage = test.result.triggers
        // apply to any selected actors
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.applyDamage(damage);
        }));
    }

    /**
     * @param {HTMLElement} messsage    The chat entry which contains the roll data
     * @return {Promise}
     */
    static applyRend(message) {    
        let test = message.getTest();
        let damage = test.result.triggers
        // apply to any selected actors
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.applyRend(damage);
        }));
    }

    static extractChatCardNumber(message, id) {
        let el = message.find(id);
        let regex = /\d+/;
        return parseInt($(el[0]).text().match(regex));
    }


    static activateListeners(html)
    {
        html.on("click" , ".diceClick", SoulboundChat._onDiceClick.bind(this));
        html.on("click", ".test-button", SoulboundChat._onTestButtonClick.bind(this))
        html.on("click", ".spell-fail-button", SoulboundChat._onSpellFailClick.bind(this))
        html.on("click", ".effect-button", SoulboundChat._onEffectButtonClick.bind(this))

    }

    static _onDiceClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let msg = game.messages.get(id)
        let counter = $(ev.currentTarget).find(".focus-counter")
        let test = msg.getTest()
        const MAX_FOCUS = test.result.focus
        let current = this._sumFocus($(ev.currentTarget).parents(".message"))
        let num = parseInt(counter[0].textContent) || 0

        if (MAX_FOCUS == 0)
            return
        if (current >=  MAX_FOCUS)
            return ui.notifications.error("Not Enough Focus!")
        
        if (msg.isOwner)
        {
            if (ev.currentTarget.classList.contains("selected"))
                num++
            else
            {
                ev.currentTarget.classList.toggle("selected")
                num++
                counter.show()
            }

            if(num > MAX_FOCUS)
            {
                num = 0
                ev.currentTarget.classList.toggle("selected")
                counter.hide()
            }
        }
        counter[0].textContent = num

    }

    static _sumFocus(html)
    {
        let counters = Array.from(html.find(".focus-counter"))
        let num = 0;
        counters.forEach(c => {
            num += parseInt(c.textContent) || 0
        })
        return num;
    }

    static _clearFocusCounters(html)
    {
        html.find(".focus-counter").each((c, counter) => {
            counter.textContent = "0";
            counter.style.display = "none"
        })

        html.find(".selected").each((d, die) => {
            die.classList.remove("selected")
        })
    }

    static async _onTestButtonClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let msg = game.messages.get(id)
        let test = msg.getTest();
        let [difficulty, complexity] = test.itemTest.dn.split(":").map(i=> parseInt(i))
        let testData
        if (canvas.tokens.controlled.length)
        {
            for (let t of canvas.tokens.controlled)
            {
                if (test.itemTest.skill)
                    testData = await t.actor.setupSkillTest(test.itemTest.skill, test.itemTest.attribute, {difficulty, complexity})            
                else 
                    testData = await t.actor.setupAttributeTest(test.itemTest.attribute, {difficulty, complexity})  
                    
                let chatTest = new game.aos.rollClass.Test(testData)
                await chatTest.rollTest()
                chatTest.sendToChat()     
            }
        }
        else if (game.user.character)
        {
            if (test.itemTest.skill)
                testData = await game.user.character.setupSkillTest(test.itemTest.skill, test.itemTest.attribute, {difficulty, complexity})            
            else 
                testData = await game.user.character.setupAttributeTest(test.itemTest.attribute, {difficulty, complexity})       
                
            let chatTest = new game.aos.rollClass.Test(testData)
            await chatTest.rollTest()
            chatTest.sendToChat()     
        }
        else
            return ui.notifications.warn(game.i18n.localize("WARN.NoActorsToTest"))

   
    }

    static async _onSpellFailClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let msg = game.messages.get(id)
        let test = msg.getTest();
        let diceNum = test.testData.dn.complexity - test.result.successes;
        let formula  = `${diceNum}d6`
        let tableRoll = new Roll(formula).roll()
        let table = game.tables.getName("The Price of Failure")
        if (table)
        {
            let {roll, results} =  await table.roll({roll : tableRoll})
            ChatMessage.create({content : `<b>${roll.total}</b>: ${results[0].data.text}`, flavor : `The Price of Failure (${formula})`, speaker : test.speakerData})
        }
        else
            ui.notifications.error("No Table Found")
    }

    static async _onEffectButtonClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let effectId = $(ev.currentTarget).attr("data-id")
        let msg = game.messages.get(id)
        let test = msg.getTest();
        let item = test.item
        let effect = item.effects.get(effectId).toObject()
        effect.origin = test.actor.uuid
        let duration = item.duration

        if (duration.unit == "round")
            effect.duration.rounds = parseInt(duration.value)
        else if  (duration.unit == "minute")
            effect.duration.seconds = parseInt(duration.value) * 60
        else if (duration.unit == "hour")
            effect.duration.seconds = parseInt(duration.value) * 60 * 60
        else if (duration.unit == "day")
            effect.duration.seconds = parseInt(duration.value) * 60 * 60 * 24

        if (canvas.tokens.controlled.length)
        {
            for (let t of canvas.tokens.controlled)
                t.actor.createEmbeddedDocuments("ActiveEffect", [effect])
        }
        else if (game.user.character)
            game.user.character.createEmbeddedDocuments("ActiveEffect", [effect])

        else
            return ui.notifications.warn(game.i18n.localize("WARN.NoActorsToApply"))

   
    }
}


