/**
 * Extends the Option to apply damage to targeted Enemy directly
 * @param {HTMLElement} html 
 * @param {Array} options 
 * @returns 
 */

export const addChatMessageContextOptions = function (html, options) {
    let canApply = li => {
        const message = game.messages.get(li.data("messageId"));
        return message.isRoll && message.isContentVisible && game.user.targets.size;
    };
    options.push(
        {
            name: game.i18n.localize("CHAT.APPLY_DAMAGE"),
            icon: '<i class="fas fa-user-minus"></i>',
            condition: canApply,
            callback: li => applyChatCardDamage(li)
        }
    );
    return options;
};

/**
 * @param {HTMLElement} messsage    The chat entry which contains the roll data
 * @return {Promise}
 */
function applyChatCardDamage(message) {    

    let targets = Array.from(game.user.targets);
    let el = message.find('.damage-value');
    let regex = /\d/;
    let damage = parseInt($(el[0]).text().match(regex));
    // apply to any selected actors
    return Promise.all(targets.map(t => {
        const a = t.actor;
        return a.applyDamage(damage);
    }));
}