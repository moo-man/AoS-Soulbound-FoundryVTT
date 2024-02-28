import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class PartyItemModel extends StandardItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField({initial: "resource"});
        schema.state = new fields.BooleanField();
        return schema;
    }
}