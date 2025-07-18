import { EquippableItemModel } from "./components/equippable";
import { TestDataModel } from "./components/test";
let fields = foundry.data.fields;


export class RuneModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }
}