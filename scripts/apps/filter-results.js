
export default class FilterResults extends FormApplication {
    constructor(object) {
        super(object)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "filter-results",
            title: game.i18n.localize("HEADER.FILTER_RESULTS"),
            template: "systems/age-of-sigmar-soulbound/template/apps/filter-results.html",
            width: 300,
            height: 800,
            resizable: true
        })
    }

    async getData() {
        let data = super.getData();
        let filters = this.object.equipment.filters
        let items = await this.getAllItems();
        items = this.applyFilters(items, filters)
        data.items = items;
        return data
    }


    async _updateObject(event) {
        let choice = $(event.currentTarget).find(".active");
        let choiceId = choice.attr("data-id")

        if (choice)
        {
            this.object.app.chooseEquipment(this.object.equipment, choiceId)
        }
    }

    async getAllItems() {
        let items = game.items.contents

        let packs = await Promise.all(game.packs.filter(p => p.metadata.type == "Item").map(i => i.getDocuments()))

        packs.forEach(p => {        // Remove duplicates (match by ID, don't show compendium item if world item already listed)
            items = items.concat(p.filter(i => !items.find(existing => existing.id == i.id)));
        })
        
        return items.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    applyFilters(items, filters) {
        filters.forEach(f => {
            items = items.filter(i => {
                let itemData = i.toObject();
                itemData.hasTrait = duplicate(game.aos.config.traits)
                for(let trait in itemData.hasTrait)
                {
                    itemData.hasTrait[trait] = i.traitList[trait] ? true : false
                }
                let propValue = getProperty(itemData, f.property)
                let testValue = f.value;
                let test = f.test
                
                // Convert rarity to a number so that ranges of rarities can be used
                if (f.property == "system.availability")
                {
                    propValue = this.rarityNumber[propValue]
                    testValue = this.rarityNumber[testValue]
                }

                if ([propValue, test, testValue].includes(undefined))
                    return false
                return (0, eval)(`"${propValue}" ${this.comparisons[test]} "${testValue}"`)
            })
        })
        return items
    }

    get comparisons() {
        return {
            "lt": "<",
            "le": "<=",
            "eq": "==",
            "gt": ">",
            "ge": ">="
        }
    }

    get rarityNumber() {
        return {
            "common": 1,
            "rare": 2,
            "exotic": 3,
            "special": 4
        }
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find(".document-name").click(ev => {
            let list = $(ev.currentTarget).parents(".directory-list")

            list.find(".active").each((i, e) => {
                e.classList.remove("active")
            })

            let document = $(ev.currentTarget).parents(".document")[0]
            document.classList.add("active")
        })

        html.find(".document-name").contextmenu(ev => {
            let document = $(ev.currentTarget).parents(".document")
            let id = document.attr("data-id")

            game.items.get(id).sheet.render(true, {editable: false})
        })
    }


}