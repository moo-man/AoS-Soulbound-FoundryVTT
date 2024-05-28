import TokenHelpers from "../../../system/token-helpers";

let fields = foundry.data.fields;

export class StandardCombatModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.mettle = new fields.SchemaField({
            value : new fields.NumberField({initial : 0, min : 0}),
            bonus : new fields.NumberField({initial : 0, min : 0}),
            regain : new fields.NumberField({initial : 0, min : 0}),
        });
        schema.health = new fields.SchemaField({
            toughness : new fields.SchemaField({
                value : new fields.NumberField({initial: 0, min: 0}),
                bonus : new fields.NumberField({initial : 0})
            }),
            wounds : new fields.SchemaField({
                // value : new fields.NumberField({initial: 0, min: 0}),
                bonus : new fields.NumberField({initial: 0})
            })
        });
        schema.initiative = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
        });
        schema.naturalAwareness = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
        });
        schema.melee = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
            max : new fields.NumberField({initial : 6})
        });
        schema.accuracy = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
            max : new fields.NumberField({initial : 6})
        });
        schema.defence = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
            max : new fields.NumberField({initial : 6})
        });
        schema.armour = new fields.SchemaField({
            bonus : new fields.NumberField({initial : 0}),
        });
        schema.speeds = new fields.SchemaField({
            foot : new fields.StringField({initial : "normal"}),
            flight : new fields.StringField({initial : "none"}),
            swim : new fields.StringField({initial : "none"}),
            modifier : new fields.NumberField({initial : 0})
        })
        schema.wounds = new fields.ArrayField(new fields.SchemaField({
            type : new fields.StringField(),
            damage : new fields.NumberField()
        }))
        
        return schema;
    }


    initialize() 
    {
        this.melee.total = 0;
        this.melee.relative = 0;
        this.accuracy.total = 0;
        this.accuracy.relative = 0;
        this.defence.total = 0;
        this.defence.relative = 0;
        this.armour.value = 0;

        this.health.toughness.max = 0;        
        this.health.wounds.value = 0;
        this.health.wounds.max = 0;
        this.mettle.max = 0;

        this.initiative.total = 0;
        this.naturalAwareness.total = 0;
    }

    compute() 
    {
        let parent = this.parent;

        // melee, accuracy and defence bonus is doubled to represent a one step increase
        this.melee.total +=             parent.attributes.body.value + parent.skills.weaponSkill.training + (this.melee.bonus * 2);
        this.accuracy.total +=          parent.attributes.mind.value + parent.skills.ballisticSkill.training + (this.accuracy.bonus * 2);
        this.defence.total +=           parent.attributes.body.value + parent.skills.reflexes.training + (this.defence.bonus * 2);
        this.armour.value +=            this.armour.bonus;        
        this.initiative.total +=        parent.attributes.mind.value + parent.skills.awareness.training + parent.skills.reflexes.training + this.initiative.bonus;
        this.naturalAwareness.total +=  Math.ceil((parent.attributes.mind.value + parent.skills.awareness.training) / 2) + this.naturalAwareness.bonus;        

        if(this.parent.autoCalc.toughness) 
        {
        this.health.toughness.max += parent.attributes.body.value + parent.attributes.mind.value + parent.attributes.soul.value
        } 
        else if(!this.isSwarm) 
        {
            this.health.toughness.max = 1;
        }
        this.health.toughness.max += this.health.toughness.bonus;
        
        if(this.parent.autoCalc.wounds) 
        {
            this.health.wounds.max += Math.ceil((parent.attributes.body.value + parent.attributes.mind.value + parent.attributes.soul.value) / 2);
        }
        this.health.wounds.max += this.health.wounds.bonus;
        this.health.wounds.deadly = this.health.wounds.value >= this.health.wounds.max;
        
        if(this.parent.autoCalc.mettle) {
            this.mettle.max += Math.ceil(parent.attributes.soul.value / 2);
        }
        this.mettle.max += this.mettle.bonus;
    }

    computeWounds()
    {
        this.wounds.forEach(i => {
            this.health.wounds.value += i.damage;
        })
    }

    
    computeRelative() {
        this.melee.relative = this._getCombatLadderValue("melee");
        this.accuracy.relative = this._getCombatLadderValue("accuracy");
        this.defence.relative = this._getCombatLadderValue("defence");

        this.melee.ability = this._getCombatAbility("melee")
        this.accuracy.ability = this._getCombatAbility("accuracy")
        this.defence.ability = this._getCombatAbility("defence")
    }
    
    _getCombatAbility(combatStat)
    {
        let value = this[combatStat].relative
        switch(value) {
            case 1: return `${game.i18n.localize("ABILITIES.POOR")} (1)`; 
            case 2: return `${game.i18n.localize("ABILITIES.AVERAGE")} (2)`;
            case 3: return `${game.i18n.localize("ABILITIES.GOOD")} (3)`;
            case 4: return `${game.i18n.localize("ABILITIES.GREAT")} (4)`;
            case 5: return `${game.i18n.localize("ABILITIES.SUPERB")} (5)`;
            case 6: return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (6)`;
            case 7: return `${game.i18n.localize("ABILITIES.INCALCULABLE")} (7)`;
            default : return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (${value})`;
        }
    }

    _getCombatLadderValue(combatStat) {
        let value = this[combatStat].total

        return Math.clamped(Math.ceil(value / 2), 1, this[combatStat].max);
    }

    addArmour(item) {
        if (item.system.type === "shield") {
            // Like below treat shield benefit as an step increase
            this.defence.total += (parseInt(item.system.benefit) * 2);
        } else {
            this.armour.value += parseInt(item.system.benefit);
        }
    }

    addAethericDevice(item) {
        if (item.armour > 0)
            this.armour.value += parseInt(item.system.armour)
    }

    addWeapon(item)
    {
        if(item.system.traitList?.defensive)
            this.defence.total += 2;
    }

    computeSpeedModifier() 
    {
        let speed = this.speeds
        speed.foot = this._applySpeedModifier(speed.foot, speed.modifier)
        speed.flight = this._applySpeedModifier(speed.flight, speed.modifier)
        speed.swim = this._applySpeedModifier(speed.swim, speed.modifier)
    }

    _applySpeedModifier(value, modifier=0)
    {
        const speedNum = {
            "none" : 0,
            "slow" : 1,
            "normal" : 2,
            "fast" : 3
        }

        let valueNum = speedNum[value] || 0;
        if (valueNum != 0)
            valueNum = Math.clamped(valueNum + modifier, 1, 3)
        else return value

        return game.aos.utility.findKey(valueNum, speedNum)
    }



     /**
     * creates and adds a wound based on how far the actors health has gone below zero
     * @param {int} remaining 
     */
      computeNewWound(remaining) {

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
        if((this.health.wounds.value + damage) > this.health.wounds.max) {
            damage = this.health.wounds.max - this.health.wounds.value
        }

        return this.addWound(type, damage)
    }

    // Add new wound according to the given type, 'minor' 'serious' or 'deadly'
    addWound(type = "", damage = 0)
    {
        if (isNaN(damage) && type)
            damage = game.aos.config.woundDamage[type] || 0
        
        let wounds = duplicate(this.wounds)
        wounds.unshift({type, damage})

        TokenHelpers.displayScrollingText(-1, this.parent.parent, {color: "0xFF0000"})

        return {"system.combat.wounds" : wounds}
    }
}


export class CharacterCombatModel extends StandardCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.superiority = new fields.NumberField();
        return schema;
    }
}

export class NPCCombatModel extends StandardCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.resolve = new fields.NumberField();
        schema.armour = new fields.SchemaField({
            formula : new fields.StringField(),
            value : new fields.NumberField({min : 0}),
            useItems : new fields.BooleanField()
        });
        return schema;
    }

    // Add NPC static armour value to all locations
    computeArmour(items)
    {
        if (this.armour.useItems)
        {
            super.computeArmour(items);
        }
        else 
        {
            for (let loc in this.hitLocations)
            {
                if (this.hitLocations[loc])
                {
                    this.hitLocations[loc].armour += (this.armour.value || 0);
                    this.hitLocations[loc].formula = this.armour.formula;
                }
            }
        }
    }

    computeCriticals()
    {
        // Do not compute criticals, handled by computeRole()
    }
}