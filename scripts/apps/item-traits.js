export default class ItemTraits extends FormApplication 
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "item-traits",
            template : "systems/age-of-sigmar-soulbound/template/apps/item-traits.html",
            height : "auto",
            width : "auto",
            title : "Item Traits"
            
        })
    }

    getData() {
        let data = super.getData();
        data.traits = Object.keys(game.aos.config.traits).map(i => {
            let existing = this.object.traits.find(t => t.name == i)
            return  {
                display : game.aos.config.traits[i],
                key : i,
                existingTrait : existing,
                hasValue : game.aos.config.traitsWithValue.includes(i),
            }
        })
        
        return data;
    }


    _updateObject(event, formData)
    {
        let newTraits = []
        for (let key in formData)
        {
            if (formData[key] && !key.includes("value"))
            {
                let traitObj = { name : key}
                if (formData[`${key}-value`])
                    traitObj.value = formData[`${key}-value`]
                newTraits.push(traitObj)
            }
        }
        this.object.update({"data.traits" : newTraits})
    }

    activateListeners(html) {
        super.activateListeners(html);


    }
}