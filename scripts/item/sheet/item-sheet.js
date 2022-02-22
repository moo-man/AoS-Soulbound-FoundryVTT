import ItemTraits from "../../apps/item-traits.js";
import { AgeOfSigmarItem } from "../item-aos.js";

export class AgeOfSigmarItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["age-of-sigmar-soulbound", "sheet", "item"],
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
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      scrollY: [".sheet-content"]
    });
  }

  get template() {
    return `systems/age-of-sigmar-soulbound/template/sheet/${this.item.type}.html`
  }
  async _updateObject(event, formData) {


    // If this item is from an archetype entry, update the diff instead of the actual item
    // I would like to have done this is the item's _preCreate but the item seems to lose 
    // its "archetype" reference so it has to be done here
    // TODO: Current Issue - changing a property, then changing back to the original value
    // does not work due to `diffObject()`

    if (this.item.archetype) {
      // Get the archetype's equipment, find the corresponding object, add to its diff
      let list = duplicate(this.item.archetype.equipment)
      let equipmentObj = list[this.item.equipmentIndex];
      mergeObject( // Merge current diff with new diff
        equipmentObj.diff, 
        diffObject(this.item.toObject(), expandObject(formData)), 
        {overwrite : true})

      // If the diff includes the item's name, change the name stored in the archetype
      if (equipmentObj.diff.name)
        equipmentObj.name = equipmentObj.diff.name
      else 
        equipmentObj.name = this.item.name

      this.item.archetype.update({ "data.equipment": list })
      return
    }

    // Special processing for archetype items to parse a list of skills available to spend exp on from the checkboxes
    if (this.item.type == "archetype") {
      let skills = []
      this.element.find(".skill-checkbox").each((i, cb) => {
        if (cb.checked)
          skills.push(cb.dataset.skill)
      });

      // Add skills array to form data
      formData["data.skills.list"] = skills
    }
    return super._updateObject(event, formData)
  }

  _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropItem = game.items.get(dragData.id)

    if (this.item.type === "archetype") {
      let list;
      let path;
      let obj = {
        id: dragData.id,
        name: dropItem.name,
        diff: {}
      }
      if (dropItem.type == "talent") {
        new Dialog({
          title: "Core Talent?",
          content: "",
          buttons: {
            core: {
              label: "Core",
              callback: () => {
                let core = duplicate(this.item.talents.core)
                core.push(obj)
                this.item.update({ "data.talents.core": core })
              }
            },
            normal: {
              label: "Normal",
              callback: () => {
                let list = duplicate(this.item.talents.list)
                list.push(obj)
                this.item.update({ "data.talents.list": list })
              }
            }

          }
        }).render(true)

      }
      else if (["weapon", "armour", "equipment", "aethericDevice", "rune"].includes(dropItem.type)) {
        let list = duplicate(this.item.equipment)
        let obj = {
          id: dragData.id,
          name: dropItem.name,
          diff: {}
        }
        list.push(obj)
        this.item.update({ "data.equipment": list })
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
    return buttons;
  }

  getData() {
    const data = super.getData();

    if (this.item.archetype) {
      let list = duplicate(this.item.archetype.equipment)
      let equipmentObj = list[this.item.equipmentIndex];
      mergeObject(data.data, equipmentObj.diff, {overwrite : true}) // Merge archetype diff with item data
      data.name = equipmentObj.diff.name || data.item.name
    }

    data.data = data.data.data; // project system data so that handlebars has the same name and value paths
    data.conditions = CONFIG.statusEffects.map(i => {
      return {
        label: i.label,
        key: i.id,
        img: i.icon,
        existing: this.item.hasCondition(i.id)
      }
    })

    // Lock "Initial" value for overcasts targeting damage or duration - already provided by the spell
    if (this.item.type == "spell") {
      for (let oc of data.data.overcasts) {
        if (oc.property == "damage.total" || oc.property == "duration.value") {
          oc.initialDisabled = true;
          oc.initial = ""
        }

      }
    }

    // Create an easily accessible object for handlebars to check if a skill is included (used in checked property of skill list)
    if (this.item.type == "archetype") {
      data.skills = {}
      data.data.skills.list.forEach(s => {
        data.skills[s] = true;
      })
    }

    return data;
  }

  _onFocusIn(event) {
    $(event.currentTarget).select();
  }

  activateListeners(html) {
    super.activateListeners(html)
    html.find(".item-traits").click(ev => {
      new ItemTraits(this.item).render(true)
    })

    html.find(".effect-create").click(async ev => {
      if (this.item.isOwned)
        ui.notifications.error("Effects can only be added to world items or actors directly")

      let effectData = { label: this.item.name, icon: (this.item.data.img || "icons/svg/aura.svg") }

      let html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/quick-effect.html", effectData)
      let dialog = new Dialog({
        title: "Quick Effect",
        content: html,
        buttons: {
          "create": {
            label: "Create",
            callback: html => {
              let mode = 2
              let label = html.find(".label").val()
              let key = html.find(".key").val()
              let value = parseInt(html.find(".modifier").val())
              effectData.label = label
              effectData.changes = [{ key, mode, value }]
              this.object.createEmbeddedDocuments("ActiveEffect", [effectData])
            }
          },
          "skip": {
            label: "Skip",
            callback: () => this.object.createEmbeddedDocuments("ActiveEffect", [effectData])
          }
        }
      })
      await dialog._render(true)
      dialog._element.find(".label").select()
    })

    html.find(".effect-edit").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
      this.object.effects.get(id).sheet.render(true)
    })

    html.find(".effect-delete").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-effect-id")
      this.object.deleteEmbeddedDocuments("ActiveEffect", [id])
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

      return this.item.update({ "data.overcasts": overcasts })

    })

    html.find(".entry-delete").click(ev => {
      let index = parseInt($(ev.currentTarget).parents(".entry-element").attr("data-index"))
      let path = $(ev.currentTarget).parents(".entry-element").attr("data-path")
      let array = duplicate(getProperty(this.item.data, path))
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

      this.item.update({ "data.overcasts": overcasts })

    })

    html.find(".entry-element.talents,.entry-element.equipment").mouseup(ev => {
      let path = ev.currentTarget.dataset.path
      let index = Number(ev.currentTarget.dataset.index)
      let array = duplicate(getProperty(this.item.data, path));

      let obj = array[index];

      if (obj) {
        if (ev.button == 0)
          new AgeOfSigmarItem(game.items.get(obj.id).toObject(), { archetype: { item: this.item, index } }).sheet.render(true)
        else {
          new Dialog({
            title: "Delete Item?",
            content: "Do you want to remove this item from the Archetype?",
            buttons: {
              yes: {
                label: "Yes",
                callback: () => {
                  array.splice(index, 1)
                  this.item.update({ [`${path}`]: array })
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