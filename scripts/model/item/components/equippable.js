import { PhysicalItemModel } from "./physical";

let fields = foundry.data.fields;

export class EquippableItemModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipped = new fields.BooleanField();
        return schema;
    }

    _onUpdate(update, options, user)
    {
        if (hasProperty(update, "system.equipped"))
        {
            this.runScripts("equipToggle", {equipped : update.system.equipped});
        }
    }

    get isEquipped()
    {
        return this.equipped;
    }

    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect) && (!effect.system.transferData.equipTransfer || this.isEquipped)
    }
}