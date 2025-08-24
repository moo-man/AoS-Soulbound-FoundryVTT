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
    async setupCommonTest({skill, attribute}, context = {}, options={}) 
    {
        return await this._setupTest(CommonRollDialog, SoulboundTest, {skill, attribute}, context, options)
    }

    async setupCombatTest(weapon, context = {}, options={})
    {
        return await this._setupTest(CombatRollDialog, CombatTest, weapon, context, options)
    }

    async setupSpellTest(power, context = {}, options={})
    {
        return await this._setupTest(SpellRollDialog, SpellTest, power, context, options)
    }

    async setupMiracleTest(miracle, context = {}, options={})
    {
        return await this._setupTest(MiracleRollDialog, MiracleTest, miracle, context, options)
    }

    async setupTestFromItem(item, context = {}, options={})
    {
        if (typeof item == "string")
        {
            item = await fromUuid(item);
        }
        if (item.system.test)
        {
            return this.setupCommonTest({skill : item.system.test.skill, attribute : item.system.test.attribute}, mergeObject({fields : item.system.test.difficulty}, context), options);
        }
    }

    async setupAbilityUse(item, context={}, options={})
    {
        if (typeof item == "string")
        {
            item = await fromUuid(item);
        }

        if (item.hasTest && item.system.test.self)
        {
            return this.setupCommonTest({skill : item.system.test.skill, attribute : item.system.test.attribute}, mergeObject({fields : item.system.test.difficulty, itemId : item.uuid, appendTitle : ` - ${item.name}`}, context, options));
        }
        else
        {
            let use = SoulboundItemUseTest.fromItem(item, this);
            await use.roll();
            use.sendToChat();
        }
    }

    //#endregion

    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(damage, {ignoreArmour = false, penetrating = 0, ineffective = false, restraining = false, test, item, tags=[]}={}) {
        let armour = this.combat.armour.value
        
        let abort = undefined;
        let text = [];
        let args = {damage, armour, ignoreArmour, penetrating, ineffective, restraining, actor : this, abort, test, item, text, tags}
        await Promise.all(this.runScripts("preTakeDamage", args) || []);
        await Promise.all(test?.actor.runScripts("preApplyDamage", args) || []);
        await Promise.all(item?.runScripts("preApplyDamage", args) || []);
        ({damage, armour, ignoreArmour, penetrating, ineffective, restraining, abort} = args);

        if (abort)
        {
            if (typeof abort == "string")
            {
                ui.notifications.notify(abort);
            }
            return;
        }

        armour -= penetrating;
        
        if(armour < 0) { armour = 0; }            

        if (ineffective) armour *= 2;

        damage = ignoreArmour ? damage : damage - armour;

        if (damage < 0)
            damage = 0


        args = {actor : this, damage, test, item, abort, text, tags}
        await Promise.all(this.runScripts("takeDamageMod", args) || []);
        await Promise.all(test?.actor.runScripts("applyDamageMod", args) || []);
        await Promise.all(item?.runScripts("applyDamageMod", args) || []);
        ({damage, abort} = args);

        if (abort)
        {
            ui.notifications.notify(abort);
            return;
        }

        let remaining = this.combat.health.toughness.value - damage;

         // Update the Actor
         const updates = {
            "system.combat.health.toughness.value": remaining
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
        text.push({description: note});
        let wounds;
        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {
            if (ineffective)
                remaining = -1 // ineffective can only cause minor wounds          
            wounds = await this.update(this.system.combat.computeNewWound(remaining));
        }

        this.applyEffect({effectData : item?.damageEffects.map(i => i.convertToApplied(test)) || []})


        await Promise.all(this.runScripts("takeDamage", {actor : this, update: ret, wounds, remaining, damage, test, text, tags}) || []);
        await Promise.all(test?.actor.runScripts("applyDamage", {actor : this, update: ret, wounds, remaining, damage, test, text, tags}) || []);
        await Promise.all(item?.runScripts("applyDamage", {actor : this, update: ret, wounds, remaining, damage, test, text, tags}) || []);

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