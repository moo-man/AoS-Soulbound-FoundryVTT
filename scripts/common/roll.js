export async function customRoll(pool, dn) {
    let origRoll = _roll(pool, dn);
    await _sendToChat(origRoll, _applyFocus(origRoll, dn, 0), dn, 0, null, null, false);
}

export async function commonRoll(attribute, skill, bonusDice, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);

    await _sendToChat(origRoll, result, dn, skill.focus, null, null, false);
}

export async function combatRoll(attribute, skill, bonusDice, combat, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);
    let weapon = _getWeapon(combat.weapon);
    let damage = {
        total : 0,
        armour: combat.armour 
    }
    if (weapon.addSuccess) {
        damage.total = weapon.damage + result.total - combat.armour;

    } else {
        damage.total = weapon.damage - combat.armour;
    }
    
    if(damage.total < 0) {
        damage.total = 0;
    }
    await _sendToChat(origRoll, result, dn, skill.focus, damage, weapon.traits, true);
}

export async function powerRoll(attribute, skill, bonusDice, power, dn) {
    const numberOfDice = attribute.total + skill.total + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);
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
    await _sendSpellToChat(origRoll, result, dn, skill.focus, duration, overcast, effect, resist);
}

function _roll(numberOfDice, dn) {
    let roll = new Roll("@dp d6cs>=@difficulty", {dp: numberOfDice, difficulty: dn.difficulty});    
    return roll.evaluate();
}

function _getSortedDiceFromRoll(roll) {
    return roll.terms
                .flatMap(term => term.results)
                .map(die => die.result)
                .sort((a, b) => b - a);
}

function _applyFocus(roll, dn, focus) {
    let retVal = 
    {
        total : roll.total,
        dice : []
    }
    // Sorted to effiencently apply success not filtered since we would need 
    // to make another function to highlight dice in chat 
    let sorted = _getSortedDiceFromRoll(roll);
    let newTotal = roll.total;    
    for(let i = 0; i < sorted.length; i++) {
        let die = {
            value : sorted[i],
            highlight : false
        }
        // focus is 0 or result is successes only add dice for display purposes
        if(die.value >= dn.difficulty || focus === 0) {
            retVal.dice.push(die);
            continue;
        }        
        //apply fokus reduce until zero or success
        while(focus > 0 && die.value < dn.difficulty) {
            die.value++;
            focus--;
        }
        // check if use of fokus gave us a new success and add it to the total
        if(die.value >= dn.difficulty) {            
            newTotal++;
        }        
        // we added fokus so highlight the die and push it to the result array
        die.highlight = true;
        retVal.dice.push(die);
    }            

    retVal.total = newTotal;
    
    return retVal;
}

async function _sendSpellToChat(origRoll, result, dn, focus, duration, overcast, effect, resist) {
    const render_data = {
        hasSucceed: result.total >= dn.complexity,
        success: result.total - dn.complexity, // show additional degrees instead of raw success
        missing: dn.complexity - result.total,
        failed: result.dice.length - result.total,
        dices: result.dice,
        dn: dn,
        focus: `${focus} ${game.i18n.localize("CHAT.FOCUS_APPLIED")}`,
		effect: effect,
		resist: resist,
        duration: duration,
        overcast: overcast
    };
    await _createChatMessage("systems/age-of-sigmar-soulbound/template/chat/spellRoll.html", render_data, origRoll);

}

async function _sendToChat(origRoll, result, dn, focus, damage, traits, isCombat) { 
    const render_data = {
        hasSucceed: result.total >= dn.complexity,
        success: isCombat ? result.total : result.total - dn.complexity,
        missing: dn.complexity - result.total,
        failed: result.dice.length - result.total,
        dices: result.dice,
        dn: dn,
        focus:  `${focus} ${game.i18n.localize("CHAT.FOCUS_APPLIED")}`,
        damage: isCombat ? `${damage.total} ${game.i18n.localize("CHAT.ARMOUR_SUBTRACTED")} ${damage.armour}`: 0,
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