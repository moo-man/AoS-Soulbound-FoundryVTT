export default class AgeOfSigmarEffect extends ActiveEffect {


    prepareData()
    {
        if (game.ready && this.item && this.item.equippable && this.requiresEquip && !this.parent.pack)
            this.data.disabled = !this.item.equipped
            //this.data.update({"disabled" : !this.item.equipped})
    }

    /** @override 
     * Adds support for referencing actor data
     * */
    apply(actor, change) {
        if (change.value.includes("@"))
        {
            if (change.value == "@doom" && !game.ready)
                actor.postReadyEffects.push(change)
            else
                actor.derivedEffects.push(change)

        }
        else
            super.apply(actor, change)
    }

    fillDerivedData(actor, change) {
        change.value = eval(Roll.replaceFormulaData(change.value, actor.getRollData()))
    }

    get item() {
        if (this.parent && this.parent.documentName == "Item")
            return this.parent
        else if (this.data.origin && this.parent.documentName == "Actor") 
        {
            let origin = this.data.origin.split(".")
            if (origin[1] == this.parent.id) // If origin ID is same as parent ID
            {
                if (origin[3])
                {
                    return this.parent.items.get(origin[3])
                }
            }
        }
    }

    get label() {
        return this.data.label
    }

    get description() {
        return getProperty(this.data, "flags.age-of-sigmar-soulbound.description")
    }

    get hasRollEffect() {
        return this.data.changes.some(c => c.mode == 0)
    }

    get sourceName() {
        if (!this.data.origin)
            return super.sourceName

        let data = this.data.origin.split(".")

        if (data.length == 4) {
            let item = this.parent.items.get(data[3])
            if (item)
                return item.name
            else
                return super.sourceName;
        }
    }

    get requiresEquip() {
        return this.getFlag("age-of-sigmar-soulbound", "requiresEquip")
    }

    get isCondition() {
        return CONFIG.statusEffects.map(i => i.id).includes(this.getFlag("core", "statusId"))
    }

    static get numericTypes() {
        return ["difficulty",
            "complexity",
            "bonusDice",
            "bonusDamage",
            "armour",
            "defense",
            "attack"]
    }

}