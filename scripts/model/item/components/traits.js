import { EquippableItemModel } from "./equippable";

let fields = foundry.data.fields;

export class TraitItemModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.ArrayField(new fields.SchemaField({
            name : new fields.StringField(),
            value : new fields.StringField({nullable : true})
        }));

        return schema;
    }

    
    get Traits () {
        return Object.values(this.traitList).map(i => i.display)
    }

    get traitList () {
        let traits = {}
        if (!this.traits || !Array.isArray(this.traits))
            return []
        this.traits.forEach(i => {

            if (i.custom) 
            {
                traits[i.name] = duplicate(i)
            }
            else 
            {
                traits[i.name] = {
                    name : i.name,
                    display : game.aos.config.traits[i.name]
                }
                if (game.aos.config.traitsWithValue.includes(i.name))
                {
                    traits[i.name].rating = i.value;
                    traits[i.name].display += ` (${i.value})`
                }
            }   
        })
        return traits
    }

}