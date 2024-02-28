import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TalentModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.StringField({});
        schema.effect = new fields.StringField({});
        schema.free = new fields.BooleanField({initial: false});
        return schema;
    }
}