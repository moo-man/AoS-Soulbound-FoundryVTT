import { BaseRollDialog } from "../../apps/roll-dialog/base";
import { CombatRollDialog } from "../../apps/roll-dialog/combat";
import { CommonRollDialog } from "../../apps/roll-dialog/common";
import CombatTest from "../../system/tests/combat-test";
import SoulboundTest from "../../system/tests/test";
import { BaseSoulboundActorModel } from "./base";
let fields = foundry.data.fields;

export class SimpleVehicleActorModel extends BaseSoulboundActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.defence = new fields.NumberField({min: 1});
        
        schema.armour = new fields.NumberField();

        schema.hull = new fields.SchemaField({
            value : new fields.NumberField({min: 0 }),
            max : new fields.NumberField({min: 0 })
        })

        schema.structure = new fields.SchemaField({
            value : new fields.NumberField({min: 0 }),
            max : new fields.NumberField({min: 0 })
        })

        schema.speed = new fields.NumberField();
        schema.man = new fields.NumberField();

        schema.details = new fields.SchemaField({
            type : new fields.StringField(),
            crew : new fields.NumberField({min: 0}),
            storage : new fields.NumberField({min: 0 }),
            other : new fields.StringField({min: 0}),
        })

        schema.settings = new fields.SchemaField({
            showPassengers: new fields.BooleanField()
        })

        schema.actors = new fields.EmbeddedDataField(DocumentReferenceListModel);

        schema.assignments = new fields.ObjectField({})
        return schema;
    }

        async setupVehicleTest(dice, context = {}, options={}) 
        {
            return await this.parent._setupTest(BaseRollDialog, SoulboundTest, {dice}, context, options)
        }

        async setupVehicleTestFromItem(item, context = {}, options={}) 
        {
            if (typeof item == "string")
            {
                item = await fromUuid(item);
            }

            if (item.type == "attack")
            {
                return this.setupCombatTest(item)
            }
            else if (item.system.category == "action" && ["man", "speed"].includes(item.system.test.type)) 
            {
                let dice;
                if(item.system.test.type == "speed")
                {
                    dice =  this.speed;
                }
                else if (item.system.test.type == "man") 
                {
                    dice =  this.man;
                }
                return this.setupVehicleTest(dice, {title : item.name})
            }
            else
            {
              return this.setupAbilityUse(item)
            }

        }

        async setupCombatTest(weapon, context = {}, options={})
        {
            return await this.parent._setupTest(CombatRollDialog, CombatTest, weapon, context, options)
        }
}

