export class RollDialog extends Dialog {
    static async create(data) {
        return new Promise(async (resolve, reject) => {
            const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/common-roll.html", data);
            return new this({
                title: data.title,
                content: html,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let data = this.extractDialogData(html)
                            data.dn = this._getDn(`${game.aos.config.attributes[data.attribute]} ${data.skill ? "(" + game.aos.config.skills[data.skill] + ")" : ""}`, html.find("#dn")[0].value);
                            resolve(data);
                        },
                    }
                },
                default: "roll"
            }).render(true)
        })
    }
    static extractDialogData(html) {
        const attribute = html.find("#attribute")[0].value;
        const skill = html.find("#skill")[0].value;
        const doubleTraining = html.find("#double-training")[0].checked;
        const doubleFocus = html.find("#double-focus")[0].checked;
        const allocation = html.find("#allocation")[0].value;
        const bonusDice = parseInt(html.find("#bonusDice")[0].value);

        return { attribute, skill, doubleTraining, doubleFocus, allocation, bonusDice }
    }

    
    static _dialogData(actor, attribute, skill)
    {
        return {
            attributes : actor.attributes,
            skills : actor.skills,
            skillKey : skill,
            attributeKey: skill ? game.aos.config.skillAttributes[skill] : attribute,
            bonusDice: 0 // some spells or miracles grant bonus dice 
        }
    }

    static _getDn(name, dn) {
        let regex = /([0-9]*)[:]*([0-9]*)/g;
        let spellDn = dn.toLowerCase().replace(/( )*/g, '');
        let regexMatch = regex.exec(spellDn);
        return {
            name: name,
            difficulty: (+regexMatch[1]) ? +regexMatch[1] : 0,
            complexity: (+regexMatch[2]) ? +regexMatch[2] : 0
        }
    }
    
}

export class CombatDialog extends RollDialog {
    static async create(data) {
        return new Promise(async (resolve, reject) => {
            const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/combat-roll.html", data);
            return new this({
                title: data.title,
                content: html,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let testData = this.extractDialogData(html)
                            testData.combat = mergeObject(testData.combat, data.combat)
                            testData.itemId = data.weapon.id
                            testData.dn = this._getDn(data.weapon.name, testData.rating, testData.targetDefense);
                            resolve(testData);
                        },
                    }
                },
                default: "roll"
            }).render(true)
        })
    }
    static extractDialogData(html) {
        let data = super.extractDialogData(html)
        data.rating = html.find("#attack")[0].value;
        data.combat = {armour : html.find("#armour")[0].value}
        data.targetDefense = html.find("#defense")[0].value;

        return data
    }

    static _getDn(name, rating, defense) {
        let difficulty = 4 - (rating - defense);
        difficulty = Math.clamped(difficulty, 2, 6)
        return super._getDn(name, `${difficulty}:1`)
    }
        
    static _dialogData(actor, weapon)
    {
        let skill = weapon.category === "melee" ? "weaponSkill" : "ballisticSkill"
        let attribute = game.aos.config.skillAttributes[skill]
        let data = super._dialogData(actor, attribute, skill)
        data.combat = {
            melee: actor.combat.melee.relative,
            accuracy: actor.combat.accuracy.relative,
            attribute: attribute ,
            skill: skill,
            swarmDice: actor.type === "npc" && actor.isSwarm ? actor.combat.health.toughness.value : 0
        }

        data.weapon = weapon

        let target = game.user.targets.values().next().value;
        const hasTarget = target !== undefined; // No additinal Input when target function is used
        data.targetDefense = 3; // good defense seems to be the most likely starting point
        data.attackRating = weapon.category === "melee" ? data.combat.melee : data.combat.accuracy
        data.combat.armour = 0;

        if (hasTarget) {
            target = target.actor
            if (target)
            {
                data.targetDefense = target.combat.defense.relative;
                data.combat.armour = target.combat.armour.total;
                data.targetSpeaker = target.spakerData
            }
        }

        return data
    }
}


export class PowerDialog extends RollDialog {
    static async create(data) {
        return new Promise(async (resolve, reject) => {
            const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/spell-roll.html", data);
            return new this({
                title: data.title,
                content: html,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let testData = this.extractDialogData(html)
                            testData.itemId = data.power.id
                            testData.dn = this._getDn(data.power.name, html.find("#dn")[0].value);
                            resolve(testData);
                        },
                    }
                },
                default: "roll"
            }).render(true)
        })
    }
    
    static _dialogData(actor, power)
    {
        let skill = power.data.type === "spell" ? "channelling" : "devotion"
        let attribute = game.aos.config.skillAttributes[skill]
        let data = super._dialogData(actor, attribute, skill)
        data.dn = power.dn
        data.power = power
        return data
    }    
}