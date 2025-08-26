let fields = foundry.data.fields;
import { EquippableItemModel } from "./components/equippable";
import { TestDataModel } from "./components/test";
import TraitsMixin  from "./components/traits";

export class AethericDeviceModel extends TraitsMixin(EquippableItemModel)
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

    get isMelee() 
    {
        return this.category == "melee";
    }

    get isRanged() 
    {
        return this.category == "ranged";
    }

    computeOwned(actor) {
        if (this.category === "melee") {
            this.pool = actor.skills.weaponSkill.total;
            this.focus = actor.skills.weaponSkill.focus;
        } else {
            this.pool = actor.skills.ballisticSkill.total;
            this.focus = actor.skills.ballisticSkill.focus;
        }
        if(actor.isSwarm) {
            this.pool += actor.combat.health.toughness.value;
        }
    }
}