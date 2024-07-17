import { TestDataModel } from "./components/test";
import { TraitItemModel } from "./components/traits";
let fields = foundry.data.fields;

export class WeaponModel extends TraitItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.attribute = new fields.StringField({initial : "body"});
        schema.category = new fields.StringField({});
        schema.damage = new fields.StringField({});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }

    get isMelee() 
    {
        return this.category == "melee";
    }

    get isRanged() 
    {
        return this.category == "ranged";
    }
}