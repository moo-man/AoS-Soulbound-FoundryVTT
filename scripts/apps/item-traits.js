export default class ItemTraits extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        classes : ["soulbound", "item-traits"],
        window : {
            title : "Item Traits",
            resizable: true
        },
        position : {
            width: 300,
            height: 600
        },
        form: {
            handler: this.submit,
            closeOnSubmit: true,
            submitOnChange : false
        }
    };

    static PARTS = {
        form: {
            template: "systems/age-of-sigmar-soulbound/templates/apps/item-traits.hbs"
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    async _prepareContext() {
        let context = await super._prepareContext(); 
        context.custom = this.constructCustomString(this.document.system.traits);
        context.traits = Object.keys(game.aos.config.traits).map(i => {
            try {
                let existing = this.document.traits.find(t => t.name == i)
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
        return context
    }

    static submit(event, form, formData)
    {
        let newTraits = []

        for (let key in formData.object)
        {
            if (key == "custom-traits")
                newTraits = newTraits.concat(this.parseCustomTraits(formData.object[key]))

            else if (formData.object[key] && !key.includes("value"))
            {
                let traitObj = { name : key}
                let value = formData.object[`${key}-value`]
                if (value)
                    traitObj.value = Number.isNumeric(value) ? parseInt(value) : value
                newTraits.push(traitObj)
            }
        }
        this.document.update({"system.traits" : newTraits})
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