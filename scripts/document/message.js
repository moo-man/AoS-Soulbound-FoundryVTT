
export class SoulboundChatMessage extends WarhammerChatMessage 
{
    static addTestContextOptions(options)
    {
        let canResetFocus = li => {
            const message = game.messages.get(li.dataset.messageId);
            let test = message.system.test;
            return test && test.context.focusAllocated && message.isAuthor
        }


        let canReroll = li => {
            const message = game.messages.get(li.dataset.messageId);
            let test = message.system.test;
            return game.user.isGM && li.querySelector(".selected") && test && !(test.context.rerolled || test.context.maximized) && message.isAuthor
        }

        let canRerollSelected = li => {
            const message = game.messages.get(li.dataset.messageId);
            let test = message.system.test;
            return li.querySelector(".selected") && test && !(test.context.rerolled || test.context.maximized) && message.isAuthor
        }

        let canMaximize = li => {
            const message = game.messages.get(li.dataset.messageId);
            let test = message.system.test;
            return test && !(test.context.focusAllocated || test.context.rerolled || test.context.maximized) && message.isAuthor
        }

        let canApplyHealing = li => {
            const message = game.messages.get(li.dataset.messageId);
            let test = message.system.test
            return message.isRoll
                && message.isContentVisible //can be seen
                && canvas.tokens?.controlled.length //has something selected
                && test && (test.result.healing) //has healincg
        }

        options.unshift(
            {
                name: "CHAT.RESET_FOCUS",
                icon: '<i class="fas fa-redo"></i>',
                condition: canResetFocus,
                callback: async li => {
                    const message = game.messages.get(li.dataset.messageId);
                    let test = message.system.test;
                    await test.resetFocus();
                }
            }
        );


        options.unshift(
            {
                name: "CHAT.MAXIMIZE",
                icon: '<i class="fas fa-sort-numeric-up-alt"></i>',
                condition: canMaximize,
                callback: async li => {

                    if (game.counter.soulfire == 0)
                    {
                        return ui.notifications.error("ERROR.NotEnoughSoulfire", {localize : true})
                    }


                    const message = game.messages.get(li.dataset.messageId);
                    let test = message.system.test;

                    game.counter.constructor.changeCounter(-1, "soulfire")

                    await test.maximize();
                }
            }
        );
                
        options.unshift(
            {
                name: "CHAT.REROLL",
                icon: '<i class="fas fa-dice"></i>',
                condition: canReroll,
                callback: li => {
                    const message = game.messages.get(li.dataset.messageId);
                    let test = message.system.test;

                    let toReroll = Array.from(li.querySelectorAll(".die")).sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index)).map(i => i.classList.contains("selected"));
                    test.reroll(toReroll);
                }
            }
        );

        
        options.unshift(
            {
                name: "CHAT.REROLL_SELECTED",
                icon: '<i class="fas fa-dice"></i>',
                condition: canRerollSelected,
                callback: li => {
                    if (game.counter.soulfire == 0)
                    {
                        return ui.notifications.error("ERROR.NotEnoughSoulfire", {localize : true})
                    }
                    const message = game.messages.get(li.dataset.messageId);
                    let test = message.system.test;
                    game.counter.constructor.changeCounter(-1, "soulfire")

                    let toReroll = Array.from(li.querySelectorAll(".die")).sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index)).map(i => i.classList.contains("selected"));
                    test.reroll(toReroll);
                }
            }
        );

        options.push(
            {
                name: "CHAT.APPLY_HEALING",
                icon: '<i class="fas fa-plus"></i>',
                condition: canApplyHealing,
                callback: li => SoulboundChat.applyChatCardHealing(li, 1)
            }
        );
    
        return options;
    };
}