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
                    test.allocateFocus(Array.from(li.find(".selected")).map(i => parseInt(i.dataset.index)).filter(i => Number.isNumeric(i)))
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
                }
            }
        );

        options.push(
            {
                name: "CHAT.APPLY_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => this.applyChatCardDamage(li, 1)
            }
        );
        options.push(
            {
                name: "CHAT.APPLY_DOUBLE_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => this.applyChatCardDamage(li, 2)
            }
        );
    

        options.push(
            {
                name: "CHAT.APPLY_CLEAVE_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyCleave,
                callback: li => this.applyCleaveDamage(li)
            }
        )
        

        options.push(
            {
                name: "CHAT.APPLY_REND_DAMAGE",
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyRend,
                callback: li => this.applyRend(li)
            }
        )
    
        return options;
    };

    /**
     * @param {HTMLElement} messsage    The chat entry which contains the roll data
     * @return {Promise}
     */
    static applyChatCardDamage(li, multiplier) {
        const message = game.messages.get(li.data("messageId"));
        let damage = message.getTest().result.damage.total
        damage *= multiplier;
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
    static applyCleaveDamage(message) {    
        let damage = extractChatCardNumber(message, ".cleave-value");
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
        let damage = extractChatCardNumber(message, ".rend-value");
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
        html.on("click" , ".diceClick", SoulboundChat._onDiceClick);
        html.on("click", ".test-button", SoulboundChat._onTestButtonClick)

    }

    static _onDiceClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let msg = game.messages.get(id)
        if (msg.isOwner)
            ev.currentTarget.classList.toggle("selected")
    }

    static async _onTestButtonClick(ev)
    {
        let id = $(ev.currentTarget).parents(".message").attr("data-message-id")
        let msg = game.messages.get(id)
        let test = msg.getTest();
        let testData
        if (canvas.tokens.controlled.length)
        {
            for (let t of canvas.tokens.controlled)
            {
                if (test.item.test.skill)
                    testData = await t.actor.setupSkillTest(test.item.test.skill, test.item.test.attribute)            
                else 
                    testData = await t.actor.setupAttributeTest(test.item.test.attribute)  
                    
                let chatTest = new game.aos.rollClass.Test(testData)
                await chatTest.rollTest()
                chatTest.sendToChat()     
            }
        }
        else if (game.user.character)
        {
            if (test.item.test.skill)
                testData = await game.user.character.setupSkillTest(test.item.test.skill, test.item.test.attribute)            
            else 
                testData = await game.user.character.setupAttributeTest(test.item.test.attribute)       
                
            let chatTest = new game.aos.rollClass.Test(testData)
            await chatTest.rollTest()
            chatTest.sendToChat()     
        }
        else
            return ui.notifications.warn(game.i18n.localize("WARN.NoActorsToTest"))

   
    }

}


