export default class AgeOfSigmarEffect extends ActiveEffect {

  /** @override 
   * Adds support for referencing actor data
   * */ 
  apply(actor, change) {
    if (change.value.includes("@"))
        actor.derivedEffects.push((change))
    else 
        super.apply(actor, change)
  }
 
  fillDerivedData(actor, change)
  {
      change.value = eval(Roll.replaceFormulaData(change.value, actor.getRollData()))
  }

  /** @override 
   * Adds support for referencing actor data
   * */ 
  _applyAdd(actor, change) {
    let  {key, value} = change;
    const current = foundry.utils.getProperty(actor.data, key) ?? null;
    const ct = foundry.utils.getType(current);
    let update = null;

    if (value[0] == "@")
        value = getProperty(actor.data, value.slice(1))

    // Handle different types of the current data
    switch ( ct ) {
      case "null":
        update = value;
        break;
      case "string":
        update = current + String(value);
        break;
      case "number":
        if ( Number.isNumeric(value) ) update = current + Number(value);
        break;
      case "Array":
        const at = foundry.utils.getType(current[0]);
        if ( !current.length || (foundry.utils.getType(value) === at) ) update = current.concat([value]);
    }
    if ( update !== null ) foundry.utils.setProperty(actor.data, key, update);
    return update;
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

    
    get isCondition()
    {
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