import { BaseActorModel } from "./base";
let fields = foundry.data.fields;

export class PartyModel extends BaseActorModel
{
    static preventItemTypes = [];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.soulfire = new fields.SchemaField({ 
            value : new fields.NumberField({min: 0}),
            max : new fields.NumberField({min: 0})
        });
        schema.doom = new fields.SchemaField({ 
            value : new fields.NumberField({min: 0})
        });
        schema.members = new fields.ArrayField({});
        return schema;
    }
}