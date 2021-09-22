export default class AgeOfSigmarEffect extends ActiveEffect {

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