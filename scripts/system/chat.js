import Reroller from "../apps/reroller.js";
import SoulboundCounter from "../apps/counter.js";

export default class SoulboundChat {

    static addChatMessageContextOptions(html, options) {


        let canApplyFocus = li => {
            return li.find(".selected").length > 0
        }

        let canResetFocus = li => {
            const message = game.messages.get(li.data("messageId"));
            let test = message.getTest();
            return test.context.focusAllocated && message.isAuthor
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
            return hasFocusCounter && message.isAuthor           
        }

        let canReroll = li => {
            const message = game.messages.get(li.data("messageId"));
            let test = message.getTest();
            return !(test.context.rerolled || test.context.maximized) && message.isAuthor
        }

        let canMaximize = li => {
            const message = game.messages.get(li.data("messageId"));
            let test = message.getTest();
            return !(test.context.focusAllocated || test.context.rerolled || test.context.maximized) && message.isAuthor
        }

        let canApplyDamage = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && (message.getTest().result.damage || message.getTest().result.primary?.damage || message.getTest().result.secondary?.damage); //is damage roll
        };

        let canApplyCleave = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && (message.getTest().item?.traitList?.cleave || message.getTest().secondaryWeapon?.traitList?.cleave)
        };

        let canApplyBlast = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && (message.getTest().item?.traitList?.blast || message.getTest().secondaryWeapon?.traitList?.blast)
        };

        let canApplyRend = li => {
            const message = game.messages.get(li.data("messageId"));
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && (message.getTest().item?.traitList?.rend || message.getTest().secondaryWeapon?.traitList?.rend)
        };

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
                name: "CHAT.MAXIMIZE",
                icon: '<i class="fas fa-sort-numeric-up-alt"></i>',
                condition: canMaximize,
                callback: li => {
                    const message = game.messages.get(li.data("messageId"));
                    let test = message.getTest();

                    if (!game.user.isGM)
                        SoulboundCounter.changeCounter(-1, "soulfire")
                    test.maximize();
                }
            }
        );
        
        options.unshift(
            {
                name: "CHAT.REROLL",
                icon: '<i class="fas fa-dice"></i>',
                condition: canReroll,
                callback: li => {
                    const message = game.messages.get(li.data("messageId"));
                    let test = message.getTest();
                    new Reroller(test).render(true)
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

        
        options.unshift(
            {
                name: "CHAT.APPLY_FOCUS",
                icon: '<i class="fas fa-angle-double-up"></i>',
                condition: canApplyFocus,
                callback: li => {
                    const message = game.messages.get(li.data("messageId"));
                    let test = message.getTest();
                    test.allocateFocus(Array.from(li.find(".focus-counter")).sort((a, b) => parseInt(a.parentElement.dataset.index) - parseInt(b.parentElement.dataset.index)).map(i => parseInt(i.textContent) || 0))
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
                name: "CHAT.APPLY_BLAST_DAMAGE",
                icon: '<i class="fas fa-bomb"></i>',
                condition: canApplyBlast,
                callback: li => SoulboundChat.applyBlastDamage(li)
            }
        )
        

        options.push(
            {
                name: "CHAT.APPLY_REND_DAMAGE",
                icon: '<i class="fas fa-shield-alt"></i>',
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
    static async applyChatCardDamage(li, multiplier, options={}) {

        const message = game.messages.get(li.data("messageId"));
        let test = message.getTest();
        let damage
        let item

        if (test.result.primary?.damage && test.result.secondary?.damage) // If both primary and secondary, give choice
        {
            await new Promise((resolve) => {
                new Dialog({
                    title : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT_TITLE"),
                    content : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT"),
                    buttons : {
                        primary : {
                            label : game.i18n.localize("DIALOG.PRIMARY"),
                            callback : () => {
                                damage = test.result.primary.damage.total
                                item = test.item
                                resolve()
                            }
                        },
                        secondary : {
                            label : game.i18n.localize("DIALOG.SECONDARY"),
                            callback : () => {
                                damage = test.result.secondary.damage.total
                                item = test.secondaryWeapon
                                resolve()
                            }
                        }
                    }
    
                }).render(true)
            })
        }
        else if (test.result.primary?.damage) // If only primary
        {
            damage = test.result.primary.damage.total
            item = test.item
        }
        else if (test.result.secondary?.damage) // If only secondary
        {
            damage = test.result.secondary.damage.total
            item = test.secondaryWeapon
        }
        else  // If normal test
        {
            damage = test.result.damage.total
            item = test.item
        }

        damage *= multiplier;

        options.penetrating = test.item?.traitList?.penetrating ? 1 : 0
        options.ineffective = test.item?.traitList?.ineffective
        options.restraining = test.item?.traitList?.restraining

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
    static async applyCleaveDamage(li) {    
        const message = game.messages.get(li.data("messageId"));
        let test = message.getTest();
        let result
        let item

        if ((test.item?.traitList.cleave && test.result.primary.triggers) && (test.secondaryWeapon?.traitList.cleave && test.result.secondary.triggers)) // If both primary and secondary, give choice
        {
            await new Promise((resolve) => {
                new Dialog({
                    title : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT_TITLE"),
                    content : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT"),
                    buttons : {
                        primary : {
                            label : game.i18n.localize("DIALOG.PRIMARY"),
                            callback : () => {
                                result = test.result.primary
                                item = test.item
                                resolve()
                            }
                        },
                        secondary : {
                            label : game.i18n.localize("DIALOG.SECONDARY"),
                            callback : () => {
                                result = test.result.secondary
                                item = test.secondaryWeapon
                                resolve()
                            }
                        }
                    }
    
                }).render(true)
            })
        }
        else if (test.item?.traitList.cleave && test.result.primary.triggers) // If only primary
        {
            result = test.result.primary
            item = test.item
        }
        else if (test.secondaryWeapon?.traitList.cleave && test.result.secondary.triggers) // If only secondary
        {
            result = test.result.secondary
            item = test.secondaryWeapon
        }
        else  // If normal test
        {
            result = test.result
            item = test.item
        }

        let damage = result.triggers
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
    static async applyBlastDamage(li) {    
        const message = game.messages.get(li.data("messageId"));
        let test = message.getTest();

        let item

        if (test.item?.traitList?.blast?.rating && test.secondaryWeapon?.traitList?.blast?.rating) // If both primary and secondary, give choice
        {
            await new Promise((resolve) => {
                new Dialog({
                    title : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT_TITLE"),
                    content : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT"),
                    buttons : {
                        primary : {
                            label : game.i18n.localize("DIALOG.PRIMARY"),
                            callback : () => {
                                item = test.item
                                resolve()
                            }
                        },
                        secondary : {
                            label : game.i18n.localize("DIALOG.SECONDARY"),
                            callback : () => {
                                item = test.secondaryWeapon
                                resolve()
                            }
                        }
                    }
    
                }).render(true)
            })
        }
        else if (test.item?.traitList?.blast?.rating) // If only primary
        {
            item = test.item
        }
        else if (test.secondaryWeapon?.traitList?.blast?.rating) // If only secondary
        {
            item = test.secondaryWeapon
        }
        else  // If normal test
        {
            item = test.item
        }

        let damage = item.traitList.blast.rating
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
    static async applyRend(li) {    
        const message = game.messages.get(li.data("messageId"));
        let test = message.getTest();

        let result
        let item

        if ((test.item?.traitList.rend && test.result.primary.triggers) && (test.secondaryWeapon?.traitList.rend && test.result.secondary.triggers)) // If both primary and secondary, give choice
        {
            await new Promise((resolve) => {
                new Dialog({
                    title : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT_TITLE"),
                    content : game.i18n.localize("DIALOG.PRIMARY_SECONDARY_SELECT"),
                    buttons : {
                        primary : {
                            label : game.i18n.localize("DIALOG.PRIMARY"),
                            callback : () => {
                                result = test.result.primary
                                item = test.item
                                resolve()
                            }
                        },
                        secondary : {
                            label : game.i18n.localize("DIALOG.SECONDARY"),
                            callback : () => {
                                result = test.result.secondary
                                item = test.secondaryWeapon
                                resolve()
                            }
                        }
                    }
    
                }).render(true)
            })
        }
        else if (test.item?.traitList.rend && test.result.primary.triggers) // If only primary
        {
            result = test.result.primary
            item = test.item
        }
        else if (test.secondaryWeapon?.traitList.rend && test.result.secondary.triggers) // If only secondary
        {
            result = test.result.secondary
            item = test.secondaryWeapon
        }
        else  // If normal test
        {
            result = test.result
            item = test.item
        }


        let damage = result.triggers
        // apply to any selected actors
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.applyRend(damage, {magicWeapon : item?.traitList?.magical});
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
        
        if (msg.isAuthor)
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
        let itemTest = test.itemTest
        if (ev.currentTarget.dataset.source == "secondary")
            itemTest = test.secondaryItemTest

        let [difficulty, complexity] = itemTest.dn.split(":").map(i=> parseInt(i))
        let chatTest
        if (canvas.tokens.controlled.length)
        {
            for (let t of canvas.tokens.controlled)
            {
                if (test.itemTest.skill)
                    chatTest = await t.actor.setupSkillTest(test.itemTest.skill, test.itemTest.attribute, {difficulty, complexity})            
                else 
                    chatTest = await t.actor.setupAttributeTest(test.itemTest.attribute, {difficulty, complexity})  
                    
                await chatTest.rollTest()
                chatTest.sendToChat()     
            }
        }
        else if (game.user.character)
        {
            if (test.itemTest.skill)
                chatTest = await game.user.character.setupSkillTest(test.itemTest.skill, test.itemTest.attribute, {difficulty, complexity})            
            else 
                chatTest = await game.user.character.setupAttributeTest(test.itemTest.attribute, {difficulty, complexity})       
                
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
            ChatMessage.create({content : `<b>${roll.total}</b>: ${results[0].data.text}`, flavor : `The Price of Failure (${formula})`, speaker : test.speakerData, roll, type : CONST.CHAT_MESSAGE_TYPES.ROLL})
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
        if (ev.currentTarget.dataset.source == "secondary")
            item = test.secondaryWeapon

        let effect = item.effects.get(effectId).toObject()
        effect.origin = test.actor.uuid
        let duration = item.duration
        setProperty(effect, "flags.core.statusId", getProperty(effect, "flags.core.statusId") || effect.label.slugify())

        if (duration)
        {
            if (duration.unit == "round")
                effect.duration.rounds = parseInt(duration.value)
            else if  (duration.unit == "minute")
                effect.duration.seconds = parseInt(duration.value) * 60
            else if (duration.unit == "hour")
                effect.duration.seconds = parseInt(duration.value) * 60 * 60
            else if (duration.unit == "day")
                effect.duration.seconds = parseInt(duration.value) * 60 * 60 * 24
        }

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


