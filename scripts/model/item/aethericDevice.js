import { TestDataModel } from "./components/test";
import { TraitItemModel } from "./components/traits";
let fields = foundry.data.fields;

export class AethericDeviceModel extends TraitItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.power = new fields.SchemaField({
            consumption: new fields.NumberField(), 
            capacity : new fields.NumberField()
        });
        schema.crafting = new fields.StringField();
        schema.requirements = new fields.StringField();
        schema.damage = new fields.StringField();
        schema.armour = new fields.NumberField();
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }
}