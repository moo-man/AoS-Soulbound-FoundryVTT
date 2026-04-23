let fields = foundry.data.fields;

const TraitsMixin = (cls) => class extends cls 
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

    get isMagical()
    {
        return this.traitList.magical || this.traitList.realmstone
    }

    getOtherEffects()
    {
        let traitEffects = Object.values(this.traitList).map(e => e.effect).filter(i => i);
        return super.getOtherEffects().concat(traitEffects);
    }

    get traitList () {
        let traits = {}
        if (!this.traits || !Array.isArray(this.traits))
            return []
        this.traits.forEach(i => {

            if (i.custom) 
            {
                traits[i.name] = foundry.utils.duplicate(i)
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

                if (game.aos.config.traitEffects[i.name])
                {
                    let effectData = foundry.utils.deepClone(game.aos.config.traitEffects[i.name]);
                    foundry.utils.setProperty(effectData, `flags.${game.system.id}.path`, `system.traitList.${i.name}.effect`);
                    effectData.img = this.parent.img;

                    traits[i.name].effect = new ActiveEffect.implementation(effectData, {parent: this.parent});
                }
            }   
        })
        return traits
    }
};

export default TraitsMixin;