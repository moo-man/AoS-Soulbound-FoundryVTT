import { RollDialog, CombatDialog, PowerDialog } from "../system/dialog.js";

export class AgeOfSigmarActor extends Actor {

    async _preCreate(data, options, user) {

        let initData = {
            "token.bar1" :{ "attribute" : "combat.health.toughness" },
            "token.bar2" :{ "attribute" : "combat.health.wounds" },
            "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "token.name" : data.name
        }
        if (data.type === "player") {
            initData["token.vision"] = true;
            initData["token.actorLink"] = true;
        }
        else if (data.type === "npc") {
            initData["flags.age-of-sigmar-soulbound.autoCalcTokenSize"] = true
        }
        this.data.update(initData)
    }

    prepareData() {
        this.derivedEffects = [];
        this.postReadyEffects = []

        if (game.ready && this.type != "party")
            this.data.update({"data.doom" : game.counter.doom}) // Add doom to actor data so it can be used with effects

        super.prepareData();

        if (this.type === "player" || this.type === "npc") {
            this._computeItems();
            this._computeRelativeCombatAbilities();
        }
        if (this.type==="npc")
            this._sizeToken()
    }


    prepareBaseData() {
        if (this.type === "player" || this.type === "npc")
            this._initializeData();
    }

    prepareDerivedData() {
        this.applyDerivedEffects()
        if (this.type === "player" || this.type === "npc")
        {
            this._computeSkillTotals();
            this._computeSecondary();
        }
    }

    _initializeData() {
        this.combat.melee.total = 0;
        this.combat.melee.relative = 0;
        this.combat.accuracy.total = 0;
        this.combat.accuracy.relative = 0;
        this.combat.defense.total = 0;
        this.combat.defense.relative = 0;
        this.combat.armour.value = 0;
        this.combat.health.toughness.max = 0;        
        this.combat.health.wounds.value = 0;
        this.combat.health.wounds.max = 0;
        this.combat.initiative.total = 0;
        this.combat.naturalAwareness.total = 0;
        this.combat.mettle.max = 0;
        this.combat.damage = 0;
        this.power.consumed = 0,
        this.power.capacity = 0,
        this.power.isUndercharge = false
    }

    _computeRelativeCombatAbilities() {
        this.combat.melee.relative = this._getCombatLadderValue("melee");
        this.combat.accuracy.relative = this._getCombatLadderValue("accuracy");
        this.combat.defense.relative = this._getCombatLadderValue("defense");

        this.combat.melee.ability = this._getCombatAbility("melee")
        this.combat.accuracy.ability = this._getCombatAbility("accuracy")
        this.combat.defense.ability = this._getCombatAbility("defense")
    }
    
    _getCombatAbility(combatStat)
    {
        let value = this.combat[combatStat].relative
        switch(value) {
            case 1: return `${game.i18n.localize("ABILITIES.POOR")} (1)`; 
            case 2: return `${game.i18n.localize("ABILITIES.AVERAGE")} (2)`;
            case 3: return `${game.i18n.localize("ABILITIES.GOOD")} (3)`;
            case 4: return `${game.i18n.localize("ABILITIES.GREAT")} (4)`;
            case 5: return `${game.i18n.localize("ABILITIES.SUPERB")} (5)`;
            case 6: return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (6)`;
            default : return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (${value})`;
        }
    }

    _getCombatLadderValue(combatStat) {
        let value = this.combat[combatStat].total

        if(value <= 2)
            return 1;
        else if(value <= 4) {
            return 2;
        } else if(value <= 6) {
            return 3;
        } else if(value <= 8) {
            return 4;
        } else if(value <= 10) {
            return 5;
        } else {
            return 6;
        }
    }

    _computeSkillTotals() {
        for (let skillKey in this.skills) {
            let skill = this.skills[skillKey]
            skill.value = skill.training + this.attributes[game.aos.config.skillAttributes[skillKey]].value + skill.bonus;
        }
    }

    _computeItems() {
        this.combat.wounds.forEach(i => {
            this.combat.health.wounds.value += i.damage;
        })
        this.items.forEach(item => {
            item.prepareOwnedData()
            if (item.isEquipped)
            {
                if (item.isArmour) this._computeArmour(item);
                if (item.isAethericDevice) this._computeAethericDevice(item);
                if (item.isWeapon) this._computeWeapon(item)
            }
        })
    }
    
    _computeArmour(item) {
        if (item.subtype === "shield") {
            // Like below treat shield benefit as an step increase
            this.combat.defense.total += (item.benefit * 2);
        } else {
            this.combat.armour.value += item.benefit;
        }
    }

    _computeAethericDevice(item) {
        this.power.consumed += item.power.consumption;
        this.power.capacity += item.power.capacity;
    }

    _computeWeapon(item)
    {
        if(item.traitList.defensive)
            this.combat.defense.total += 2;

    }

    _sizeToken() {
        if(this.isSwarm || !this.autoCalc.tokenSize) return; //Swarms are variable let the GM decide Size

        let size = this.bio.size; 

        if(size <= 2) {
            this.data.token.update({"height" : 1});
            this.data.token.update({"width" : 1});
        } else if(size === 3) {
            this.data.token.update({"height" : 2});
            this.data.token.update({"width" : 2});
        } else if(size === 4) {
            this.data.token.update({"height" : 3});
            this.data.token.update({"width" : 3});
        } else if(size === 5) {
            this.data.token.update({"height" : 4});
            this.data.token.update({"width" : 4});
        }
    }

    _computeSecondary() {
        // melee, accuracy and defense bonus is doubled to represent a one step increase
        this.combat.melee.total +=             this.attributes.body.value + this.skills.weaponSkill.training + (this.combat.melee.bonus * 2);
        this.combat.accuracy.total +=          this.attributes.mind.value + this.skills.ballisticSkill.training + (this.combat.accuracy.bonus * 2);
        this.combat.defense.total +=           this.attributes.body.value + this.skills.reflexes.training + (this.combat.defense.bonus * 2);
        this.combat.armour.value +=            this.combat.armour.bonus;        
        this.combat.initiative.total +=        this.attributes.mind.value + this.skills.awareness.training + this.skills.reflexes.training + this.combat.initiative.bonus;
        this.combat.naturalAwareness.total +=  Math.ceil((this.attributes.mind.value + this.skills.awareness.training) / 2) + this.combat.naturalAwareness.bonus;        
        this.power.isUndercharge =             this.power.consumed > this.power.capacity;
        
        if(this.autoCalc.toughness) {
            this.combat.health.toughness.max += this.attributes.body.value + this.attributes.mind.value + this.attributes.soul.value + this.combat.health.toughness.bonus;
        } else if(!this.isSwarm) {
            this.combat.health.toughness.max = 1;
        }
        
        if(this.autoCalc.wounds) {
            this.combat.health.wounds.max += Math.ceil((this.attributes.body.value + this.attributes.mind.value + this.attributes.soul.value) / 2) + this.combat.health.wounds.bonus;
            this.combat.health.wounds.deadly = this.combat.health.wounds.value >= this.combat.health.wounds.max;
        }

        if(this.autoCalc.mettle) {
            this.combat.mettle.max += Math.ceil(this.attributes.soul.value / 2) + this.combat.mettle.bonus;
        }
    }

    applyDerivedEffects() {
        this.derivedEffects.forEach(change => {
            change.effect.fillDerivedData(this, change)
            const modes = CONST.ACTIVE_EFFECT_MODES;
            switch ( change.mode ) {
                case modes.CUSTOM:
                return change.effect._applyCustom(this, change);
                case modes.ADD:
                return change.effect._applyAdd(this, change);
                case modes.MULTIPLY:
                return change.effect._applyMultiply(this, change);
                case modes.OVERRIDE:
                return change.effect._applyOverride(this, change);
                case modes.UPGRADE:
                case modes.DOWNGRADE:
                return change.effect._applyUpgrade(this, change);
            }
        })
    }



    //#region Rolling Setup
    async setupAttributeTest(attribute, options={}) 
    {
        console.log(options)
        let dialogData = RollDialog._dialogData(this, attribute, null, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.attributes[attribute])} Test`
        let testData = await RollDialog.create(dialogData);
        testData.speaker = this.speakerData
        return testData 
    }

    async setupSkillTest(skill, attribute, options={}) 
    {
        let dialogData = RollDialog._dialogData(this, attribute || game.aos.config.skillAttributes[skill], skill, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.skills[skill])} Test`
        let testData = await RollDialog.create(dialogData);
        testData.speaker = this.speakerData
        return testData 
    }

    async setupCombatTest(weapon, options)
    {
        if (typeof weapon == "string")
            weapon = this.items.get(weapon)

        let dialogData = CombatDialog._dialogData(this, weapon, options)
        dialogData.title = `${weapon.name} Test`
        let testData = await CombatDialog.create(dialogData);
        testData.speaker = this.speakerData
        return testData 
    }

    async setupPowerTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        let dialogData = PowerDialog._dialogData(this, power)
        dialogData.title = `${power.name} Test`
        let testData = await PowerDialog.create(dialogData);
        testData.speaker = this.speakerData
        return testData 
    }
    _getCombatData(weapon) {
        let data = {
            melee: this.actor.combat.melee.relative,
            accuracy: this.actor.combat.accuracy.relative,
            attribute: "body" ,
            skill: weapon.category === "melee" ? "weaponSkill" : "ballisticSkill",
            swarmDice: this.actor.type === "npc" && this.actor.isSwarm ? this.actor.combat.health.toughness.value : 0, 
        }


    }


    //#endregion



    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(damage, {ignoreArmour = false, penetrating = 0, ineffective = false, restraining = false}={}) {
        let armour = this.combat.armour.value

        armour -= penetrating

        if (ineffective) armour *= 2

        damage = ignoreArmour ? damage : damage - armour



        if (damage < 0)
            damage = 0
        let remaining = this.combat.health.toughness.value - damage;

        if (ineffective)
            remaining = -1 // ineffective can only cause minor wounds

         // Update the Actor
         const updates = {
            "data.combat.health.toughness.value": remaining >= 0 ? remaining : 0
        };

        if (damage > 0 && restraining)
            await this.addCondition("restrained")

        // Delegate damage application to a hook
        const allowed = Hooks.call("modifyTokenAttribute", {
            attribute: "combat.health.toughness.value",
            value: this.combat.health.toughness.value,
            isDelta: false,
            isBar: true
        }, updates);

        let ret = allowed !== false ? await this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);

        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {          
            this.computeNewWound(remaining);
        }
        return ret;
    }

    /**
     * creates and adds a wound based on how far the actors health has gone below zero
     * @param {int} remaining 
     */
    async computeNewWound(remaining) {

        if (remaining >= 0)
            return

        let type;
        let damage;

        if(remaining === -1) {
            type = "minor"
            damage = 1;
        } else if (remaining >= -4) {
            type = "serious"
            damage = 2;            
        } else {
            type = "deadly"
            damage = 3; 
        }

        //Woundtrack can't go over max so we change the value of the new wound to exactly fill it.
        if((this.combat.health.wounds.value + damage) > this.combat.health.wounds.max) {
            damage = this.combat.health.wounds.max - this.combat.health.wounds.value
        }

        return this.addWound(type, damage)
    }

    // Add new wound according to the given type, 'minor' 'serious' or 'deadly'
    addWound(type = "", damage = 0)
    {
        if (isNaN(damage) && type)
            damage = game.aos.config.woundDamage[type] || 0
        
        let wounds = duplicate(this.combat.wounds)
        wounds.unshift({type, damage})
        return this.update({"data.combat.wounds" : wounds})
    }

    async addCondition(effect) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
    
        let existing = this.hasCondition(effect.id)
    
        if (!existing) {
          effect.label = game.i18n.localize(effect.label)
          effect["flags.core.statusId"] = effect.id;
          delete effect.id
          return this.createEmbeddedDocuments("ActiveEffect", [effect])
        }
      }
    
      async removeCondition(effect, value = 1) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
        let existing = this.hasCondition(effect.id)
    
        if (existing) {
          return existing.delete()
        }
      }
    
    
      hasCondition(conditionKey) {
        let existing = this.effects.find(i => i.getFlag("core", "statusId") == conditionKey)
        return existing
      }

    async applyRend(damage) {

        let armours = this.items.filter(i => i.isEquipped 
                                          && i.subtype !== "shield" // That isn't a shield
                                          && i.benefit !== 0 // not already at zero
                                          && !i.traitList.magical) // Only nonmagical
        
        if(armours.length === 0) return;
        
        let sub = damage
        for(let am of armours) {            
            let val = am.benefit - sub;
            sub -= am.benefit;

            
            if(val >= 0) {
                await am.update({"data.benefit": val});
            } else {
                await am.update({"data.benefit": 0}); 
            }
            
            if(sub === 0) break;            
        }
        
        let note = game.i18n.format("NOTIFICATION.APPLY_REND", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);
    }

    getItemTypes(type) {
        return (this.itemCategories || this.itemTypes)[type]
    }

    get autoCalc() {
        return {
            toughness : this.type == "player" || this.bio.type > 1,
            mettle :  this.type == "player" || this.bio.type > 2,
            wounds :  this.type == "player" || this.bio.type > 3,
            tokenSize : !this.isSwarm && this.getFlag("age-of-sigmar-soulbound", "autoCalcTokenSize")
        }
    }

    get speakerData() {
        if (this.isToken)
        {
            return {
                token : this.token.id,
                scene : this.token.parent.id
            }
        }
        else
        {
            return {
                actor : this.id
            }
        }
    }


    get Speed() {
        let speed = this.combat.speeds
        let display = []
        display.push(`${game.aos.config.speed[speed.foot]}`)

        if (speed.flight != "none")
            display.push(`${game.i18n.localize("HEADER.FLY_SPEED")} (${game.aos.config.speed[speed.flight]})`)

        if (speed.swim != "none")
            display.push(`${game.i18n.localize("HEADER.SWIM_SPEED")} (${game.aos.config.speed[speed.swim]})`)

        return display.join(", ")
        
    }

    get size() {
        if (this.type == "npc")
            return this.bio.size
        else
            return 2
    }

    // @@@@@ BOOLEAN GETTERS @@@@@
    get isSwarm() {return this.bio.type === 0}

    // @@@@@@ DATA GETTERS @@@@@@
    get attributes() {return this.data.data.attributes}
    get skills() {return this.data.data.skills}
    get combat() {return this.data.data.combat}
    get currencies() {return this.data.data.currencies}
    get bio() {return this.data.data.bio}
    get experience() {return this.data.data.experience}
    get notes() {return this.data.data.notes}
    get soulfire() {return this.data.data.soulfire}
    get doom() {return this.data.data.doom}
    get power() {return this.data.data.power}
    get members() {return this.data.data.members || []}
}