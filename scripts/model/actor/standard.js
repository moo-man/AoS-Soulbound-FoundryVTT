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
        if (hasProperty(data, "system.combat.health.toughness.value"))
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
        if (hasProperty(data, "system.combat.mettle.value"))
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
        return {
            toughness : true,
            mettle : true,
            wounds : true,
            tokenSize : true
        }
    }

}

