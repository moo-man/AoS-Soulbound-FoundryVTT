export async function customRoll(pool, dn) {
    let result = _roll(pool, dn);
    await _sendToChat(result, { result : result, highlights : []}, dn, 0, null, null, false);
}

export async function commonRoll(attribute, skill, bonusDice, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let result = _roll(numberOfDice, dn);
    let afterFocus = _applyFocus(result, dn, skill.focus);

    await _sendToChat(result, afterFocus, dn, skill.focus, null, null, false);
}

export async function combatRoll(attribute, skill, bonusDice, combat, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let result = _roll(numberOfDice, dn);
    let afterFocus = _applyFocus(result, dn, skill.focus);
    let weapon = _getWeapon(combat.weapon);
    let damage;
    if (weapon.addSuccess) {
        damage = weapon.damage + result.total - combat.armour;
    } else {
        damage = weapon.damage - combat.armour;
    }
    
    if(damage < 0) {
        damage = 0;
    }
    await _sendToChat(result, afterFocus, dn, skill.focus, damage, weapon.traits, true);
}

export async function powerRoll(attribute, skill, bonusDice, power, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let result = _roll(numberOfDice, dn);
    let afterFocus = _applyFocus(result, dn, skill.focus);
	let effect = power.data.data.effect;
	let resist = null;
	let overcast = null;
	let duration = null;
    if (power.type === "spell") {
        overcast = power.data.data.overcast;
		duration = power.data.data.duration;
		resist = power.data.data.test;
		let complexity = result.total - dn.complexity + 1 // complexity of spelltest is 1 + successes Core p.266 
		if(resist !== null && complexity > 0) {
			resist = resist.replace(/:s/ig, ":" + complexity);
		}
	}
    await _sendSpellToChat(result, afterFocus, dn, skill.focus, duration, overcast, effect, resist);
}

function _roll(numberOfDice, dn) {
    let roll = new Roll("@dp d6cs>=@difficulty", {dp: numberOfDice, difficulty: dn.difficulty});    
    return roll.evaluate();
}

function _getDiceFromRoll(roll, toHighlight) {
    let results = roll.terms.flatMap(term => term.results).map(die => die.result);
    let dice = new Array(results.length);
    for(var i=0; i < results.length; i++) {
        dice[i] = { value : results[i], highlight : toHighlight.includes(i) };
    }
    return dice;
}

function _applyFocus(roll, dn, focus) {
    let retVal = 
    {
        result: roll,
        highlights : []
    }

    if(focus === 0) {
        return retVal;
    }
    let diceToHighlight = new Array();
    let newTotal = roll.total;

    //Rolls are immutable so get a DataObject to make changes to
    let current = roll.toJSON();
    for(let element of current.terms) {
        //sort from highest to lowest to use focus efficently
        let sorted = element.results.sort((a, b) => b.result - a.result);
        for(var i = 0; i < sorted.length; i++) {
            var die = sorted[i];
            // ignore successes
            if(die.result >= dn.difficulty) {
                continue;
            }
            
            while(focus > 0 && die.result < dn.difficulty) {
                die.result++;
                focus--;
            }

            // check if use of fokus gave us a new success and add it
            if(die.result >= dn.difficulty) {
                die.success = true;
                die.count = 1;
                newTotal++;
            }

            diceToHighlight.push(i);

            if(focus === 0) {
                break;
            }
        }        
    }
    current.total = newTotal;

    retVal.result = Roll.fromData(current);
    retVal.highlights = diceToHighlight;
    
    return retVal;
}

async function _sendSpellToChat(origRoll, afterFocus, dn, focus, duration, overcast, effect, resist) {
    let result = afterFocus.result;
    const dices = _getDiceFromRoll(result, afterFocus.highlights);
    const render_data = {
        hasSucceed: result.total >= dn.complexity,
        success: result.total - dn.complexity, // show additional degrees instead of raw success
        missing: dn.complexity - result.total,
        failed: dices.length - result.total,
        dices: dices,
        dn: dn,
        focus: focus + game.i18n.localize("CHAT.FOCUS_APPLIED"),
		effect: effect,
		resist: resist,
        duration: duration,
        overcast: overcast
    };
    await _createChatMessage("systems/age-of-sigmar-soulbound/template/chat/spellRoll.html", render_data, origRoll);

}

async function _sendToChat(origRoll, afterFocus, dn, focus, damage, traits, isCombat) {
    let result = afterFocus.result;
    const dices = _getDiceFromRoll(result, afterFocus.highlights);    
    const render_data = {
        hasSucceed: result.total >= dn.complexity,
        success: isCombat ? result.total : result.total - dn.complexity,
        missing: dn.complexity - result.total,
        failed: dices.length - result.total,
        dices: dices,
        dn: dn,
        focus:  focus + game.i18n.localize("CHAT.FOCUS_APPLIED"),
        damage: damage,
        traits: traits
    };
    await _createChatMessage("systems/age-of-sigmar-soulbound/template/chat/roll.html", render_data, origRoll);
}

async function _createChatMessage(templateFile, render_data, roll) {
    const html = await renderTemplate(templateFile, render_data);
    let chatData = {
        user: game.user._id,
        type: CHAT_MESSAGE_TYPES.ROLL,
        roll: roll,
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