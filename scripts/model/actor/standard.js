import TokenHelpers from "../../system/token-helpers";
import { BaseActorModel } from "./base";
import { AttributesModel } from "./components/attributes";
import { StandardCombatModel } from "./components/combat";
import { SkillsModel } from "./components/skills";
let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseActorModel 
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
        return schema;
    }

    async preCreateData(data, options) 
    {
        let preCreateData = await super.preCreateData(data, options);
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.bar1" :{ "attribute" : "combat.health.toughness" },
                "prototypeToken.bar2" :{ "attribute" : "combat.health.wounds" }
            });
        }
        return preCreateData;
    }


    async preUpdateChecks(data, options)
    {
        await super.preUpdateChecks(data, options);

        // Prevent wounds from exceeding max
        if (hasProperty(data, "system.combat.health.toughness.value"))
        {
            options.deltaToughness = data.system.combat.health.toughness.value - this.system.combat.health.toughness.value;
        }
        if (hasProperty(data, "system.combat.mettle.value"))
        {
            options.deltaMettle = data.system.combat.mettle.value - this.system.combat.mettle.value;
        }
    }

    async updateChecks(data, options)
    {
        await super.updateChecks(data, options);

        if (options.deltaToughness)
        {
            TokenHelpers.displayScrollingText(options.deltaToughness > 0 ? "+" + options.deltaToughness : options.deltaToughness, this.parent, {color: options.deltaToughness > 0 ? "0x00FF00" : "0xFF0000"});
        }
        if (options.deltaMettle)
        {
            TokenHelpers.displayScrollingText(options.deltaMettle, this.parent, {color: "0x6666FF"});
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
        if (game.ready)
        {
            this.doom = game.counter.doom // Add doom to actor data so it can be used with effects 
        }
        super.computeBase();
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
                    this.combat.addDevice(item);
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
        return {
            toughness : this.type == "player" || this.bio.type > 1,
            mettle :  this.type == "player" || this.bio.type > 2,
            wounds :  this.type == "player" || this.bio.type > 3,
            tokenSize : !this.isSwarm && this.parent.getFlag("age-of-sigmar-soulbound", "autoCalcTokenSize")
        }
    }

}

