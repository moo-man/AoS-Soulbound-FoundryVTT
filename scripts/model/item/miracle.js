import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";

let fields = foundry.data.fields;


export class MiracleModel extends StandardItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.protection = new fields.NumberField();
        schema.target = new fields.StringField();
        schema.range = new fields.StringField({initial: "self"});
        schema.duration = new fields.StringField();
        schema.effect = new fields.StringField();
        schema.god = new fields.StringField();
        schema.test = new fields.EmbeddedDataField(TestDataModel);

        return schema;
    }
}