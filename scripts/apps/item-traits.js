export default class ItemTraits extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "item-traits",
            template: "systems/age-of-sigmar-soulbound/template/apps/item-traits.hbs",
            height: "auto",
            width: 285,
            title: game.i18n.localize("HEADER.ITEM_TRAITS"),
            resizable : true
        })
    }

    getData() {
        let data = super.getData();
        data.custom = this.constructCustomString(this.object.traits);
        data.traits = Object.keys(game.aos.config.traits).map(i => {
            try {
                let existing = this.object.traits.find(t => t.name == i)
                return {
                    display: game.aos.config.traits[i],
                    key: i,
                    existingTrait: existing,
                    hasValue: game.aos.config.traitsWithValue.includes(i),
                }
            }
            catch (e) {
                return {
                    display: game.aos.config.traits[i],
                    key: i,
                    hasValue: game.aos.config.traitsWithValue.includes(i),
                }
            }
        })
        return data
    }


    _updateObject(event, formData) {
        let newTraits = []
        for (let key in formData) {
            
            if (key == "custom-traits")
                newTraits = newTraits.concat(this.parseCustomTraits(formData[key]))

            else if (formData[key] && !key.includes("value"))
            {
                let traitObj = { name: key }
                if (formData[`${key}-value`])
                    traitObj.value = formData[`${key}-value`]
                newTraits.push(traitObj)
            }
        }
        this.object.update({ "system.traits": newTraits })
    }
    parseCustomTraits(string)
    {
        let regex = /(.+?):(.+?)(\||$)/gm
        let matches = string.matchAll(regex)
        let traits = []
        for (let match of matches)
        {
            traits.push({
                name : match[1].trim().slugify(),
                custom : true,
                display : match[1].trim(),
                description : match[2].trim(),
                type : this.options.type
            })
        }
        return traits
    }

    constructCustomString(traits)
    {
        let customString = ``

        if (typeof traits == "string")
            return customString

        let customTraits = traits.filter(i => i.custom)
        customTraits.forEach(t => {
            customString += `${t.display} : ${t.description} |`
        })
        return customString
        
    }
}