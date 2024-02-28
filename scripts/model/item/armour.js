import { TraitItemModel } from "./components/traits";
let fields = foundry.data.fields;

export class ArmourModel extends TraitItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        // Todo: Rename type to category
        schema.type = new fields.StringField();
        schema.requirements = new fields.StringField();
        schema.benefit = new fields.StringField();
        return schema;
    }
}