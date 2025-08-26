import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
import TraitsMixin  from "./components/traits";
let fields = foundry.data.fields;

export class VehicleItemModel extends TraitsMixin(StandardItemModel)
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField({initial: "trait", choices : {"trait" : "VEHICLE.TRAIT", "attack" : "VEHICLE.ATTACK", "role" : "VEHICLE.ROLE", "action" : "VEHICLE.ACTION"}});

        schema.test = new fields.SchemaField({
            type: new fields.StringField({blank: true, choices : {"speed" : "HEADER.SPEED", "man" : "HEADER.MANOEUVRE" }}),
            attribute :  new fields.StringField(),
            skill :  new fields.StringField(),
            dn :  new fields.StringField(),
            speed : new fields.BooleanField()
        }); 
        
        schema.accuracy = new fields.NumberField({min: 1});
        schema.dice = new fields.NumberField({min: 0})
        schema.focus = new fields.NumberField({min: 0})
        schema.damage = new fields.StringField();
        schema.range = new fields.SchemaField({
            attack: new fields.StringField(),
            min: new fields.StringField(),
            max: new fields.StringField(),
        })
        return schema;
    }

    
    get rangeBand()
    {
        if (!this.range.min && !this.range.max)
        {
            return ""
        }
        else if (this.range.min == this.range.max) 
        {
            return game.aos.config.range[this.range.max] + " Range";
        }
        else if (this.range.min == "self" && this.range.max == "long")
        {
            return "Any Range"
        }
        else
        {
            return `${game.aos.config.range[this.range.min]} to ${game.aos.config.range[this.range.max]} Range`;
        }
    }
}