import { TestDataModel } from "./components/test";
import { EquippableItemModel } from "./components/equippable";
import TraitsMixin from "./components/traits";
let fields = foundry.data.fields;

export class WeaponModel extends TraitsMixin(EquippableItemModel)
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