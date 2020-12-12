export async function customRoll(pool, dn) {
    let result = _roll(pool, dn);
    await _sendToChat(result, dn, 0, null, null, null);
}

export async function commonRoll(attribute, skill, dn) {
    const numberOfDice = attribute.total + skill.total;
    let result = _roll(numberOfDice, dn);
    await _sendToChat(result, dn, skill.focus, null, null, null);
}

export async function combatRoll(attribute, skill, combat, dn) {
    const numberOfDice = attribute.total + skill.total;
    let result = _roll(numberOfDice, dn);
    let weapon = _getWeapon(combat.weapon);
    let damage;
    if (weapon.addSuccess) {
        damage = weapon.damage + result.success.length - combat.armour;
    } else {
        damage = weapon.damage - combat.armour;
    }
    await _sendToChat(result, dn, skill.focus, damage, weapon.traits, null);
}

export async function powerRoll(attribute, skill, power, dn) {
    const numberOfDice = attribute.total + skill.total;
    let result = _roll(numberOfDice, dn);
    let overcast;
    if (power.type === "spell") {
        overcast = power.data.data.overcast;
    } else {
        overcast = null
    }
    await _sendToChat(result, dn, skill.focus, null, null, overcast);
}

function _roll(numberOfDice, dn) {
    let die = new Die({ faces: 6, number: numberOfDice});
    die.evaluate();
    let result = {
        success: [],
        failed: []
    }
    die.results.forEach((roll) => {
        if (roll.result >= dn.difficulty) {
            result.success.push(roll.result);
        } else {
            result.failed.push(roll.result);
        }
    });
    return result;
}

async function _sendToChat(result, dn, focus, damage, traits, overcast) {
    const dices = result.success.concat(result.failed);
    const data = {
        hasSucceed: result.success.length >= dn.complexity,
        success: result.success.length,
        missing: dn.complexity - result.success.length,
        failed: result.failed.length,
        dices: dices.sort(function (a, b) { return b - a; }),
        dn: dn,
        focus: focus,
        damage: damage,
        traits: traits,
        overcast: overcast
    };
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/chat/roll.html", data);
    let chatData = {
        user: game.user._id,
        rollMode: game.settings.get("core", "rollMode"),
        content: html,
    };
    if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
        chatData.whisper = ChatMessage.getWhisperRecipients("GM");
    } else if (chatData.rollMode === "selfroll") {
        chatData.whisper = [game.user];
    }
    ChatMessage.create(chatData);
}

function _getWeapon(weapon) {
    let regex = /([0-9]*)[+]*(s*)/g;
    let weaponDamage = weapon.damage.toLowerCase().replace(/( )*/g, '');
    let regexMatch = regex.exec(weaponDamage);
    return {
        name: weapon.name,
        damage: (+regexMatch[1]) ? +regexMatch[1] : 0,
        addSuccess: !!(regexMatch[2]),
        traits: weapon.traits
    };
}