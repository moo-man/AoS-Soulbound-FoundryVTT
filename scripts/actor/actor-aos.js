import { RollDialog, CombatDialog, SpellDialog } from "../system/dialog.js";
import Test from "../system/tests/test.js";
import CombatTest from "../system/tests/combat-test.js";
import SpellTest from "../system/tests/spell-test.js";
import MiracleTest from "../system/tests/miracle-test.js";
import SoulboundUtility from "../system/utility.js";
import TokenHelpers from "../system/token-helpers.js";

export class AgeOfSigmarActor extends Actor {

    async _preCreate(data, options, user) {
        if (data._id)
            options.keepId = SoulboundUtility._keepID(data._id, this)
        
        await super._preCreate(data, options, user)

        this.updateSource(await this.system.preCreateData(data, options, user))
    }

    async _preUpdate(updateData, options, user) {
        await super._preUpdate(updateData, options, user)

        // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.prototypeToken.texture.src.includes("modules/soulbound-core/assets/tokens/unknown") && updateData.img && !updateData.token?.img) {
            updateData["prototypeToken.texture.src"] = updateData.img;
        }
    }

    prepareBaseData() {
        this._itemTypes = null;
        this.derivedEffects = [];
        this.postReadyEffects = []
        this.system.computeBase();
    }

    prepareDerivedData() {
        this.applyDerivedEffects()
        this.system.computeDerived();
    }


    applyDerivedEffects() {
        this.derivedEffects.forEach(change => {
            change.effect.fillDerivedData(this, change)
            change.effect.apply(this, change);
        })
    }

    //#region Rolling Setup
    async setupAttributeTest(attribute, options={}) 
    {
        let dialogData = RollDialog._dialogData(this, attribute, null, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.attributes[attribute])} ${game.i18n.localize("SKILL.TEST")}`
        let testData = await RollDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new Test(testData)
    }

    async setupSkillTest(skill, attribute, options={}) 
    {
        let dialogData = RollDialog._dialogData(this, attribute || game.aos.config.skillAttributes[skill], skill, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.skills[skill])} ${game.i18n.localize("SKILL.TEST")}`
        let testData = await RollDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new Test(testData)
    }

    async setupCombatTest(weapon, options)
    {
        if (typeof weapon == "string")
            weapon = this.items.get(weapon)

        let dialogData = CombatDialog._dialogData(this, weapon, options)
        dialogData.title = `${weapon.name} ${game.i18n.localize("WEAPON.TEST")}`
        let testData = await CombatDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new CombatTest(testData)
    }

    async setupSpellTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        let dialogData = SpellDialog._dialogData(this, power)
        dialogData.title = `${power.name} ${game.i18n.localize("SPELL.TEST")}`
        let testData = await SpellDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new SpellTest(testData)
    }

    async setupMiracleTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        if (power.cost > this.combat.mettle.value)
            return ui.notifications.error(game.i18n.localize("ERROR.NotEnoughMettle"))

        let dialogData = RollDialog._dialogData(this, "soul", "devotion")
        dialogData.title = `${power.name} ${game.i18n.localize("POWER.TEST")}`
        dialogData.difficulty = game.aos.utility.DNToObject(power.test.dn).difficulty || dialogData.difficulty
        dialogData.complexity = game.aos.utility.DNToObject(power.test.dn).complexity || dialogData.complexity
        let testData = await RollDialog.create(dialogData);
        testData.itemId = power.id
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new MiracleTest(testData)
    }
    //#endregion

    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(damage, {ignoreArmour = false, penetrating = 0, ineffective = false, restraining = false}={}) {
        let armour = this.combat.armour.value
        
        armour -= penetrating;
        
        if(armour < 0) { armour = 0; }            

        if (ineffective) armour *= 2;

        damage = ignoreArmour ? damage : damage - armour;

        if (damage < 0)
            damage = 0
        let remaining = this.combat.health.toughness.value - damage;

         // Update the Actor
         const updates = {
            "system.combat.health.toughness.value": remaining >= 0 ? remaining : 0
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

        let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.prototypeToken.name});
        ui.notifications.notify(note);

        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {
            if (ineffective)
                remaining = -1 // ineffective can only cause minor wounds          
            await this.update(this.system.combat.computeNewWound(remaining));
        }
        return ret;
    }

    
    /**
     * applies healing to the actor
     */
    async applyHealing(healing) {

        
         // Update the Actor
         const updates = {};

        if (healing.toughness)
            updates["system.combat.health.toughness.value"] =  Math.min(this.combat.health.toughness.value + healing.toughness, this.combat.health.toughness.max)
        else return

        // Delegate damage application to a hook
        const allowed = Hooks.call("modifyTokenAttribute", {
            attribute: "combat.health.toughness.value",
            value: this.combat.health.toughness.value,
            isDelta: false,
            isBar: true
        }, updates);

        let ret = allowed !== false ? await this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_HEALING", {toughness : healing.toughness, name : this.prototypeToken.name});
        ui.notifications.notify(note);

        return ret;
    }


   

    async addCondition(effect, options={}) {
        if (typeof (effect) === "string")
            effect = CONFIG.statusEffects.concat(Object.values(game.aos.config.systemEffects)).find(e => e.id == effect)
        if (!effect)
          return "No Effect Found"
        else 
            effect = duplicate(effect)
    
        if (!effect.id)
          return "Conditions require an id field"
    
    
        let existing = this.hasCondition(effect.id)
    
        if (!existing) {
          effect.name = game.i18n.localize(effect.name)
          effect.statuses = [effect.id];
          effect.origin = options.origin || "";
          delete effect.id
          return this.createEmbeddedDocuments("ActiveEffect", [effect])
        }
      }
    
      async removeCondition(effect, value = 1) {
        if (typeof (effect) === "string")
            effect = CONFIG.statusEffects.concat(Object.values(game.aos.config.systemEffects)).find(e => e.id == effect)
        if (!effect)
          return "No Effect Found"
        else
            effect = duplicate(effect)
    
        if (!effect.id)
          return "Conditions require an id field"
    
        let existing = this.hasCondition(effect.id)
    
        if (existing) {
          return existing.delete()
        }
      }
    
    
      hasCondition(conditionKey) {
        let existing = this.effects.find(e => e.statuses.has(conditionKey))
        return existing
    }

    async applyRend(damage, {magicWeapon = false}={}) {

        let armours = this.items.filter(i => i.isEquipped 
                                          && i.subtype !== "shield" // That isn't a shield
                                          && i.benefit !== 0 // not already at zero
                                          && (!i.traitList.magical || (i.traitList.magical && magicWeapon)) // Only nonmagical - unless magic weapon
                                          && (!i.traitList.sigmarite || (i.traitList.sigmarite && magicWeapon))) // Only sigmarite - unless magic weapon
        
        if(armours.length === 0) return ui.notifications.notify(game.i18n.localize("NOTIFICATION.REND_FAIL"));
        
        let sub = damage
        for(let am of armours) {            
            let val = am.benefit - sub;
            sub -= am.benefit;

            
            if(val >= 0) {
                await am.update({"system.benefit": val});
            } else {
                await am.update({"system.benefit": 0}); 
            }
            
            if(sub === 0) break;            
        }
        
        let note = game.i18n.format("NOTIFICATION.APPLY_REND", {damage : damage, name : this.prototypeToken.name});
        ui.notifications.notify(note);
    }

    get itemTypes()
    {
        if (!this._itemTypes)
        {
            this._itemTypes = super.itemTypes;
        }
        return this._itemTypes;
    }

    allDialogChanges({targets=[]} = {}) {
        let effects = this.effects.contents
        // Aggregate dialog changes from each effect
        let changes = effects.filter(e => !e.disabled).reduce((prev, current) => mergeObject(prev, current.getDialogChanges()), {})

        if (targets.length) {
            let target = targets[0]
            let targetChanges = target.effects.filter(e => !e.disabled).reduce((prev, current) => mergeObject(prev, current.getDialogChanges({target : true})), {})
            mergeObject(changes, targetChanges);
        }

        return changes
    }

    async onEnterDrawing(drawing)
    {
        let flags = drawing.flags["age-of-sigmar-soulbound"]

        let cover = flags.cover
        let hazard = flags.hazard
        let obscured = flags.obscured
        let difficult = flags.difficult
        let options = {origin : drawing.uuid}

        if (cover)
            await this.addCondition(cover, options)
        if (hazard)
            await this.addCondition(hazard, options)
        if (obscured)
            await this.addCondition(obscured, options)
        if (difficult)
            await this.addCondition("difficult", options)
    }

    async onLeaveDrawing(drawing)
    {
        let flags = drawing.flags["age-of-sigmar-soulbound"]

        let cover = flags.cover
        let hazard = flags.hazard
        let obscured = flags.obscured
        let difficult = flags.difficult

        if (cover)
            await this.removeCondition(cover)
        if (hazard)
            await this.removeCondition(hazard)
        if (obscured)
            await this.removeCondition(obscured)
        if (difficult)
            await this.removeCondition("difficult")
    }

    speakerData(token) {
        if (token || this.isToken)
        {
            return {
                token : (token?.document || this.token).id,
                scene : (token?.document || this.token).parent.id
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
    get isSwarm() {return this.system.isSwarm}

    // @@@@@@ DATA GETTERS @@@@@@
    get attributes() {return this.system.attributes}
    get skills() {return this.system.skills}
    get combat() {return this.system.combat}
    get currencies() {return this.system.currencies}
    get bio() {return this.system.bio}
    get experience() {return this.system.experience}
    get notes() {return this.system.notes}
    get soulfire() {return this.system.soulfire}
    get doom() {return this.system.doom}
    get power() {return this.system.power}
    get members() {return this.system.members || []}

}