import { BaseSoulboundItemModel } from "./base";
let fields = foundry.data.fields;

export class StandardItemModel extends BaseSoulboundItemModel
{

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.description = new fields.StringField({});
        return schema;
    }
}