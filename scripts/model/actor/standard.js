import { CombatRollDialog } from "../../apps/roll-dialog/combat";
import { CommonRollDialog } from "../../apps/roll-dialog/common";
import { MiracleRollDialog } from "../../apps/roll-dialog/miracle";
import { SpellRollDialog } from "../../apps/roll-dialog/spell";
import CombatTest from "../../system/tests/combat-test";
import MiracleTest from "../../system/tests/miracle-test";
import SpellTest from "../../system/tests/spell-test";
import SoulboundTest from "../../system/tests/test";
import { BaseSoulboundActorModel } from "./base";
import { AttributesModel } from "./components/attributes";
import { StandardCombatModel } from "./components/combat";
import { SkillsModel } from "./components/skills";


let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseSoulboundActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.attributes = new fields.EmbeddedDataField(AttributesModel);
        schema.skills = new fields.EmbeddedDataField(SkillsModel);
        schema.combat = new fields.EmbeddedDataField(StandardCombatModel);
        schema.currencies = new fields.SchemaField({
            drops : new fields.NumberField({min : 0, initial : 0}),
            phials : new fields.NumberField({min : 0, initial : 0}),
            spheres : new fields.NumberField({min : 0, initial : 0})
        })

        schema.settings = new fields.SchemaField({
            autoCalc : new fields.SchemaField({
                wounds : new fields.BooleanField({initial: true}),
                toughness : new fields.BooleanField({initial: true}),
                mettle : new fields.BooleanField({initial: true}),
                tokenSize: new fields.BooleanField({initial: true})
            })
        })
        return schema;
    }

    async _preCreate(data, options, user) 
    {
        super._preCreate(data, options);
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.bar1" :{ "attribute" : "combat.health.toughness" },
                "prototypeToken.bar2" :{ "attribute" : "combat.mettle" }
            })
        }
    }


    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);

        // Prevent wounds from exceeding max
        if (foundry.utils.hasProperty(data, "system.combat.health.toughness.value"))
        {
            if (this.isSwarm)
            {
                data.system.combat.health.toughness.value = Math.max(data.system.combat.health.toughness.value, 0)
            }
            else 
            {
                data.system.combat.health.toughness.value = Math.clamp(data.system.combat.health.toughness.value, 0, this.combat.health.toughness.max)
            }
            options.deltaToughness = data.system.combat.health.toughness.value - this.combat.health.toughness.value;
        }
        if (foundry.utils.hasProperty(data, "system.combat.mettle.value"))
        {
            data.system.combat.mettle.value = Math.clamp(data.system.combat.mettle.value, 0, this.combat.mettle.max)
            options.deltaMettle = data.system.combat.mettle.value - this.combat.mettle.value;
        }
    }

    async _onUpdate(data, options)
    {
        await super._onUpdate(data, options);

        if (options.deltaToughness > 0)
        {
            TokenHelpers.displayScrollingText("+" + options.deltaToughness, this.parent, {fill: "0x00FF00", direction : CONST.TEXT_ANCHOR_POINTS.TOP});
        }
        else if (options.deltaToughness < 0)
        {
            TokenHelpers.displayScrollingText(options.deltaToughness, this.parent, {fill: "0xFF0000", direction : CONST.TEXT_ANCHOR_POINTS.BOTTOM});
        }

        if (options.deltaMettle > 0)
        {
            TokenHelpers.displayScrollingText("+" + options.deltaMettle, this.parent, {fill: "0x6666FF", direction : CONST.TEXT_ANCHOR_POINTS.TOP});
        }
        else if (options.deltaMettle < 0)
        {
            TokenHelpers.displayScrollingText(options.deltaMettle, this.parent, {fill: "0x6666FF", direction : CONST.TEXT_ANCHOR_POINTS.BOTTOM});
        }
    }
    
    initialize() 
    {
        this.combat.initialize();
        this.power = {
            consumed : 0,
            capacity : 0,
            isUndercharge : false
        }
    }

    computeBase() 
    {
        this.doom = game.counter?.doom || 0
        super.computeBase();
        this.combat.computeWounds();
    }

    computeDerived() 
    {
        super.computeDerived();
        this.combat.compute();
        this.computeItems();
        this.combat.computeRelative();
        this.power.isUndercharge = this.power.consumed > this.power.capacity;
    }

    computeItems() {
        this.parent.items.forEach(item => {
            if (item.isEquipped)
            {
                if (item.isArmour) 
                {
                    this.combat.addArmour(item);
                }
                if (item.isAethericDevice) 
                {
                    this.power.consumed += item.system.power.consumption;
                    this.power.capacity += item.system.power.capacity;
                    this.combat.addAethericDevice(item);
                }
                if (item.isWeapon) 
                {
                    this.combat.addWeapon(item)
                }
            }
        })
    }

    /**
     * @abstract
     */
    applyArchetype(archetype, apply)
    {

    }

    get autoCalc() {
        return this.settings.autoCalc;
    }


     //#region Rolling Setup
     async setupCommonTest({skill, attribute}, context = {}, options={}) 
     {
         return await this.parent._setupTest(CommonRollDialog, SoulboundTest, {skill, attribute}, context, options)
     }
 
     async setupCombatTest(weapon, context = {}, options={})
     {
         return await this.parent._setupTest(CombatRollDialog, CombatTest, weapon, context, options)
     }
 
     async setupSpellTest(power, context = {}, options={})
     {
         return await this.parent._setupTest(SpellRollDialog, SpellTest, power, context, options)
     }
 
     async setupMiracleTest(miracle, context = {}, options={})
     {
         return await this.parent._setupTest(MiracleRollDialog, MiracleTest, miracle, context, options)
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
            super.setupAbilityUse(item, context, options);
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
         let args = {damage, armour, ignoreArmour, penetrating, ineffective, restraining, actor : this.parent, abort, test, item, text, tags}
         await Promise.all(this.parent.runScripts("preTakeDamage", args) || []);
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
 
 
         args = {actor : this.parent, damage, test, item, abort, text, tags}
         await Promise.all(this.parent.runScripts("takeDamageMod", args) || []);
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
             await this.parent.addCondition("restrained")
 
         // Delegate damage application to a hook
         const allowed = Hooks.call("modifyTokenAttribute", {
             attribute: "combat.health.toughness.value",
             value: this.combat.health.toughness.value,
             isDelta: false,
             isBar: true
         }, updates);
 
         let ret = allowed !== false ? await this.parent.update(updates) : this;
 
         let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.parent.prototypeToken.name});
         ui.notifications.notify(note);
         text.push({description: note});
         let wounds;
         // Doing this here because foundry throws an error if wounds are added before the update
         if(remaining < 0 && this.combat.health.wounds.max > 0) {
             if (ineffective)
                 remaining = -1 // ineffective can only cause minor wounds          
             wounds = await this.parent.update(this.combat.computeNewWound(remaining));
         }
 
         this.parent.applyEffect({effectData : item?.damageEffects.map(i => i.convertToApplied(test)) || []})
 
 
         await Promise.all(this.runScripts("takeDamage", {actor : this.parent, update: ret, wounds, remaining, damage, test, text, tags}) || []);
         await Promise.all(test?.actor.runScripts("applyDamage", {actor : this.parent, update: ret, wounds, remaining, damage, test, text, tags}) || []);
         await Promise.all(item?.runScripts("applyDamage", {actor : this.parent, update: ret, wounds, remaining, damage, test, text, tags}) || []);
 
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
 
         let ret = allowed !== false ? await this.parent.update(updates) : this;
 
         let note = game.i18n.format("NOTIFICATION.APPLY_HEALING", {toughness : healing.toughness, name : this.parent.prototypeToken.name});
         ui.notifications.notify(note);
 
         return ret;
     }

}

