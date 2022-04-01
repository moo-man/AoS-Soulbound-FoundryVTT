import { RollDialog, CombatDialog, SpellDialog } from "../system/dialog.js";
import Test from "../system/tests/test.js";
import CombatTest from "../system/tests/combat-test.js";
import SpellTest from "../system/tests/spell-test.js";
import MiracleTest from "../system/tests/miracle-test.js";
import SoulboundUtility from "../system/utility.js";
import CharacterCreation from "../apps/character-creation.js";

export class AgeOfSigmarActor extends Actor {

    async _preCreate(data, options, user) {
        if (data._id)
            options.keepId = SoulboundUtility._keepID(data._id, this)
        
            await super._preCreate(data, options, user)

        let initData = {
            "token.bar1" :{ "attribute" : "combat.health.toughness" },
            "token.bar2" :{ "attribute" : "combat.health.wounds" },
            "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "token.name" : data.name
        }
        if (data.type === "player") {
            initData["token.vision"] = true;
            initData["token.actorLink"] = true;
        }
        else if (data.type === "npc") {
            initData["flags.age-of-sigmar-soulbound.autoCalcTokenSize"] = true
        }
        this.data.update(initData)
    }

    async _preUpdate(updateData, options, user) {
        await super._preUpdate(updateData, options, user)

            // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.data.token.img.includes("modules/soulbound-core/assets/tokens/unknown") && updateData.img && !updateData.token?.img) {
            updateData["token.img"] = updateData.img;
        }

        this.handleScrollingText(updateData)
    }


    handleScrollingText(data) {
        try {

            if (hasProperty(data, "data.combat.health.toughness.value"))
                this._displayScrollingChange(getProperty(data, "data.combat.health.toughness.value") - this.combat.health.toughness.value);
            if (hasProperty(data, "data.combat.mettle.value"))
                this._displayScrollingChange(getProperty(data, "data.combat.mettle.value") - this.combat.mettle.value, { mettle: true });
        }
        catch (e) {
            console.error(game.i18n.localize("ERROR.ScrollingText"), data, e)
        }
    }


    prepareData() {
        this.derivedEffects = [];
        this.postReadyEffects = []

        if (game.ready && this.type != "party")
            this.data.update({"data.doom" : game.counter.doom}) // Add doom to actor data so it can be used with effects

        super.prepareData();

        if (this.type === "player" || this.type === "npc") {
            this._computeItems();
            this._computeRelativeCombatAbilities();
        }
        if (this.type==="npc")
            this._sizeToken()

        if(this.type === "player") {
            this.computeSpentExperience();
        }
    }


    prepareBaseData() {
        if (this.type === "player" || this.type === "npc")
            this._initializeData();
    }

    prepareDerivedData() {
        this.applyDerivedEffects()
        if (this.type === "player" || this.type === "npc")
        {
            this._computeSkillTotals();
            this._computeSecondary();
        }
    }

    _initializeData() {
        this.combat.melee.total = 0;
        this.combat.melee.relative = 0;
        this.combat.accuracy.total = 0;
        this.combat.accuracy.relative = 0;
        this.combat.defence.total = 0;
        this.combat.defence.relative = 0;
        this.combat.armour.value = 0;
        if(!this.isSwarm) //Wenn set to Swarm max is editable don't reset it
            this.combat.health.toughness.max = 0;        
        this.combat.health.wounds.value = 0;
        this.combat.health.wounds.max = 0;
        this.combat.initiative.total = 0;
        this.combat.naturalAwareness.total = 0;
        this.combat.mettle.max = 0;
        this.combat.damage = 0;
        this.power.consumed = 0,
        this.power.capacity = 0,
        this.power.isUndercharge = false
    }

    _computeRelativeCombatAbilities() {
        this.combat.melee.relative = this._getCombatLadderValue("melee");
        this.combat.accuracy.relative = this._getCombatLadderValue("accuracy");
        this.combat.defence.relative = this._getCombatLadderValue("defence");

        this.combat.melee.ability = this._getCombatAbility("melee")
        this.combat.accuracy.ability = this._getCombatAbility("accuracy")
        this.combat.defence.ability = this._getCombatAbility("defence")
    }
    
    _getCombatAbility(combatStat)
    {
        let value = this.combat[combatStat].relative
        switch(value) {
            case 1: return `${game.i18n.localize("ABILITIES.POOR")} (1)`; 
            case 2: return `${game.i18n.localize("ABILITIES.AVERAGE")} (2)`;
            case 3: return `${game.i18n.localize("ABILITIES.GOOD")} (3)`;
            case 4: return `${game.i18n.localize("ABILITIES.GREAT")} (4)`;
            case 5: return `${game.i18n.localize("ABILITIES.SUPERB")} (5)`;
            case 6: return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (6)`;
            default : return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (${value})`;
        }
    }

    _getCombatLadderValue(combatStat) {
        let value = this.combat[combatStat].total

        if(value <= 2)
            return 1;
        else if(value <= 4) {
            return 2;
        } else if(value <= 6) {
            return 3;
        } else if(value <= 8) {
            return 4;
        } else if(value <= 10) {
            return 5;
        } else {
            return 6;
        }
    }

    _computeSkillTotals() {
        for (let skillKey in this.skills) {
            let skill = this.skills[skillKey]
            skill.value = skill.training + this.attributes[game.aos.config.skillAttributes[skillKey]].value + skill.bonus;
        }
    }

    _computeItems() {
        this.combat.wounds.forEach(i => {
            this.combat.health.wounds.value += i.damage;
        })
        this.items.forEach(item => {
            item.prepareOwnedData()
            if (item.isEquipped)
            {
                if (item.isArmour) this._computeArmour(item);
                if (item.isAethericDevice) this._computeAethericDevice(item);
                if (item.isWeapon) this._computeWeapon(item)
            }
        })
    }
    
    _computeArmour(item) {
        if (item.subtype === "shield") {
            // Like below treat shield benefit as an step increase
            this.combat.defence.total += (item.benefit * 2);
        } else {
            this.combat.armour.value += item.benefit;
        }
    }

    _computeAethericDevice(item) {
        this.power.consumed += item.power.consumption;
        this.power.capacity += item.power.capacity;
        if (item.armour > 0)
            this.combat.armour.value += item.armour
    }

    _computeWeapon(item)
    {
        if(item.traitList.defensive)
            this.combat.defence.total += 2;

    }

    _sizeToken() {
        if(this.isSwarm || !this.autoCalc.tokenSize) return; //Swarms are variable let the GM decide Size

        let size = this.bio.size; 

        if(size <= 2) {
            this.data.token.update({"height" : 1});
            this.data.token.update({"width" : 1});
        } else if(size === 3) {
            this.data.token.update({"height" : 2});
            this.data.token.update({"width" : 2});
        } else if(size === 4) {
            this.data.token.update({"height" : 3});
            this.data.token.update({"width" : 3});
        } else if(size === 5) {
            this.data.token.update({"height" : 4});
            this.data.token.update({"width" : 4});
        }
    }

    _computeSecondary() {
        // melee, accuracy and defence bonus is doubled to represent a one step increase
        this.combat.melee.total +=             this.attributes.body.value + this.skills.weaponSkill.training + (this.combat.melee.bonus * 2);
        this.combat.accuracy.total +=          this.attributes.mind.value + this.skills.ballisticSkill.training + (this.combat.accuracy.bonus * 2);
        this.combat.defence.total +=           this.attributes.body.value + this.skills.reflexes.training + (this.combat.defence.bonus * 2);
        this.combat.armour.value +=            this.combat.armour.bonus;        
        this.combat.initiative.total +=        this.attributes.mind.value + this.skills.awareness.training + this.skills.reflexes.training + this.combat.initiative.bonus;
        this.combat.naturalAwareness.total +=  Math.ceil((this.attributes.mind.value + this.skills.awareness.training) / 2) + this.combat.naturalAwareness.bonus;        
        this.power.isUndercharge =             this.power.consumed > this.power.capacity;
        
        if(this.autoCalc.toughness) {
            this.combat.health.toughness.max += this.attributes.body.value + this.attributes.mind.value + this.attributes.soul.value + this.combat.health.toughness.bonus;
        } else if(this.isSwarm) {
            this.combat.health.toughness.max += this.combat.health.toughness.bonus;            
        } else {
            this.combat.health.toughness.max = 1;
        }
        
        if(this.autoCalc.wounds) {
            this.combat.health.wounds.max += Math.ceil((this.attributes.body.value + this.attributes.mind.value + this.attributes.soul.value) / 2) + this.combat.health.wounds.bonus;
            this.combat.health.wounds.deadly = this.combat.health.wounds.value >= this.combat.health.wounds.max;
        }

        if(this.autoCalc.mettle) {
            this.combat.mettle.max += Math.ceil(this.attributes.soul.value / 2) + this.combat.mettle.bonus;
        }
    }

    computeSpentExperience() {
        if(this.experience.total === undefined) return;

        let spent = 0;
        let costs = game.aos.config.Expcost;

        for(let attribute of Object.values(this.attributes))
        {
            let index = attribute.value >= 1 && attribute.value <= 8 ? attribute.value-1 : 0;
            spent += costs.attributes[index];
        }

        for(let skill of Object.values(this.skills)) {
            spent += this.getSkillCost(costs, skill.training);            
            spent += this.getSkillCost(costs, skill.focus);
        }

        let tam = this.items.filter(x => x.isTalent || x.isMiracle);

        spent += tam.length * costs.talentsAndMiracles;

        this.experience.spent = spent;
        this.experience.outstanding = this.experience.total - spent;
    }

    getSkillCost(costs, val) {
        let index = val >= 1 && val <= 3 ? val : 0;
        return costs.skillAndFokus[index];
    }

    applyDerivedEffects() {
        this.derivedEffects.forEach(change => {
            change.effect.fillDerivedData(this, change)
            change.effect.apply(this, change);
        })
    }

    characterCreation(archetype)
    {
        new Dialog({
            title : game.i18n.localize("HEADER.CHARGEN"),
            content : `<p>${game.i18n.localize("CHARGEN.PROMPT")}</p>`,
            buttons : {
                yes : {
                    label: game.i18n.localize("BUTTON.YES"),
                    callback: () => {
                        new CharacterCreation({actor: this, archetype}).render(true)
                    }
                },
                no : {
                    label : game.i18n.localize("BUTTON.NO"),
                    callback: () => {
                        this.update({"data.bio.archetype" : archetype.name, })
                        this.createEmbeddedDocuments("Item", [archetype.toObject()])
                    }
                }
            }
        }).render(true)
    }

    async applyArchetype(archetype) {

        ui.notifications.notify(`${game.i18n.localize("CHARGEN.APPLYING")} ${archetype.name} ${game.i18n.localize("BIO.ARCHETYPE")}`)

        let items = [];
        let actorData = this.toObject();

        actorData.data.bio.faction = archetype.species

        actorData.data.attributes.body.value = archetype.attributes.body
        actorData.data.attributes.mind.value = archetype.attributes.mind
        actorData.data.attributes.soul.value = archetype.attributes.soul

        archetype.skills.list.forEach(skill => {
            actorData.data.skills[skill].training = 1
            actorData.data.skills[skill].focus = 1
        })

        actorData.data.skills[archetype.skills.core].training = 2
        actorData.data.skills[archetype.skills.core].focus = 2

        items = items.concat(archetype.ArchetypeItems);

        // Remove IDs so items work within the update method
        items.forEach(i => delete i._id)

        actorData.data.bio.type = 3; // Champion

        // Fill toughness and mettle so it doesn't start as 0 (not really ideal though, doesnt't take into account effects)
        actorData.data.combat.health.toughness.value = archetype.attributes.body + archetype.attributes.mind + archetype.attributes.soul
        actorData.data.combat.mettle.value = Math.ceil(archetype.attributes.soul / 2)

        actorData.img = archetype.data.img
        actorData.token.img = archetype.data.img.replace("images", "tokens")

        await this.update(actorData)

        // Add items separately so active effects get added seamlessly
        this.createEmbeddedDocuments("Item", items)
    }

    //#region Rolling Setup
    async setupAttributeTest(attribute, options={}) 
    {
        console.log(options)
        let dialogData = RollDialog._dialogData(this, attribute, null, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.attributes[attribute])} ${game.i18n.localize("SKILL.TEST")}`
        let testData = await RollDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new Test(testData)
    }

    async setupSkillTest(skill, attribute, options={}) 
    {
        let dialogData = RollDialog._dialogData(this, attribute || game.aos.config.skillAttributes[skill], skill, options)
        dialogData.title = `${game.i18n.localize(game.aos.config.skills[skill])} ${game.i18n.localize("SKILL.TEST")}`
        let testData = await RollDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new Test(testData)
    }

    async setupCombatTest(weapon, options)
    {
        if (typeof weapon == "string")
            weapon = this.items.get(weapon)

        let dialogData = CombatDialog._dialogData(this, weapon, options)
        dialogData.title = `${weapon.name} ${game.i18n.localize("WEAPON.TEST")}`
        let testData = await CombatDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new CombatTest(testData)
    }

    async setupSpellTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        let dialogData = SpellDialog._dialogData(this, power)
        dialogData.title = `${power.name} ${game.i18n.localize("SPELL.TEST")}`
        let testData = await SpellDialog.create(dialogData);
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new SpellTest(testData)
    }

    async setupMiracleTest(power)
    {
        if (typeof power == "string")
            power = this.items.get(power)

        if (power.cost > this.combat.mettle.value)
            return ui.notifications.error(game.i18n.localize("ERROR.NotEnoughMettle"))

        let dialogData = RollDialog._dialogData(this, "soul", "devotion")
        dialogData.title = `${power.name} ${game.i18n.localize("POWER.TEST")}`
        dialogData.difficulty = game.aos.utility.DNToObject(power.test.dn).difficulty || dialogData.difficulty
        dialogData.complexity = game.aos.utility.DNToObject(power.test.dn).complexity || dialogData.complexity
        let testData = await RollDialog.create(dialogData);
        testData.itemId = power.id
        testData.targets = dialogData.targets
        testData.speaker = this.speakerData()
        return new MiracleTest(testData)
    }
    //#endregion

    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(damage, {ignoreArmour = false, penetrating = 0, ineffective = false, restraining = false}={}) {
        let armour = this.combat.armour.value
        
        armour -= penetrating;
        
        if(armour < 0) { armour = 0; }            

        if (ineffective) armour *= 2;

        damage = ignoreArmour ? damage : damage - armour;

        if (damage < 0)
            damage = 0
        let remaining = this.combat.health.toughness.value - damage;

         // Update the Actor
         const updates = {
            "data.combat.health.toughness.value": remaining >= 0 ? remaining : 0
        };

        if (damage > 0 && restraining)
            await this.addCondition("restrained")

        // Delegate damage application to a hook
        const allowed = Hooks.call("modifyTokenAttribute", {
            attribute: "combat.health.toughness.value",
            value: this.combat.health.toughness.value,
            isDelta: false,
            isBar: true
        }, updates);

        let ret = allowed !== false ? await this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);

        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {
            if (ineffective)
                remaining = -1 // ineffective can only cause minor wounds          
            this.computeNewWound(remaining);
        }
        return ret;
    }

    
    /**
     * applies healing to the actor
     */
    async applyHealing(healing) {

        
         // Update the Actor
         const updates = {};

        if (healing.toughness)
            updates["data.combat.health.toughness.value"] =  Math.min(this.combat.health.toughness.value + healing.toughness, this.combat.health.toughness.max)
        else return

        // Delegate damage application to a hook
        const allowed = Hooks.call("modifyTokenAttribute", {
            attribute: "combat.health.toughness.value",
            value: this.combat.health.toughness.value,
            isDelta: false,
            isBar: true
        }, updates);

        let ret = allowed !== false ? await this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_HEALING", {toughness : healing.toughness, name : this.data.token.name});
        ui.notifications.notify(note);

        return ret;
    }


    /**
     * creates and adds a wound based on how far the actors health has gone below zero
     * @param {int} remaining 
     */
    async computeNewWound(remaining) {

        if (remaining >= 0)
            return

        let type;
        let damage;

        if(remaining === -1) {
            type = "minor"
            damage = 1;
        } else if (remaining >= -4) {
            type = "serious"
            damage = 2;            
        } else {
            type = "deadly"
            damage = 3; 
        }

        //Woundtrack can't go over max so we change the value of the new wound to exactly fill it.
        if((this.combat.health.wounds.value + damage) > this.combat.health.wounds.max) {
            damage = this.combat.health.wounds.max - this.combat.health.wounds.value
        }


        return this.addWound(type, damage)
    }

    // Add new wound according to the given type, 'minor' 'serious' or 'deadly'
    addWound(type = "", damage = 0)
    {
        if (isNaN(damage) && type)
            damage = game.aos.config.woundDamage[type] || 0
        
        let wounds = duplicate(this.combat.wounds)
        wounds.unshift({type, damage})

        this._displayScrollingChange(-1, {wound : type})

        return this.update({"data.combat.wounds" : wounds})
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

    async applyRend(damage, {magicWeapon = false}={}) {

        let armours = this.items.filter(i => i.isEquipped 
                                          && i.subtype !== "shield" // That isn't a shield
                                          && i.benefit !== 0 // not already at zero
                                          && (!i.traitList.magical || (i.traitList.magical && magicWeapon)) // Only nonmagical - unless magic weapon
                                          && (!i.traitList.sigmarite || (i.traitList.sigmarite && magicWeapon))) // Only sigmarite - unless magic weapon
        
        if(armours.length === 0) return ui.notifications.notify(game.i18n.localize("NOTIFICATION.REND_FAIL"));
        
        let sub = damage
        for(let am of armours) {            
            let val = am.benefit - sub;
            sub -= am.benefit;

            
            if(val >= 0) {
                await am.update({"data.benefit": val});
            } else {
                await am.update({"data.benefit": 0}); 
            }
            
            if(sub === 0) break;            
        }
        
        let note = game.i18n.format("NOTIFICATION.APPLY_REND", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);
    }

    getItemTypes(type) {
        return (this.itemCategories || this.itemTypes)[type]
    }

    getDialogChanges({condense = false}={}) {

        // Aggregate dialog changes from each effect
        let changes =  this.effects.filter(i => !i.data.disabled).reduce((prev, current) => prev.concat(current.getDialogChanges({condense, indexOffset : prev.length})), [])

        if (game.user.targets.size > 0)
        {
            let target = Array.from(game.user.targets)[0].actor
            let targetChanges = target.effects.reduce((prev, current) => prev.concat(current.getDialogChanges({target, condense, indexOffset : changes.length})), [])
            changes = changes.concat(targetChanges)
        }

        return changes
    }

       /**
     * Display changes to health as scrolling combat text.
     * Adapt the font size relative to the Actor's HP total to emphasize more significant blows.
     * @param {number} daamge
     * @private
     */
    _displayScrollingChange(change, options={}) {
        if ( !change ) return;
        change = Number(change);
        const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
        for ( let t of tokens ) {
        if ( !t?.hud?.createScrollingText ) continue;  // This is undefined prior to v9-p2

        
        t.hud.createScrollingText(
            options.wound ? // Display Wound text or number
                game.aos.config.woundType[options.wound]
                :
                change.signedString(), 
            {
                anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                fontSize: 30,
                fill: options.mettle ? "0x6666FF" : (change < 0 || options.wound) ?  "0xFF0000" : "0x00FF00", // I regret nothing
                stroke: 0x000000,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }

    get autoCalc() {
        return {
            toughness : this.type == "player" || this.bio.type > 1,
            mettle :  this.type == "player" || this.bio.type > 2,
            wounds :  this.type == "player" || this.bio.type > 3,
            tokenSize : !this.isSwarm && this.getFlag("age-of-sigmar-soulbound", "autoCalcTokenSize")
        }
    }

    speakerData(token) {
        if (token || this.isToken)
        {
            return {
                token : (token?.document || this.token).id,
                scene : (token?.document || this.token).parent.id
            }
        }
        else
        {
            return {
                actor : this.id
            }
        }
    }


    get Speed() {
        let speed = this.combat.speeds
        let display = []
        display.push(`${game.aos.config.speed[speed.foot]}`)

        if (speed.flight != "none")
            display.push(`${game.i18n.localize("HEADER.FLY_SPEED")} (${game.aos.config.speed[speed.flight]})`)

        if (speed.swim != "none")
            display.push(`${game.i18n.localize("HEADER.SWIM_SPEED")} (${game.aos.config.speed[speed.swim]})`)

        return display.join(", ")
        
    }

    get size() {
        if (this.type == "npc")
            return this.bio.size
        else
            return 2
    }

    // @@@@@ BOOLEAN GETTERS @@@@@
    get isSwarm() {return this.bio.type === 0}

    // @@@@@@ DATA GETTERS @@@@@@
    get attributes() {return this.data.data.attributes}
    get skills() {return this.data.data.skills}
    get combat() {return this.data.data.combat}
    get currencies() {return this.data.data.currencies}
    get bio() {return this.data.data.bio}
    get experience() {return this.data.data.experience}
    get notes() {return this.data.data.notes}
    get soulfire() {return this.data.data.soulfire}
    get doom() {return this.data.data.doom}
    get power() {return this.data.data.power}
    get members() {return this.data.data.members || []}


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