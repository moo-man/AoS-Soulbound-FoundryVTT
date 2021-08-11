export async function customRoll(pool, dn) {
    let origRoll = _roll(pool, dn);
    await _sendToChat(origRoll, _applyFocus(origRoll, dn, 0), dn, 0, null, null, false);
}

export async function commonRoll(attribute, skill, bonusDice, dn, allocation) {
    const numberOfDice = attribute.total + skill.roll + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus, allocation);

    await _sendToChat(origRoll, result, dn, skill.focus, null, null, false);
}
export async function combatRoll(attribute, skill, bonusDice, combat, dn, allocation) {
    const numberOfDice = attribute.total + skill.roll + bonusDice + combat.swarmDice;
    let weapon = _getWeapon(combat.weapon);
    let traits = weapon.traits.toLowerCase();
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus, allocation);
    
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

export async function powerRoll(attribute, skill, bonusDice, power, dn, allocation) {
    const numberOfDice = attribute.total + skill.roll + bonusDice;
    let origRoll = _roll(numberOfDice, dn);
    let result = _applyFocus(origRoll, dn, skill.focus, allocation);
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

function _applyFocus(roll, dn, focus, mode) {
    let retVal = 
    {
        total : roll.total,
        dice : []
    }
    // Sorted to effiencently apply success not filtered since we would need 
    // to make another function to highlight dice in chat 
    let sorted = _getSortedDiceFromRoll(roll);
    let newTotal = roll.total;
    let triggered = false; 
    let f = focus;
    for(let i = 0; i < sorted.length; i++) {
        let die = {
            value : sorted[i],
            highlight : false,
            success: false
        }

        if (mode == "success") {
            if (die.value >= dn.difficulty) {
                die.success = true;
            }
            else {
                if (f >= dn.difficulty - die.value) {
                    f -= (dn.difficulty - die.value);
                    die.value += (dn.difficulty - die.value);
                    die.success = true;
                    newTotal++;
                    die.highlight = true;
                }
            }
            retVal.dice.push(die);
            continue;
        }

        if (mode == "sixes") {
            if (die.value >= dn.difficulty) {
                die.success = true;
                console.log("was successful, checking for sixes now");
            }
            if (die.value < 6) {
                console.log(die.value + " is smaller than six");
                if (f >= dn.difficulty - die.value && die.success == false) {
                    console.log(f + " still have focus to push to DN");
                    f -= (dn.difficulty - die.value);
                    die.value += (dn.difficulty - die.value);
                    if (die.success == false) {
                        console.log("pushed to DN, focus remaining: " + f);
                        die.success = true;
                        newTotal++;
                    }   
                    die.highlight = true;
                }
                if (f >= 6 - die.value) {
                    console.log(f + " still have focus to push to 6");
                    f -= (6 - die.value);
                    die.value += (6 - die.value);
                    die.highlight = true;
                    console.log("promoted to 6, focus remaining: " + f)
                }
            }
            retVal.dice.push(die);
            continue;
        }

        if (mode == "trigger") {
            if (die.value >= dn.difficulty) {
                die.success = true;
                console.log("was successful, triggered: " + die.value);
                if (die.value >= 6) {
                    triggered = true;
                    console.log("ding!");
                }
                console.log("triggered: " + triggered);
            }
            if (triggered == false) {
                console.log("wasn't triggered so check for sixes");
                if (die.value < 6) {
                    console.log(die.value +" is smaller than six");
                    if (f >= dn.difficulty - die.value && die.success == false) {
                        console.log(f + " still have focus to push to DN");
                        f -= (dn.difficulty - die.value);
                        die.value += (dn.difficulty - die.value);
                        if (die.success == false) {
                            console.log("pushed to DN, focus remaining: " + f);
                            die.success = true;
                            newTotal++;
                        }   
                        die.highlight = true;
                    }
                    if (f >= 6 - die.value) {
                        console.log(f + " still have focus to push to 6");
                        f -= (6 - die.value);
                        die.value += (6 - die.value);
                        die.highlight = true;
                        console.log("promoted to 6, focus remaining: " + f);
                    }
                }
            }
            else {
                console.log("has already been triggered so just go for DN")
                if (f >= dn.difficulty - die.value && die.success == false) {
                    console.log(f +" focus remain, push to DN");
                    f -= (dn.difficulty - die.value);
                    die.value += (dn.difficulty - die.value);
                    if (die.success == false) {
                        die.success = true;
                        newTotal++;
                    }
                    die.highlight = true;
                }
            }
            retVal.dice.push(die);
            continue;
        }

        if (mode == "manual") {
            if (die.value >= dn.difficulty) {
                die.success = true;
                newTotal++;
            }
            retVal.dice.push(die);
            continue;
        }

        /* ===== The Original Code =====
        // focus is 0 or result is successes only add dice for display purposes
        if(die.value >= dn.difficulty || focus === 0) {
            //need to know if this was actually a success for the visuals
            if(die.value >= dn.difficulty)
            {
                die.success = true;
            }
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
            die.success = true;
        }        
        // we added fokus so highlight the die and push it to the result array
        die.highlight = true;
        retVal.dice.push(die);
        */
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