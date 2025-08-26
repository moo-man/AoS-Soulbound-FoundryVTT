import SoulboundTest from "../system/tests/test.js";
import CombatTest from "../system/tests/combat-test.js";
import SpellTest from "../system/tests/spell-test.js";
import MiracleTest from "../system/tests/miracle-test.js";
import SoulboundUtility from "../system/utility.js";
import { CommonRollDialog } from "../apps/roll-dialog/common.js";
import { SpellRollDialog } from "../apps/roll-dialog/spell.js";
import { MiracleRollDialog } from "../apps/roll-dialog/miracle.js";
import { CombatRollDialog } from "../apps/roll-dialog/combat.js";
import SoulboundItemUseTest from "../system/tests/item-use.js";

export class SoulboundActor extends WarhammerActor {


    async _preUpdate(updateData, options, user) {
        await super._preUpdate(updateData, options, user);

        // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.prototypeToken.texture.src.includes("modules/soulbound-core/assets/tokens/unknown") && updateData.img && !updateData.token?.img) {
            updateData["prototypeToken.texture.src"] = updateData.img;
        }
    }


    prepareBaseData() {
        super.prepareBaseData();
        this.derivedEffects = [];
        this.postReadyEffects = [];
        this.system.computeBase();
    }

    prepareDerivedData() {
        this.applyDerivedEffects();
        super.prepareDerivedData();
    }


    applyDerivedEffects() {
        this.derivedEffects.forEach(change => {
            change.effect.fillDerivedData(this, change)
            change.effect.apply(this, change);
        })
    }



    //#region Rolling Setup
    async setupCommonTest(...args) 
    {
        return this.system.setupCommonTest(...args)
    }

    async setupCombatTest(...args) 
    {
        return this.system.setupCombatTest(...args)
    }

    async setupSpellTest(...args) 
    {
        return this.system.setupSpellTest(...args)
    }

    async setupMiracleTest(...args) 
    {
        return this.system.setupMiracleTest(...args)
    }

    async setupTestFromItem(...args) 
    {
        return this.system.setupTestFromItem(...args)
    }

    async setupAbilityUse(...args) 
    {
        return this.system.setupAbilityUse(...args)
    }

    //#endregion

    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(...args) {
        return this.system.applyDamage(...args)
    }

    /**
     * applies healing to the actor
     */
    async applyHealing(...args) {
        return this.system.applyHealing(...args)
    }

    async addCondition(effect, options={}, mergeData={}) {
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
          return this.createEmbeddedDocuments("ActiveEffect", [mergeObject(effect, mergeData)], {condition: true})
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

    speakerData(token) {
        if (token || this.isToken)
        {
            return {
                token : (token || this.token).id,
                scene : (token || this.token).parent.id
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