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
                    const attribute = attributes[attributeName];
                    let skill = skills[skillName];
                    const dn = _getDn(`${game.i18n.localize(attribute.label)} (${game.i18n.localize(skill.label)})`, html.find("#dn")[0].value);
                    if (doubleTraining) skill.total = skill.total * 2;
                    await commonRoll(attribute, skill, dn);
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
    let data = {
        attributes: attributes,
        skills: skills,
        dn: _getCombatDn(combat)
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
                    const attribute = attributes[attributeName];
                    let skill = skills[skillName];
                    const dn = _getDn(combat.weapon.name, html.find("#dn")[0].value);
                    if (doubleTraining) skill.total = skill.total * 2;
                    await combatRoll(attribute, skill, combat, dn);
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
    let dn;
    if (power.type === "spell") {
        dn = power.data.data.dn;
    } else {
        dn = "4:1";
    }
    let data = {
        attributes: attributes,
        skills: skills,
        dn: dn
    }
    const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/combat-roll.html", data);
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
                    const attribute = attributes[attributeName];
                    let skill = skills[skillName];
                    const dn = _getDn(power.data.name, html.find("#dn")[0].value);
                    if (doubleTraining) skill.total = skill.total * 2;
                    await powerRoll(attribute, skill, power, dn);
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

function _getCombatDn(combat) {
    const target = game.user.targets.values().next().value;
    if (target === undefined) {
        combat.armour = 0;
        return "4:1";
    } else {
        let targetDefense = target.actor.data.data.combat.defense.total;
        let difficulty;
        if (combat.weapon.category === "melee") {
            difficulty = 4 - (combat.melee - targetDefense);
        } else {
            difficulty = 4 - (combat.accuracy - targetDefense);
        }
        if (difficulty > 6) difficulty = 6;
        if (difficulty < 2) difficulty = 2;
        combat.armour = target.actor.data.data.combat.armour.total;
        return `${difficulty}:1`
    }
}