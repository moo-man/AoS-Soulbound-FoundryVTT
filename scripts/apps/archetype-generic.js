/**
 * Interface for creating a generic object stored in an archetype's equipment.
 * These generic objects are used when the archetype refers to an item that doesn't exist officially.
 * This object could simply be a description of the item, or could include filters (to accomodate for 
 * some archetypes specifying a range of items e.g. "Any Common Weapon")
 */

export default class ArchetypeGeneric extends FormApplication {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "archetype-generic",
            template: "systems/age-of-sigmar-soulbound/template/apps/archetype-generic.html",
            height: "auto",
            width: 285,
            title: game.i18n.localize("HEADER.ARCHETYPE_GENERIC"),
            resizable: true,
        })
    }

    getData() {
        let data = super.getData();
        let generic = {}
        if (Number.isNumeric(this.object.index))
        {
            generic.property = this.object.item.equipment[this.object.index]?.property
            generic.name = this.object.item.equipment[this.object.index]?.name
            generic.filters = this.object.item.equipment[this.object.index]?.filters
        }

        data.property = generic.property;
        data.name = generic.name;
        data.filters = generic.filters || [{test : "", property: "", value: ""}]

        return data
    }

    async _updateObject(event, formData) {
        let equipment = duplicate(this.object.item.equipment)

        // Create filter array with 
        let filters = Array.from($(event.target).find(".test")).map(t => { return {test : t.value}})

        // Add Property to each element in the filter array
        Array.from($(event.target).find(".property")).map((p, i) => filters[i].property = p.value)

        // Add value to each element in the filter array
        Array.from($(event.target).find(".value")).map((p, i) => filters[i].value = p.value)

        filters = filters.filter(f => f.property)
        let groups = this.object.item.groups
        let generic = {type: "generic", name : formData.name, filters}
        if (this.object.index)
            equipment[this.object.index] = generic
        else 
        {
            equipment.push(generic)
            // Add new index to groups (last index + 1)
            groups = this.object.item.addToGroup({type : "item", index : (equipment.length - 1 || 0)})
        }


        this.object.item.update({"data.equipment" : equipment, "data.groups" : groups})
    }


    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".add-filter").click(async ev => {
            await this._updateObject(ev, new FormDataExtended(this.form))
            let equipment = duplicate(this.object.item.equipment)
            let generic = equipment[this.object.index || 0]
            generic.filters.push({test : "", property: ""})

            //  // Add new index to groups (last index + 1)
            // let groups = this.object.addToGroup({type : "item", index : (equipment.length - 1 || 0)})
            
            await this.object.item.update({"data.equipment" : equipment})
            this.render(true);
        })
    }


}