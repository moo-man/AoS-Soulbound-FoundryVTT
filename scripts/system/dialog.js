import AgeOfSigmarEffect from "./effect.js";

export class RollDialog extends Dialog {

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.classes.push("roll-dialog")
        options.classes.push("age-of-sigmar-soulbound")
        options.resizable = true;
        return options
    }

    static async create(data) {
        return new Promise(async (resolve, reject) => {
            const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/common-roll.html", data);
            return new this({
                title: data.title,
                content: html,
                effects : data.effects,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let data = this.extractDialogData(html)
                            data.dn = {
                                difficulty : parseInt(html.find("#difficulty")[0].value),
                                complexity : parseInt(html.find("#complexity")[0].value),
                                name : `${game.aos.config.attributes[data.attribute]} ${data.skill ? "(" + game.aos.config.skills[data.skill] + ")" : ""}`
                            }
                            resolve(data);
                        },
                    }
                },
                default: "roll"
            }, {width: 450}).render(true)
        })
    }
    static extractDialogData(html) {
        const attribute = html.find("#attribute")[0].value;
        const skill = html.find("#skill")[0].value;
        const doubleTraining = html.find("#double-training")[0].checked;
        const doubleFocus = html.find("#double-focus")[0].checked;
        const allocation = []//html.find("#allocation")[0].value;
        const bonusDice = parseInt(html.find("#bonusDice")[0].value);
        return { attribute, skill, doubleTraining, doubleFocus, allocation, bonusDice }
    }

    
    static _dialogData(actor, attribute, skill, options={})
    {
        return {
            attributes : actor.attributes,
            skills : actor.skills,
            skillKey : skill,
            attributeKey: skill ? game.aos.config.skillAttributes[skill] : attribute,
            difficulty : options.difficulty || 4,
            complexity : options.complexity || 1,
            bonusDice: options.bonusDice || 0, // some spells or miracles grant bonus dice 
            effects : actor.effects.filter(i => i.hasRollEffect)
        }
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        this.effectValues = {
            "difficulty" : null,
            "complexity" : null,
            "double-training" : null,
            "double-focus" : null,
            "bonusDice" : null,
        }
        

        this.inputs = {}

        html.find("input").focusin(ev => {
            ev.target.select();
        })

        this.inputs.difficulty = html.find('#difficulty').change(ev => {
            this.userEntry.difficulty = parseInt(ev.target.value)
            this.applyEffects()
        })[0]
        this.inputs.complexity = html.find('#complexity').change(ev => {
            this.userEntry.complexity = parseInt(ev.target.value)
            this.applyEffects()
        })[0]

        this.inputs["double-training"] = html.find('#double-training').change(ev => {
            this.userEntry["double-training"] = $(ev.currentTarget).is(":checked")
            this.applyEffects()
        })[0]
        this.inputs["double-focus"] = html.find('#double-focus').change(ev => {
            this.userEntry["double-focus"] = $(ev.currentTarget).is(":checked")
            this.applyEffects()
        })[0]
        this.inputs.bonusDice = html.find('#bonusDice').change(ev => {
            this.userEntry.bonusDice = parseInt(ev.target.value)
            this.applyEffects()
        })[0]


        html.find(".effect-select").change(this._onEffectSelect.bind(this))

        this.userEntry = {
            "difficulty" : parseInt(this.inputs?.difficulty?.value),
            "complexity" : parseInt(this.inputs?.complexity?.value),
            "double-training" : this.inputs["double-training"].checked,
            "double-focus" : this.inputs["double-focus"].checked,
            "bonusDice" : parseInt(this.inputs.bonusDice.value),
        }

    }

    _onEffectSelect(ev) 
    {
        // Reset effect values
        this.effectValues = {
            "difficulty" : null,
            "complexity" : null,
            "double-training" : null,
            "double-focus" : null,
            "bonusDice" : null
        }
        
        let selectedEffects = $(ev.currentTarget).val().map(i => this.data.effects[parseInt(i)])
        let changes = selectedEffects.reduce((prev, current) => prev = prev.concat(current.data.changes), []).filter(i => i.mode == 0)
        changes.forEach(c => {
            if (c.value.includes("@"))
                c.value = eval(Roll.replaceFormulaData(c.value, c.document.parent.getRollData()))
        })
        for (let c of changes)
        {
            if (AgeOfSigmarEffect.numericTypes.includes(c.key))
                this.effectValues[c.key] = (this.effectValues[c.key] || 0) + parseInt(c.value)
            else if (c.key == "double-training" || c.key == "double-focus")
            {
                if (c.value == "true")
                    this.effectValues[c.key] = true
                else if (c.value == "false")
                    this.effectValues[c.key] = false
            }
        }
        this.applyEffects()
    }

    applyEffects()
    {
        for (let input in this.inputs)
        {
            if (!this.inputs[input])
                continue
            if (this.effectValues[input] != null)
            {
                if (this.inputs[input].type == "checkbox")
                    this.inputs[input].checked = this.effectValues[input]
                else if (Number.isNumeric(this.effectValues[input]))
                    this.inputs[input].value = this.userEntry[input] + this.effectValues[input]
                else 
                    this.inputs[input].value = this.effectValues[input]
            }
            else // if not part of effect values, use user entry only
            {
                if (this.inputs[input].type == "checkbox")
                    this.inputs[input].checked = this.userEntry[input]
                else
                    this.inputs[input].value = this.userEntry[input]
            }
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
                effects : data.effects,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let testData = this.extractDialogData(html)
                            testData.combat = mergeObject(data.combat, testData.combat)
                            testData.itemId = data.weapon.id
                            testData.dn = this._getDn(data.weapon.name, testData.rating, testData.targetDefense);
                            resolve(testData);
                        },
                    }
                },
                default: "roll"
            }, {width: 450}).render(true)
        })
    }
    static extractDialogData(html) {
        let data = super.extractDialogData(html)
        data.rating = html.find("#attack")[0].value;
        data.combat = {armour : html.find("#armour")[0].value, bonusDamage : parseInt(html.find("#bonusDamage")[0].value)}
        data.targetDefense = html.find("#defense")[0].value;

        return data
    }

    static _getDn(name, rating, defense) {
        let difficulty = 4 - (rating - defense);
        difficulty = Math.clamped(difficulty, 2, 6)
        return {name, difficulty, complexity : 1}
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
            swarmDice: actor.type === "npc" && actor.isSwarm ? actor.combat.health.toughness.value : 0,
            bonusDamage : 0
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
                data.combat.armour = target.combat.armour.value;
                data.targetSpeaker = target.spakerData
            }
        }

        return data
    }

    _onEffectSelect(ev)
    {
        this.effectValues.bonusDamage = null
        super._onEffectSelect(ev)
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        this.effectValues["bonusDamage"] = null
        this.effectValues["defense"] = null
        this.effectValues["armour"] = null
        this.effectValues["attack"] = null

        this.inputs.bonusDamage = html.find('#bonusDamage').change(ev => {
            this.userEntry.bonusDamage = parseInt(ev.target.value)
            this.applyEffects()
        })[0]

        this.inputs.defense = html.find('#defense').change(ev => {
            this.userEntry.defense = parseInt(ev.target.value)
            this.applyEffects()
        })[0]

        this.inputs.armour = html.find('#armour').change(ev => {
            this.userEntry.armour = parseInt(ev.target.value)
            this.applyEffects()
        })[0]

        this.inputs.attack = html.find('#attack').change(ev => {
            this.userEntry.attack  = parseInt(ev.target.value)
            this.applyEffects()
        })[0]

        this.userEntry["bonusDamage"] = parseInt(this.inputs.bonusDamage.value)
        this.userEntry["defense"] = parseInt(this.inputs.defense.value)
        this.userEntry["armour"] = parseInt(this.inputs.armour.value)
        this.userEntry["attack"] = parseInt(this.inputs.attack.value)
    }
}


export class SpellDialog extends RollDialog {
    static async create(data) {
        return new Promise(async (resolve, reject) => {
            const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/spell-roll.html", data);
            return new this({
                title: data.title,
                effects : data.effects,
                content: html,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("BUTTON.ROLL"),
                        callback: async (html) => {
                            let testData = this.extractDialogData(html)
                            testData.itemId = data.spell.id
                            testData.dn = {
                                difficulty : parseInt(html.find("#difficulty")[0].value),
                                complexity : parseInt(html.find("#complexity")[0].value),
                                name : data.spell.name
                            }
                            resolve(testData);
                        },
                    }
                },
                default: "roll"
            }, {width: 450}).render(true)
        })
    }
    
    static _dialogData(actor, spell)
    {
        let skill = "channelling" 
        let attribute = game.aos.config.skillAttributes[skill]
        let data = super._dialogData(actor, attribute, skill)
        mergeObject(data, spell.difficultyNumber)
        data.spell = spell
        return data
    }    
}

export class MiracleDialog extends RollDialog {
    // static async create(data) {
    //     return new Promise(async (resolve, reject) => {
    //         const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/spell-roll.html", data);
    //         return new this({
    //             title: data.title,
    //             effects : data.effects,
    //             content: html,
    //             buttons: {
    //                 roll: {
    //                     icon: '<i class="fas fa-check"></i>',
    //                     label: game.i18n.localize("BUTTON.ROLL"),
    //                     callback: async (html) => {
    //                         let testData = this.extractDialogData(html)
    //                         testData.itemId = data.power.id
    //                         testData.dn = {
    //                             difficulty : parseInt(html.find("#difficulty")[0].value),
    //                             complexity : parseInt(html.find("#complexity")[0].value),
    //                             name : data.power.name
    //                         }
    //                         resolve(testData);
    //                     },
    //                 }
    //             },
    //             default: "roll"
    //         }, {width: 450}).render(true)
    //     })
    // }
    
    static _dialogData(actor, power)
    {
        let skill = power.test.opposed  ? "devotion" : ""
        let attribute = game.aos.config.skillAttributes[skill]
        let data = super._dialogData(actor, attribute, skill)

        return data
    }    
}