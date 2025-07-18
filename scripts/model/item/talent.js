import { TestDataModel } from "./components/test";
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
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }
}