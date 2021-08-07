import { customRoll, commonRoll, combatRoll, powerRoll } from "./roll.js";

export async function prepareCustomRoll() {
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/custom-roll.html", {});
    let dialog = new Dialog({
        title: game.i18n.localize("DIALOG.CUSTOM_ROLL"),
        content: html,
        buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("BUTTON.ROLL"),
                callback: async (html) => {
                    const pool = html.find("#pool")[0].value;
                    const dn = _getDn(game.i18n.localize("DIALOG.CUSTOM_ROLL"), html.find("#dn")[0].value);
                    await customRoll(pool, dn);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("BUTTON.CANCEL"),
                callback: () => {},
            },
        },
        default: "roll",
        close: () => {},
    });
    dialog.render(true);
}

                                    // Dislike the funky order here, TODO convert first argument into object?
export async function prepareCommonRoll(skillKey, attributes, skills, attributeKey = null) {
    let data = {
        attributes,
        skills,
        skillKey,
        attributeKey : skillKey ? skills[skillKey].attribute : attributeKey,
        bonusDice : 0 // some spells or miracles grant bonus dice 
    }
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/common-roll.html", data);
    let dialog = new Dialog({
        title: game.i18n.localize("DIALOG.COMMON_ROLL"),
        content: html,
        buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("BUTTON.ROLL"),
                callback: async (html) => {
                    const attributeName = html.find("#attribute")[0].value;
                    const skillName = html.find("#skill")[0].value;
                    const doubleTraining = html.find("#double-training")[0].checked;
                    const doubleFocus = html.find("#double-focus")[0].checked;
                    const attribute = attributes[attributeName];
                    let skill = skills[skillName];
                    const dn = _getDn(`${game.i18n.localize(attribute.label)} (${game.i18n.localize(skill.label)})`, html.find("#dn")[0].value);
                    if (doubleTraining) skill.total = skill.total * 2;
                    if (doubleFocus) skill.focus = skill.focus * 2;
                    let bonusDice = _getBonusDice(html);
                    await commonRoll(attribute, skill, bonusDice, dn);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("BUTTON.CANCEL"),
                callback: () => {},
            },
        },
        default: "roll",
        close: () => {},
    });
    dialog.render(true);
}



export async function prepareCombatRoll(attributes, skills, combat) {
    const target = game.user.targets.values().next().value;
    const hasTarget = target !== undefined; // No additinal Input when target function is used
    let targetDefense = 3; // good defense seems to be the most likely starting point
    let attackRating = combat.weapon.category === "melee" ? combat.melee : combat.accuracy
    combat.armour = 0;
    
    if (hasTarget) {
        targetDefense = target.actor.combat.defense.relative;
        combat.armour = target.actor.combat.armour.total;
    } 
    
    let data = {
        attributes: attributes,
        skills: skills,
        bonusDice : 0, // some spells or miracles grant bonus dice 
        combat,
        targetDefense,
        attackRating
    }
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/combat-roll.html", data);
    let dialog = new Dialog({
        title: combat.weapon.name,
        content: html,
        buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("BUTTON.ROLL"),
                callback: async (html) => {
                    const attributeName = html.find("#attribute")[0].value;
                    const skillName = html.find("#skill")[0].value;
                    const doubleTraining = html.find("#double-training")[0].checked;
                    const doubleFocus = html.find("#double-focus")[0].checked;
                    const attribute = attributes[attributeName];
                    const rating = html.find("#attack")[0].value;
                    let skill = skills[skillName];                    
                    targetDefense = html.find("#defense")[0].value;
                    combat.armour = html.find("#armour")[0].value;
                    const dn = _getDn(combat.weapon.name, _getCombatDn(rating, targetDefense));
                    if (doubleTraining) skill.total = skill.total * 2;
                    if (doubleFocus) skill.focus = skill.focus * 2;
                    const bonusDice = _getBonusDice(html)
                    await combatRoll(attribute, skill, bonusDice , combat, dn);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("BUTTON.CANCEL"),
                callback: () => {},
            },
        },
        default: "roll",
        close: () => {},
    });
    dialog.render(true);
}

export async function preparePowerRoll(skillKey, attributes, skills, power) {
    let  dn = power.dn;
    
    let data = {
        attributes: attributes,
        skills: skills,
        skillKey,
        attributeKey : skills[skillKey].attribute,
        dn: dn,
        bonusDice : 0 // some spells or miracles grant bonus dice 
    }
    
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/spell-roll.html", data);
    let dialog = new Dialog({
        title: power.data.name,
        content: html,
        buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("BUTTON.ROLL"),
                callback: async (html) => {
                    const attributeName = html.find("#attribute")[0].value;
                    const skillName = html.find("#skill")[0].value;
                    const doubleTraining = html.find("#double-training")[0].checked;
                    const doubleFocus = html.find("#double-focus")[0].checked;
                    const attribute = attributes[attributeName];
                    let skill = skills[skillName];
                    const dn = _getDn(power.data.name, html.find("#dn")[0].value);
                    if (doubleTraining) skill.total = skill.total * 2;
                    if (doubleFocus) skill.focus = skill.focus * 2;
                    const bonusDice = _getBonusDice(html)
                    await powerRoll(attribute, skill, bonusDice, power, dn);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("BUTTON.CANCEL"),
                callback: () => {},
            },
        },
        default: "roll",
        close: () => {},
    });
    dialog.render(true);
}

function _getBonusDice(html) {
    let bonusDice = html.find("#bonusDice")[0].value;
    return parseInt(bonusDice, 10);
}

function _getDn(name, dn) {
    let regex = /([0-9]*)[:]*([0-9]*)/g;
    let spellDn = dn.toLowerCase().replace(/( )*/g, '');
    let regexMatch = regex.exec(spellDn);
    return {
        name: name,
        difficulty: (+regexMatch[1]) ? +regexMatch[1] : 0,
        complexity: (+regexMatch[2]) ? +regexMatch[2] : 0
    }
}

function _getCombatDn(rating, defense) {
    let difficulty = 4 - (rating - defense);
    difficulty = Math.clamped(difficulty, 2, 6)
    return `${difficulty}:1`
    
}