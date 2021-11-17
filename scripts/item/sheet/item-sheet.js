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
        ]
    });
}

get template() {
   return `systems/age-of-sigmar-soulbound/template/sheet/${this.item.type}.html`
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
          label : i.label,
          key : i.id,
          img : i.icon,
          existing : this.item.hasCondition(i.id)
      }
  })
    return data;
  }

  _onFocusIn(event) {
    $(event.currentTarget).select();
  }

  activateListeners(html)
  {
    super.activateListeners(html)
    html.find(".item-traits").click(ev => {
      new ItemTraits(this.item).render(true)
    })

    html.find(".effect-create").click(async ev => {
      if (this.item.isOwned)
        ui.notifications.error("Effects can only be added to world items or actors directly")

        let effectData = { label: this.item.name , icon: (this.item.data.img || "icons/svg/aura.svg")}
        
        let html = await renderTemplate("systems/age-of-sigmar-soulbound/template/dialog/quick-effect.html", effectData)
        let dialog = new Dialog({
            title : "Quick Effect",
            content : html,
            buttons : {
                "create" : {
                    label : "Create",
                    callback : html => {
                        let mode = 2
                        let label = html.find(".label").val()
                        let key = html.find(".key").val()
                        let value = parseInt(html.find(".modifier").val())
                        effectData.label = label
                        effectData.changes = [{key, mode, value}]
                        this.object.createEmbeddedDocuments("ActiveEffect", [effectData])
                    }
                },
                "skip" : {
                    label : "Skip",
                    callback : () => this.object.createEmbeddedDocuments("ActiveEffect", [effectData])
                }
            }
        })
        await dialog._render(true)
        dialog._element.find(".label").select() 
    })

    html.find(".effect-edit").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
      this.object.effects.get(id).sheet.render(true)
    })

    html.find(".effect-delete").click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
      this.object.deleteEmbeddedDocuments("ActiveEffect", [id])
    })

    html.find(".condition-toggle").click(ev => {
        let key = $(ev.currentTarget).parents(".condition").data("key")
        if (this.item.hasCondition(key))
            this.item.removeCondition(key)
        else 
            this.item.addCondition(key);

    })
  }
}