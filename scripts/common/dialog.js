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

export async function prepareCommonRoll(attributes, skills) {
    let data = {
        attributes: attributes,
        skills: skills,
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
    combat.armour = 0;
    
    if (hasTarget) {
        targetDefense = target.actor.combat.defense.relative;
        combat.armour = target.actor.combat.armour.total;
    } 
    
    let data = {
        attributes: attributes,
        skills: skills,
        bonusDice : 0, // some spells or miracles grant bonus dice 
        armour: combat.armour,
        defense : {
            values : [
                {
                    key : 1,
                    selected : (targetDefense === 1),
                    label : "ABILITIES.POOR"
                },
                {
                    key : 2,
                    selected : (targetDefense === 2),
                    label : "ABILITIES.AVERAGE"
                },
                {
                    key : 3,
                    selected : (targetDefense === 3),
                    label : "ABILITIES.GOOD"
                },
                {
                    key : 4,
                    selected : (targetDefense === 4),
                    label : "ABILITIES.GREAT"
                },
                {
                    key : 5,
                    selected : (targetDefense === 5),
                    label : "ABILITIES.SUPERB"
                },
                {
                    key : 6,
                    selected : (targetDefense === 6),
                    label : "ABILITIES.EXTRAORDINARY"
                }
            ]
        }
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
                    let skill = skills[skillName];
                    targetDefense = html.find("#defense")[0].value;
                    combat.armour = html.find("#armour")[0].value;
                    const dn = _getDn(combat.weapon.name, _getCombatDn(combat, targetDefense));
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

export async function preparePowerRoll(attributes, skills, power) {
    let  dn = power.dn;
    
    let data = {
        attributes: attributes,
        skills: skills,
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
        difficulty: (+regexMatch[1]) ? +regexMatch[1] : 4,
        complexity: (+regexMatch[2]) ? +regexMatch[2] : 1
    }
}

function _getCombatDn(combat, defense) {
 
    let targetDefense = defense   
        
    let difficulty;
    if (combat.weapon.category === "melee") {
        difficulty = 4 - (combat.melee - targetDefense);
    } else {
        difficulty = 4 - (combat.accuracy - targetDefense);
    }
    if (difficulty > 6) difficulty = 6;
    if (difficulty < 2) difficulty = 2;
        
    return `${difficulty}:1`
    
}