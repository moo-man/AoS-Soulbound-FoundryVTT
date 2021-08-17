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
            && message.getTest().result.damage; //is damage roll
    };
    options.push(
        {
            name: "CHAT.APPLY_DAMAGE",
            icon: '<i class="fas fa-user-minus"></i>',
            condition: canApply,
            callback: li => applyChatCardDamage(li, 1)
        }
    );
	options.push(
		{
            name: "CHAT.APPLY_DOUBLE_DAMAGE",
            icon: '<i class="fas fa-user-minus"></i>',
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
            name: "CHAT.APPLY_CLEAVE_DAMAGE",
            icon: '<i class="fas fa-user-minus"></i>',
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
            name: "CHAT.APPLY_REND_DAMAGE",
            icon: '<i class="fas fa-user-minus"></i>',
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
function applyChatCardDamage(li, multiplier) {
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