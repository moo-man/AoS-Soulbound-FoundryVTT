/**
 * Extends the Option to apply damage to targeted Enemy directly
 * @param {HTMLElement} html 
 * @param {Array} options 
 * @returns 
 */

export const addChatMessageContextOptions = function (html, options) {
    let canApply = li => {
        const message = game.messages.get(li.data("messageId"));
        return message.isRoll
            && message.isContentVisible //can be seen
            && canvas.tokens?.controlled.length //has something selected
            && li.find('.damage-value').length; //is damage roll
    };
    options.push(
        {
            name: game.i18n.localize("CHAT.APPLY_DAMAGE"),
            icon: '<i class="fas fa-user-minus"/>',
            condition: canApply,
            callback: li => applyChatCardDamage(li, 1)
        }
    );
	options.push(
		{
            name: game.i18n.localize("CHAT.APPLY_DOUBLE_DAMAGE"),
            icon: '<i class="fas fa-user-minus"/>',
            condition: canApply,
            callback: li => applyChatCardDamage(li, 2)
		}
	);

    canApply = li => {
        const message = game.messages.get(li.data("messageId"));
        return message.isRoll
            && message.isContentVisible //can be seen
            && canvas.tokens?.controlled.length //has something selected
            && li.find('.cleave-value').length; //has cleave effect
    };
    options.push(
        {
            name: game.i18n.localize("CHAT.APPLY_CLEAVE_DAMAGE"),
            icon: '<i class="fas fa-user-minus"/>',
            condition: canApply,
            callback: li => applyCleaveDamage(li)
        }
    )
    
    canApply = li => {
        const message = game.messages.get(li.data("messageId"));
        return message.isRoll
            && message.isContentVisible //can be seen
            && canvas.tokens?.controlled.length //has something selected
            && li.find('.rend-value').length; //has rend effect
    };
    options.push(
        {
            name: game.i18n.localize("CHAT.APPLY_REND_DAMAGE"),
            icon: '<i class="fas fa-user-minus"/>',
            condition: canApply,
            callback: li => applyRend(li)
        }
    )

    return options;
};

/**
 * @param {HTMLElement} messsage    The chat entry which contains the roll data
 * @return {Promise}
 */
function applyChatCardDamage(message, multiplier) {
    let damage = extractChatCardNumber(message, ".damage-value");
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
 function applyCleaveDamage(message) {    
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
 function applyRend(message) {    
    let damage = extractChatCardNumber(message, ".rend-value");
    // apply to any selected actors
    return Promise.all(canvas.tokens.controlled.map(t => {
        const a = t.actor;
        return a.applyRend(damage);
    }));
}

function extractChatCardNumber(message, id) {
    let el = message.find(id);
    let regex = /\d+/;
    return parseInt($(el[0]).text().match(regex));
}