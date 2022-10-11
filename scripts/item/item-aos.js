import SoulboundUtility from "../system/utility.js";

export class AgeOfSigmarItem extends Item {
    

    constructor(data, context)
    {
        super(data, context)
        if (context && context.archetype)
        {
            this.archetype = context.archetype.item;
            this.archetypeItemIndex = context.archetype.index;
            this.archetypeItemPath = context.archetype.path
        }
    }

  // Upon creation, assign a blank image if item is new (not duplicated) instead of mystery-man default
  async _preCreate(data, options, user) {
    if (data._id && !this.isOwned)
      options.keepId = SoulboundUtility._keepID(data._id, this)

    await super._preCreate(data, options, user)
    
    }

    /**
     * Override update to account for archetype parent
     */
    async update(data={}, context={}) 
    {
        // If this item is from an archetype entry, update the diff instead of the actual item
        // I would like to have done this is the item's _preCreate but the item seems to lose 
        // its "archetype" reference so it has to be done here
        // TODO: Current Issue - changing a property, then changing back to the original value
        // does not work due to `diffObject()`

        if (this.archetype) {
            // Get the archetype's equipment, find the corresponding object, add to its diff

            let list = duplicate(getProperty(this.archetype.data, this.archetypeItemPath))
            let item = list[this.archetypeItemIndex];
            mergeObject( // Merge current diff with new diff
            item.diff,
            diffObject(this.toObject(), data),
            { overwrite: true })
    
            // If the diff includes the item's name, change the name stored in the archetype
            if (item.diff.name)
            item.name = item.diff.name
            else
            item.name = this.name

            this.archetype.update({ [`${this.archetypeItemPath}`]: list })
            data={}
        }
        return super.update(data, context)
    }

    prepareData() {
        super.prepareData()
    }

    prepareOwnedData() {
        let functionName = `prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`

        if (this[functionName])
            this[functionName]()

        if (this.isAttack)
            this.prepareAttack()
    }

    prepareAttack() {
        if (this.category === "melee") {
            this.pool = this.actor.skills.weaponSkill.total;
            this.focus = this.actor.skills.weaponSkill.focus;
        } else {
            this.pool = this.actor.skills.ballisticSkill.total;
            this.focus = this.actor.skills.ballisticSkill.focus;
        }
        if(this.isSwarm) {
            this.pool += this.actor.combat.health.toughness.value;
        }
    }

    async addCondition(effect) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
    
        let existing = this.hasCondition(effect.id)
    
        if (!existing) {
          effect.label = game.i18n.localize(effect.label)
          effect["flags.core.statusId"] = effect.id;
          delete effect.id
          return this.createEmbeddedDocuments("ActiveEffect", [effect])
        }
      }
    
      async removeCondition(effect, value = 1) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
        let existing = this.hasCondition(effect.id)
    
        if (existing) {
          return existing.delete()
        }
      }
    
    
      hasCondition(conditionKey) {
        let existing = this.effects.find(i => i.getFlag("core", "statusId") == conditionKey)
        return existing
      }



    addToGroup(object)
    {
        let groups = duplicate(this.groups)
        object.groupId = randomID()
        groups.items.push(object)
        return groups
    }

    resetGroups()
    {
        this.update({ "system.groups": {type: "and", groupId: "root", items : Array.fromRange(this.equipment.length).map(i => {return {type: "item", index : i, groupId : randomID()}})} }) // Reset item groupings
    }



    async sendToChat() {
        const item = new CONFIG.Item.documentClass(this._source);
        if (item.img.includes("/unknown")) {
            item.img = null;
        }

        const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/chat/item.html", { item, data: item.system });
        const chatData = {
            user: game.user.id,
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
            "flags.age-of-sigmar-soulbound.itemData" : this.toObject()
        };

        ChatMessage.applyRollMode(chatData, chatData.rollMode)
        ChatMessage.create(chatData);
    }

    
    dropdownData()
    {
        return {text : this.description}
    }


    // @@@@@@ FORMATTED GETTERs @@@@@@
    get State() {
        switch (this.type) {
            case "ally":
                return game.i18n.localize("STATE.ALIVE");
            case "enemy":
                return game.i18n.localize("STATE.ALIVE");
            case "resource":
                return game.i18n.localize("STATE.ACTIVE");
            case "rumour":
                return game.i18n.localize("STATE.ACTIVE");
            case "fear":
                return game.i18n.localize("STATE.ACTIVE");
            case "threat":
                return game.i18n.localize("STATE.ACTIVE");
            default:
                return game.i18n.localize("HEADER.STATE");
        }
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

    get DN() {
        return this.dn.split("").map(i => i.trim()).filter(i => i).join("")
    }

    get Test() {
        let test = this.test
        return `DN ${test.dn} ${game.aos.config.attributes[test.attribute]} (${game.aos.config.skills[test.skill]})`
    }

    get Damage() {
        if (this.damage)
            return this.damage.toUpperCase().split("").filter(i => i).join(" ")
    }

    get Duration() {
        if (this.type == "spell")
            return `${this.duration.value} ${game.aos.config.durations[this.duration.unit]}${this.duration.value > 0 ? "s" : "" }`
        else if (this.type == "miracle")
            return this.duration
    }

    get Range() {
        return game.aos.config.range[this.range]
    }

    get Type() {
        if (this.type == "armour")
            return game.aos.config.armourType[this.subtype]
    }

    get Availability() {
            return game.aos.config.availability[this.availability]
    }

    get Category() {
        if (this.type == "weapon" || this.type == "aethericDevice")
            return this.category == "melee" ? "Melee" : "Ranged"
        if (this.type == "armour")
            return game.aos.config.armourType[this.category]
        if (this.type == "partyItem")
            return game.aos.config.partyItemCategories[this.category]
    }

    async GetArchetypeItems() {
        let items = [];
        // Get all archetype talents, merge with diff
        let talents = this.talents.core.concat(this.talents.list)
        items = items.concat(talents.map(async t => {
            let item = (await game.aos.utility.findItem(t.id, "talent"))?.toObject();
            if (item)
                mergeObject(item, t.diff, {overwrite : true})
            return item
        }))

        // Get all archetype talents, merge with diff
        items = items.concat(this.equipment.map( async i => {
            let item = (await game.aos.utility.findItem(i.id, "equipment"))?.toObject();
            if (item)
                mergeObject(item, i.diff, {overwrite : true})
            return item
        }))

        return (await Promise.all(items)).filter(i => i);
    }

    get OvercastString() {
        let optionDescriptions = this.overcasts.map(i => i.description)
        if (optionDescriptions.length >= 3)
        {
            let lastDescription = optionDescriptions[optionDescriptions.length - 1]
            optionDescriptions.splice(optionDescriptions.length - 1, 1)
            return optionDescriptions.join(", ") + ", or " + lastDescription
        }
        else if (optionDescriptions.length == 2)
        {
            return optionDescriptions.join(", or ")
        }
        else if (optionDescriptions.length == 1)
        {
            return optionDescriptions[0]
        }
        else 
            return ""
    }

    get Journal() {
        return fromUuid(this.journal)
    }

    async showInJournal() {
        let journal = await this.Journal

        if (journal instanceof JournalEntry)
            return journal.sheet.render(true)
        else if (journal instanceof JournalEntryPage) 
            return journal.showInJournal()

    }

    get difficultyNumber()
    {
        return game.aos.utility.DNToObject(this.dn)
    }

    get nonTransferEffects() {
        return this.effects.filter(i => !i.transfer)
    }

    
    get equippable() { return hasProperty(this, "system.equipped") }
    // @@@@@@ TYPE GETTERS @@@@@@
    /************** ITEMS *********************/
    get isTalent() { return this.type === "talent" }
    get isGoal() { return this.type === "goal" }
    get isConnection() { return this.type === "connection" }
    get isWound() { return this.type === "wound" }
    get isSpell() { return this.type === "spell" }
    get isMiracle() { return this.type === "miracle" }
    get isPower() { return this.isSpell || this.isMiracle }
    /************** PARTY ITEMS *********************/
    get isShortGoal() { return this.type === "goal" && this.subtype === "short" }
    get isLongGoal() { return this.type === "goal" && this.subtype === "long" }
    get isAlly() { return this.type === "ally" }
    get isEnemy() { return this.type === "enemy" }
    get isResource() { return this.type === "resource" }
    get isRumour() { return this.type === "rumour" }
    get isFear() { return this.type === "fear" }
    get isThreat() { return this.type === "threat" }
    get isActive() { return this.state === "active" }
    /************** GEAR *********************/
    get isEquipped() { return this.system.equipped }
    get isArmour() { return this.type === "armour" }
    get isWeapon() { return this.type === "weapon" }
    get isAethericDevice() { return this.type === "aethericDevice" }
    get isAttack() { return this.isWeapon || (this.isAethericDevice && this.damage) }
    get isRune() { return this.type === "rune" }
    get isEquipment() { return this.type === "equipment" }

    get hasTest() {
        if (this.type == "miracle" && (!this.test.attribute || !this.test.skill))
            return false
        else if (this.type != "miracle" && (!this.test || !this.test.dn || !this.test.dn.includes(":"))) 
            return false;
        if (!game.aos.config.attributes[this.test.attribute])
            return false;
        return true;
    }

    // @@@@@@ DATA GETTERS @@@@@@
    get bonus() { return this.system.bonus }
    get description() { return this.system.description }
    get cost() { return this.system.cost }
    get availability() { return this.system.availability }
    get power() { return this.system.power }
    get requirements() { return this.system.requirements }
    get crafting() { return this.system.crafting }
    get damage() { return this.system.damage }
    get traits() { return this.system.traits }
    get state() { return this.system.state }
    get subtype() { return this.system.type }
    get benefit() { return this.system.benefit }
    get completed() { return this.system.completed }
    get target() { return this.system.target }
    get range() { return this.system.range }
    get duration() { return this.system.duration }
    get effect() { return this.system.effect }
    get god() { return this.system.god }
    get dn() { return this.system.dn }
    get test() { return this.system.test }
    get overcast() { return this.system.overcast }
    get overcasts() { return this.system.overcasts }
    get lore() { return this.system.lore }
    get requirement() { return this.system.requirement }
    get category() { return this.system.category }
    get equipped() { return this.system.equipped }
    get armour() { return this.system.armour }
    get attributes() {return this.system.attributes}
    get species() {return this.system.species}
    get skills() {return this.system.skills}
    get talents() {return this.system.talents}
    get equipment() {return this.system.equipment}
    get groups() {return this.system.groups}
    get journal() {return this.system.journal}
    get free() {return this.system.free}




        /**
   * Transform the Document data to be stored in a Compendium pack.
   * Remove any features of the data which are world-specific.
   * This function is asynchronous in case any complex operations are required prior to exporting.
   * @param {CompendiumCollection} [pack]   A specific pack being exported to
   * @return {object}                       A data object of cleaned data suitable for compendium import
   * @memberof ClientDocumentMixin#
   * @override - Retain ID
   */
  toCompendium(pack) {
    let data = super.toCompendium(pack)
    data._id = this.id; // Replace deleted ID so it is preserved
    return data;
  }
}