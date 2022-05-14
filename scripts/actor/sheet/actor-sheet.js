import ActorConfigure from "../../apps/actor-configure.js";
import SpeedConfig from "../../apps/speed-config.js";

export class AgeOfSigmarActorSheet extends ActorSheet {


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "actor"],
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-content",
                    initial: "main",
                },
            ],
            scrollY: [".sheet-content"]
        });
    }

    getData() {
        const data = super.getData();
        data.data = data.data.data; // project system data so that handlebars has the same name and value paths
        this.constructEffectLists(data)
        this.constructItemLists(data)

        if (this.actor.type != "party")
        {
            this._addWoundImages(data)
            this._orderSkills(data)
            this._addPowerBar(data)
        }
        return data;
      }

    _addWoundImages(sheetData)
    {
        sheetData.data.combat.wounds.map(i => {
            switch (i.type) {
                case "minor": i.img = "icons/skills/wounds/blood-spurt-spray-red.webp"
                    break;
                case "serious": i.img = "icons/skills/wounds/injury-triple-slash-bleed.webp"
                    break;
                case "deadly": i.img = "icons/skills/wounds/injury-pain-body-orange.webp"
                    break;
                default: i.img = "icons/skills/wounds/blood-spurt-spray-red.webp"
                    break;
            }
            return i
        })
    }

    _orderSkills(sheetData)
    {
        let skills = Object.values(sheetData.data.skills);        
        skills.forEach(x => x.label = game.i18n.localize(x.label));
        skills.sort((x, y) => x.label.localeCompare(y.label, game.i18n.lang));

        let middle = skills.length / 2;
        let i = 0;
        for (let skill of skills) {
            skill.isLeft = i < middle;
            skill.isRight = i >= middle;
            i++;
        }
    }

    _addPowerBar(sheetData)
    {
        sheetData.data.power.pct = (sheetData.data.power.consumed / sheetData.data.power.capacity) * 100;
        if (sheetData.data.power.pct <= 30)
            sheetData.data.power.state = "low";
        else if (sheetData.data.power.pct <= 70)
            sheetData.data.power.state = "medium";
        else if (sheetData.data.power.pct <= 100)
            sheetData.data.power.state = "high";
        else if (sheetData.data.power.pct > 100)
            sheetData.data.power.state = "over";

    }

    constructItemLists(sheetData) 
    {
        let items = {}
        items.equipped = {}

        items.aethericDevices = this.actor.getItemTypes("aethericDevice")
        items.armour = this.actor.getItemTypes("armour")
        items.equipment = this.actor.getItemTypes("equipment")
        items.goals = this.actor.getItemTypes("partyItem").filter(i => i.category == "shortGoal" || i.category == "longGoal")
        items.miracles = this.actor.getItemTypes("miracle")
        items.runes = this.actor.getItemTypes("rune")
        items.spells = this.actor.getItemTypes("spell")
        items.talents = this.actor.getItemTypes("talent")
        items.weapons = this.actor.getItemTypes("weapon")
        items.partyItems = this.actor.getItemTypes("partyItem")

        items.equipped.weapons = this.actor.getItemTypes("weapon").filter(i => i.equipped)
        items.equipped.armour = this.actor.getItemTypes("armour").filter(i => i.equipped)

        items.attacks = items.equipped.weapons.concat(items.aethericDevices.filter(i => i.damage && i.equipped))

        this._sortItemLists(items)

        sheetData.items = items;
    }

    
    constructEffectLists(sheetData) 
    {
        let effects = {}

        effects.temporary = sheetData.actor.effects.filter(i => i.isTemporary && !i.data.disabled && !i.isCondition)
        effects.disabled = sheetData.actor.effects.filter(i => i.data.disabled)
        effects.passive = sheetData.actor.effects.filter(i => !i.isTemporary && !i.data.disabled && !i.isCondition)
        effects.conditions = CONFIG.statusEffects.map(i => {
            return {
                label : i.label,
                key : i.id,
                img : i.icon,
                existing : this.actor.hasCondition(i.id),
                tooltip : game.aos.config.conditionDescriptions[i.id]
            }
        })

        sheetData.effects = effects;
    }

    _sortItemLists(items)
    {
        for(let list in items)
        {
            if (Array.isArray(items[list]))
                items[list] = items[list].sort((a, b) => a.data.sort - b.data.sort)
            else if (typeof items[list] == "object")
               this._sortItemLists(items[list])
        }
    }

    _getSubmitData(updateData = {}) {
        this.actor.overrides = {}
        let data = super._getSubmitData(updateData);
        data = diffObject(flattenObject(this.actor.toObject(false)), data)
        return data
      }

      async _onDrop(ev)
      {
          let data = ev.dataTransfer.getData("text/plain")
          data = JSON.parse(data)
          if (data.type == "itemDrop")
          {
              return this.actor.createEmbeddedDocuments("Item", [data.payload])
          }
          else if (data.type == "Item") {
              let item = await Item.implementation.fromDropData(data);
              if (item.type == "archetype" && this.actor.type == "player")
                  return this.actor.characterCreation(item)
              if (item.type == "archetype" && this.actor.type == "npc")
                  return this.actor.applyArchetype(item)
          }
          super._onDrop(ev)

      }
    

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item-edit").click(this._onItemEdit.bind(this));
        html.find(".item-edit-right").contextmenu(this._onItemEdit.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-post").click(this._onItemPost.bind(this));
        //html.find(".item-property").click(this._onChangeItemProperty.bind(this));
        html.find(".effect-create").click(this._onEffectCreate.bind(this));  
        html.find(".effect-edit").click(this._onEffectEdit.bind(this));  
        html.find(".effect-delete").click(this._onEffectDelete.bind(this));  
        html.find(".effect-toggle").click(this._onEffectToggle.bind(this));  
        html.find("input").focusin(this._onFocusIn.bind(this));
        html.find(".item-state").click(this._onItemStateUpdate.bind(this));
        html.find(".item-toggle").click(this._onItemToggle.bind(this));
        html.find(".roll-attribute").click(this._onAttributeClick.bind(this));
        html.find(".roll-skill").click(this._onSkillClick.bind(this));
        html.find(".roll-weapon").click(this._onWeaponClick.bind(this));
        html.find(".roll-power").click(this._onSpellMiracleClick.bind(this));
        html.find(".show-power").click(this._prepareShowPower.bind(this));
        html.find(".wound-create").click(this._onWoundCreate.bind(this));
        html.find(".wound-delete").click(this._onWoundDelete.bind(this));
        html.find(".wound-edit").change(this._onWoundEdit.bind(this));
        html.find(".speed-config").click(this._onSpeedConfigClick.bind(this));
        html.find(".condition-toggle").click(this._onConditionToggle.bind(this));
        html.find(".condition-click").click(this._onConditionClick.bind(this));
        html.find(".item-dropdown").click(this._onDropdownClick.bind(this))
        html.find(".item-dropdown-right").contextmenu(this._onDropdownClick.bind(this))
        html.find(".item-trait").click(this._onTraitClick.bind(this))
        html.find(".transfer-effect").click(this._onTransferEffectClick.bind(this))
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
                {
                    class: "configure",
                    icon: "fas fa-wrench",
                    onclick: async (ev) => new ActorConfigure(this.actor).render(true)
                }
            ].concat(buttons);
        }
        return buttons;
    }

    _onFocusIn(event) {
        $(event.currentTarget).select();
    }

    _onItemCreate(event) {
        event.preventDefault();
        let header = event.currentTarget.dataset
        
        let data = {
             name : `${game.i18n.localize("ITEM.NEW")} ${game.i18n.localize(CONFIG.Item.typeLabels[header.type])}`,
             type : header.type
        };

        if (data.type == "goal")
            data.type = "partyItem"

        if (header.category)
            data["data.category"] = header.category
        this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: true });
    }

    _onItemEdit(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        item.sheet.render(true);
    }

    _onItemDelete(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");

        new Dialog({
            title : game.i18n.localize("DIALOG.ITEM_DELETE"),
            content : `<p>${game.i18n.localize("DIALOG.ITEM_DELETE_PROMPT")}</p>`,
            buttons : {
                "yes" : {
                    label : game.i18n.localize("BUTTON.YES"),
                    callback: () => {
                        this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
                        div.slideUp(200, () => this.render(false));
                    }
                },
                "cancel" : {
                    label : game.i18n.localize("BUTTON.CANCEL"),
                    callback : () => {}
                },
            },
            default: "yes"
        }).render(true)

    }

    
    _onItemPost(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        let item = this.actor.items.get(div.data("itemId"));
        item.sendToChat()
    }


    _onChangeItemProperty(event) {
        const itemId = $(event.currentTarget).parents(".item").data("itemId");
        const target = $(event.currentTarget).data("target")
        let item = this.actor.items.get(itemId)
        return item.update({[target] : event.target.value})
    }

    async _onEffectCreate(ev) {
        let type = ev.currentTarget.attributes["data-type"].value
        let effectData = { label: game.i18n.localize("QUICKEFFECT.NEW") , icon: "icons/svg/aura.svg"}
        if (type == "temporary") {
            effectData["duration.rounds"] = 1;
          }

        let html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/quick-effect.html")
        let dialog = new Dialog({
            title : game.i18n.localize("QUICKEFFECT.TITLE"),
            content : html,
            buttons : {
                "create" : {
                    label : game.i18n.localize("BUTTON.CREATE"),
                    callback : html => {
                        let mode = 2
                        let label = html.find(".label").val()
                        let key = html.find(".key").val()
                        let value = parseInt(html.find(".modifier").val())
                        effectData.label = label
                        effectData.changes = [{key, mode, value}]
                        this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
                    }
                },
                "skip" : {
                    label : game.i18n.localize("BUTTON.SKIP"),
                    callback : () => this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
                }
            }
        })
        await dialog._render(true)
        dialog._element.find(".label").select() 
      }

    _onEffectEdit(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
        this.object.effects.get(id).sheet.render(true)
    }

    _onEffectDelete(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
        this.object.deleteEmbeddedDocuments("ActiveEffect", [id])
    }

    _onEffectToggle(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
        let effect = this.object.effects.get(id)

        effect.update({"disabled" : !effect.data.disabled})
    }

    _onItemStateUpdate(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        let data;
        switch (item.state) {
            case "active":
                data = { _id: item.id, "data.state": "equipped"};
                break;
            case "equipped":
                data = { _id: item.id, "data.state": "other"};
                break;
            default:
                data = { _id: item.id, "data.state": "active"};
                break;
        }
        return this.actor.updateEmbeddedDocuments("Item", [data]);
    }

    _onItemToggle(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const target = event.currentTarget.dataset["target"]
        const item = this.actor.items.get(div.data("itemId"));
        item.update({[target] : !getProperty(item.data, target)})
    }

    async _onAttributeClick(event) {
        event.preventDefault();
        const attribute = $(event.currentTarget).data("attribute");
        let test = await this.actor.setupAttributeTest(attribute)
        await test.rollTest()
        test.sendToChat()
    }

    async _onSkillClick(event) {
        event.preventDefault();
        const skill = $(event.currentTarget).data("skill");
        let test = await this.actor.setupSkillTest(skill)
        await test.rollTest()
        test.sendToChat()
    }

    async _onWeaponClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weaponId = div.data("itemId");
        let test = await this.actor.setupCombatTest(weaponId)
        await test.rollTest()
        test.sendToChat()
    }

    async _onSpellMiracleClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const powerId = div.data("itemId");
        let item = this.actor.items.get(powerId)

        let test
        if (item.type == "spell")
            test = await this.actor.setupSpellTest(powerId)
        else if (item.type == "miracle")
            test = await this.actor.setupMiracleTest(powerId)

        await test.rollTest()
        test.sendToChat()
    }
	
	_prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        power.sendToChat()
    }

    _onWoundCreate(ev) { return this.actor.addWound("", 0) }

    _onWoundDelete(ev)
    {
        let wounds = duplicate(this.actor.combat.wounds)
        let index = $(ev.currentTarget).parents(".item").data("index")
        wounds.splice(index, 1)
        return this.actor.update({"data.combat.wounds" : wounds})
    }

    _onWoundEdit(ev)
    {
        let target = ev.currentTarget
        let type = target.dataset["editType"]
        let wounds = duplicate(this.actor.combat.wounds)
        let index = $(ev.currentTarget).parents(".item").data("index")

        if (type == "type")
        {
            wounds[index].type = ev.target.value
            wounds[index].damage = game.aos.config.woundDamage[ev.target.value] || 0
        }
        else if (type == "value")
        {
            wounds[index].damage = parseInt(ev.currentTarget.value)
        }
        return this.actor.update({"data.combat.wounds" : wounds})
    }
    
    _onSpeedConfigClick(ev) {
        new SpeedConfig(this.actor).render(true)
    }

    _onConditionToggle(ev)
    {
        let key = $(ev.currentTarget).parents(".condition").data("key")
        if (this.actor.hasCondition(key))
            this.actor.removeCondition(key)
        else 
            this.actor.addCondition(key);
    }
    
    _onConditionClick(ev)
    {
        let key = $(ev.currentTarget).parents(".condition").data("key")
        let effect = CONFIG.statusEffects.find(i => i.id == key)
        if (effect)
        {
            let journal = game.journal.getName(effect.label)
            if (journal)
                journal.sheet.render(true)
        }
    }

    _onDropdownClick(ev)
    {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        return this._dropdown(ev, item.dropdownData())
    }


    _onTraitClick(ev)
    {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        let text = ev.target.text.trim()
        let trait = Object.values(item.traitList).find(i => i.display == text)
        this._dropdown(ev, {text : trait.description || game.aos.config.traitDescriptions[trait.name]})
    }


    async _dropdown(event, dropdownData) {
        let dropdownHTML = ""
        event.preventDefault()
        let li = $(event.currentTarget).parents(".item")
        let target = li.find(".dropdown-target")
        // Toggle expansion for an item
        if (li.hasClass("expanded")) // If expansion already shown - switch to description
        {
            let summary = li.children(".item-summary");
            summary.slideUp(200, () => {
                summary.remove()
                target.slideDown(200)
                target.show()
            });

        } else {
            // Add a div with the item summary belowe the item
            let div
            if (!dropdownData) {
                return
            } else {
                dropdownHTML = `<div class="item-summary">${TextEditor.enrichHTML(dropdownData.text)}`;
            }
            if (dropdownData.groups) {

            }
            dropdownHTML += "</div>"
            div = $(dropdownHTML)
            li.append(div.hide());
            if (target.length)
            {
                target.slideUp(200, () => {
                    target.hide()
                    div.slideDown(200);
                })
            }
            else 
                div.slideDown(200);
                
        }
        li.toggleClass("expanded");
    }

    _onTransferEffectClick(ev) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        let effects = item.nonTransferEffects.map(i => i.toObject())
        effects.forEach(i => i["flags.core.statusId"] = i.label.slugify())
        canvas.tokens.controlled.forEach(token => {
            token.actor.createEmbeddedDocuments("ActiveEffect", effects)
        })
    }

}