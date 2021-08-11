export async function customRoll(pool, dn) {
    let origRoll = _roll(pool, dn);
    await _sendToChat(origRoll, _applyFocus(origRoll, dn, 0), dn, 0, null, null, false);
}

export async function commonRoll(attribute, skill, bonusDice, dn) {
    const numberOfDice = attribute.total + skill.roll + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);

    await _sendToChat(origRoll, result, dn, skill.focus, null, null, false);
}
export async function combatRoll(attribute, skill, bonusDice, combat, dn) {
    const numberOfDice = attribute.total + skill.roll + bonusDice + combat.swarmDice;
    let weapon = _getWeapon(combat.weapon);
    let traits = weapon.traits.toLowerCase();
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);
    
    let damage = {
        total : 0,
        armour: combat.armour,
        traitEffects : [] 
    }

    let effect = null;

    if(traits.includes(game.i18n.localize("TRAIT.INEFFECTIVE"))) {
        effect = _createTraitEffect();
        effect.isPlain = true;
        effect.text = game.i18n.localize("TRAIT.INEFFECTIVE_EFFECT");
        damage.traitEffects.push(effect);
        damage.armour *= 2;
    }

    if(damage.armour > 0 && traits.includes(game.i18n.localize("TRAIT.PENETRATING"))) {
        effect = _createTraitEffect();
        effect.isPlain = true;
        effect.text = game.i18n.localize("TRAIT.PENETRATING_EFFECT");
        damage.traitEffects.push(effect);
        damage.armour -= 1;        
    }

    //On these two we may want to get more 6s if possible after we can't get more successes and have focus left over
    //No idea how to implement that yet may need to refactor _applyFocus a lot for that.
    if(traits.includes(game.i18n.localize("TRAIT.CLEAVE"))) {
        effect = _createTraitEffect();
        effect.isCleave = true;
        effect.text = game.i18n.format("TRAIT.CLEAVE_EFFECT", {triggers : result.triggers});
        damage.traitEffects.push(effect);
    }

    if(traits.includes(game.i18n.localize("TRAIT.REND"))) {
        effect = _createTraitEffect();
        effect.isRend = true,
        effect.text = game.i18n.format("TRAIT.REND_EFFECT", {triggers : result.triggers});
        damage.traitEffects.push(effect);
    }

    if (weapon.addSuccess) {
        damage.total = weapon.damage + result.total - damage.armour;
    } else {
        damage.total = weapon.damage - damage.armour;
    }
    
    if(damage.total < 0) {
        damage.total = 0;
    }
    await _sendToChat(origRoll, result, dn, skill.focus, damage, weapon.traits, true);
}

export async function powerRoll(attribute, skill, bonusDice, power, dn) {
    const numberOfDice = attribute.total + skill.roll + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus);
	let effect = power.effect;
	let resist = null;
	let overcast = null;
	let duration = null;
    if (power.type === "spell") {
        overcast = power.overcast;
		duration = power.duration;
		resist = power.test;
		let complexity = result.total - dn.complexity + 1 // complexity of spelltest is 1 + successes Core p.266 
		if(resist !== null && complexity > 0) {
			resist = resist.replace(/:s/ig, ":" + complexity);
		}
	}
    await _sendSpellToChat(origRoll, result, dn, skill.focus, duration, overcast, effect, resist);
}

function _roll(numberOfDice, dn) {
    let roll = new Roll(`${numberOfDice}d6cs>=${dn.difficulty}`);    
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
        triggers : 0,
        dice : []
    }
    // Sorted to efficiently apply focus not filtered since we would need 
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
    retVal.triggers = retVal.dice.filter(die => die.value === 6).length
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
        traits: traits,
        traitEffects: damage !== null ? damage.traitEffects : null
    };
    await _createChatMessage("systems/age-of-sigmar-soulbound/template/chat/roll.html", render_data, origRoll);
}

async function _createChatMessage(templateFile, render_data, roll) {
    const html = await renderTemplate(templateFile, render_data);
    let chatData = {
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
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

function _createTraitEffect() {
    return {
        isRend: false,
        isCleave: false,
        isPlain: false,
        text:  ""
    };
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