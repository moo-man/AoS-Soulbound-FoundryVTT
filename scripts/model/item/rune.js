import { EquippableItemModel } from "./components/equippable";
let fields = foundry.data.fields;


export class RuneModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        return schema;
    }
}