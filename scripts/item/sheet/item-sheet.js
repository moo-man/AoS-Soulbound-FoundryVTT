import ItemTraits from "../../apps/item-traits.js";
import { SoulboundItem } from "../item-soulbound.js";
import ArchetypeGroups from "../../apps/archetype-groups.js"
import ArchetypeGeneric from "../../apps/archetype-generic.js";

export class SoulboundItemSheet extends WarhammerItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["soulbound", "sheet", "item"],
      width: 420,
      height: 530,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }, {dragSelector: ".journal-list .journalentry", dropSelector: null}],
      scrollY: [".sheet-content"]
    });
  }

  get template() {
    return `systems/age-of-sigmar-soulbound/template/sheet/${this.item.type}.hbs`
  }

  
  async _updateObject(event, formData) {

    // Special processing for archetype items to parse a list of skills available to spend exp on from the checkboxes
    if (this.item.type == "archetype") {
      let skills = []
      this.element.find(".skill-checkbox").each((i, cb) => {
        if (cb.checked)
          skills.push(cb.dataset.skill)
      });

      // Add skills array to form data
      formData["system.skills.list"] = skills
    }
    return super._updateObject(event, formData)
  }
  async _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropDocument = await fromUuid(dragData.uuid)

    if (!dropDocument)
      return
    
    if (this.item.type === "archetype") {
      
      if (dropDocument.documentName == "JournalEntry" || dropDocument.documentName == "JournalEntryPage")
      {
        return this.item.update({ "system.journal": dropDocument.uuid});
      }

      let obj = {
        id: dropDocument.uuid,
        name: dropDocument.name,
        diff: {}
      }
      if (dropDocument.type == "talent") {
        new Dialog({
          title: "Core Talent?",
          content: "",
          buttons: {
            core: {
              label: "Core",
              callback: () => {
                let core = duplicate(this.item.talents.core)
                core.push(obj)
                this.item.update({ "system.talents.core": core })
              }
            },
            normal: {
              label: "Normal",
              callback: () => {
                let list = duplicate(this.item.talents.list)
                list.push(obj)
                this.item.update({ "system.talents.list": list })
              }
            }

          }
        }).render(true)

      }
      else if (["weapon", "armour", "equipment", "aethericDevice", "rune"].includes(dropDocument.type)) {
        let list = duplicate(this.item.equipment)
        let obj = {
          id: dropDocument.uuid,
          name: dropDocument.name,
          type : "item",
          diff: {}
        }

        list.push(obj)

        // Add new index to groups (last index + 1)
        let groups = this.item.system.addToGroup({type : "item", index : (list.length - 1 || 0)})
        this.item.update({ "system.equipment": list, "system.groups": groups })
      }
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("input").focusin(ev => this._onFocusIn(ev));
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    buttons = [
      {
        label: game.i18n.localize("BUTTON.POST_ITEM"),
        class: "item-post",
        icon: "fas fa-comment",
        onclick: (ev) => this.item.sendToChat(),
      }
    ].concat(buttons);

    if (this.item.journal)
    {
      buttons.unshift({
        label : game.i18n.localize("BUTTON.JOURNAL"),
        class: "archetype-journal",
        icon : "fas fa-book",
        onclick: (ev) => this.item.showInJournal()
      })
    }

    return buttons;
  }

  _onDragStart(event)
  {
    let dragData
    if (event.currentTarget.dataset.effectId)
    {
      let effect = this.item.effects.get(event.currentTarget.dataset.effectId)

      // Create drag data with explicit data becasue we are modifying it
      dragData = {data : effect.toObject(), type : effect.documentName }

      if (this.item.actor)
      {
        let changes = dragData.data.changes

        changes.forEach(c => {
          c.value = c.value.replace("@UUID[Actor.ID]", `@UUID[Actor.${this.actor.id}]`)
        })

        dragData.data.origin = this.item.actor.uuid
      }
    }

    if (dragData)
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async getData() {
    const data = await super.getData();

    // If this is a temp item with an archetype parent
    if (this.item.archetype) {
      let list = getProperty(this.item.archetype.toObject(), this.item.archetypeItemPath);
      let item = list[this.item.archetypeItemIndex];
      mergeObject(data.data, item.diff, { overwrite: true }) // Merge archetype diff with item data
      data.name = item.diff.name || data.item.name
    }
    else
      data.name = data.item.name

    

    data.system = data.data.system; // project system data so that handlebars has the same name and value paths
    data.conditions = CONFIG.statusEffects.map(i => {
      return {
        name : i.name,
        key: i.id,
        img: i.icon,
        existing: this.item.hasCondition(i.id)
      }
    })

    // Lock "Initial" value for overcasts targeting damage or duration - already provided by the spell
    if (this.item.type == "spell") {
      for (let oc of data.system.overcasts) {
        if (oc.property == "damage.total" || oc.property == "duration.value") {
          oc.initialDisabled = true;
          oc.initial = ""
        }

      }
    }

    // Create an easily accessible object for handlebars to check if a skill is included (used in checked property of skill list)
    if (this.item.type == "archetype") {
      data.skills = {}
      data.system.skills.list.forEach(s => {
        data.skills[s] = true;
      })


      let element = $(ArchetypeGroups.constructHTML(data.item, {parentheses : true, commas: true, draggable: false}))
      // Remove unnecessary outside parentheses
      let parentheses = Array.from(element.find(".parentheses"))
      parentheses[0].remove();
      parentheses[parentheses.length - 1].remove()
      data.equipmentHTML = `<div class="group-wrapper">${element.html()}</div>`

    }


    data.enrichment = await this._handleEnrichment()

    return data;
  }

  async _handleEnrichment()
  {
      let enrichment = {}
      enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {async: true, secrets: this.item.isOwner, relativeTo: this.item})

      return expandObject(enrichment)
  }

  _onFocusIn(event) {
    $(event.currentTarget).select();
  }

  activateListeners(html) {
    super.activateListeners(html)
    
    html.find(".item-traits").click(ev => {
      new ItemTraits(this.item).render(true)
    })

    html.find(".configure-groups").click(ev => {
      new ArchetypeGroups(this.item).render(true)
    })

    html.find(".condition-toggle").click(ev => {
      let key = $(ev.currentTarget).parents(".condition").data("key")
      if (this.item.hasCondition(key))
        this.item.removeCondition(key)
      else
        this.item.addCondition(key);

    })

    html.find(".overcast-create").click(ev => {
      let overcast = {
        "ratio": {
          "success": 1,
          "value": 1
        },
        "property": "",
        "description": ""
      }

      let overcasts = foundry.utils.deepClone(this.item.overcasts)
      overcasts.push(overcast)

      return this.item.update({ "system.overcasts": overcasts })

    })

    html.find(".entry-delete").click(ev => {
      let index = parseInt($(ev.currentTarget).parents(".entry-element").attr("data-index"))
      let path = $(ev.currentTarget).parents(".entry-element").attr("data-path")
      let array = duplicate(getProperty(this.item, path))
      array.splice(index, 1)

      return this.item.update({ [`${path}`]: array })
    })

    html.find(".overcasts input").change(ev => {
      let index = parseInt($(ev.currentTarget).parents(".entry-element").attr("data-index"))
      let overcasts = foundry.utils.deepClone(this.item.overcasts)
      let path = ev.currentTarget.dataset.path

      let value = ev.target.value

      if (Number.isNumeric(value))
        value = parseInt(value)

      setProperty(overcasts[index], path, value)

      this.item.update({ "system.overcasts": overcasts })

    })

    html.find(".add-generic").click(async ev => {
      new ArchetypeGeneric({item: this.item}).render(true)
    })

    html.find(".reset").click(ev => {
      this.item.system.resetGroups();
    })

    html.find(".entry-element.talents,.equipment").mouseup(async ev => {
      let path = ev.currentTarget.dataset.path
      let index = Number(ev.currentTarget.dataset.index)
      let array = duplicate(getProperty(this.item, path));

      let obj = array[index];

      if (obj) {
        if (ev.button == 0)
        {
          if (obj.type == "generic")
          new ArchetypeGeneric({item: this.item, index}).render(true);
          else
          {
            let item = await fromUuid(obj.id)
            if (!item)
              item = await game.aos.utility.findItem(obj.id)

            if (!item)
              throw Error("Could not find Item reference")

            new SoulboundItem(item.toObject(), { archetype: { item: this.item, index, path} }).sheet.render(true, {editable : this.isEditable})
          }
        }
        else {
          new Dialog({
            title: "Delete Item?",
            content: "Do you want to remove this item from the Archetype? This will reset the groupings.",
            buttons: {
              yes: {
                label: "Yes",
                callback: async () => {
                  array.splice(index, 1)
                  await this.item.update({ [`${path}`]: array })
                  if (path.includes("equipment")) {
                    this.item.system.resetGroups();
                  }
                }
              },
              no: {
                label: "No",
                callback: () => { }
              }
            }
          }).render(true)
        }
      }
    })
  }
}