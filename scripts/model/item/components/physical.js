import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class PhysicalItemModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.cost = new fields.StringField();
        schema.quantity = new fields.NumberField({min: 0, initial: 1});
        schema.availability = new fields.StringField({});
        schema.state = new fields.StringField({initial : "other"});

        return schema;
    }
}