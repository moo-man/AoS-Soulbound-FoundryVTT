import ItemTraits from "../../apps/item-traits.js";

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
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  get template() {
    return `systems/age-of-sigmar-soulbound/template/sheet/${this.item.type}.html`
  }

  _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropItem = game.items.get(dragData.id)

    if (this.item.type === "archetype")
    {
      let list = duplicate(this.item.talents.list)
      let obj = {
        id : dragData.id,
        name : dropItem.name,
        diff : {}
      }
      list.push(obj)
      this.item.update({"data.talents.list" : list})
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
    if (this.item.type == "spell")
    {
      for(let oc of data.data.overcasts)
      {
        if (oc.property == "damage.total" || oc.property == "duration.value")
        {
          oc.initialDisabled = true;
          oc.initial = ""
        }

      }
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

      return this.item.update({"data.overcasts" : overcasts})

    })

    html.find(".overcast-delete").click(ev => {
      let index = parseInt($(ev.currentTarget).parents(".entry-element").attr("data-index"))
      let overcasts = foundry.utils.deepClone(this.item.overcasts)
      overcasts.splice(index, 1)

      return this.item.update({"data.overcasts" : overcasts})

    })

    html.find(".overcasts input").change(ev => {
      let index = parseInt($(ev.currentTarget).parents(".entry-element").attr("data-index"))
      let overcasts = foundry.utils.deepClone(this.item.overcasts)
      let path = ev.currentTarget.dataset.path

      let value = ev.target.value
      
      if (Number.isNumeric(value))
        value = parseInt(value)

      setProperty(overcasts[index], path, value)

      this.item.update({"data.overcasts" : overcasts})

    })
  }
}