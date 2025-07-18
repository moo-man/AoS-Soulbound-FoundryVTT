import ItemTraits from "../../apps/item-traits.js";

export default class SoulboundItemSheet extends WarhammerItemSheetV2 
{
  static type=""

  static DEFAULT_OPTIONS = {
    classes: ["soulbound"],
    window: {
      controls: [
        {
          icon: 'fa-solid fa-comment',
          label: "Post to Chat",
          action: "postItem"
        }
      ],
    },
    actions: {
      toggleSummary: this._toggleSummary,
      configureTraits: this._onConfigureTraits,
      postItem: this._onPostItem,
      toggleCondition: this._onToggleCondition,
      changeState: this._onChangeState
    },
    defaultTab: "description"
  }

  static TABS = {
    description: {
      id: "description",
      group: "primary",
      label: "Description",
    },
    effects: {
      id: "effects",
      group: "primary",
      label: "Effects",
    }
  }

  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
    context.typeLabel = game.i18n.localize(CONFIG.Item.typeLabels[this.document.type]);
    context.categories = {"melee": "CATEGORY.MELEE", "ranged" : "CATEGORY.RANGED"}
    context.conditions = this._getConditionData();
    return context;
  }


  _getConditionData() 
  {
      try 
      {
          let conditions = foundry.utils.duplicate(CONFIG.statusEffects).map(e => new CONFIG.ActiveEffect.documentClass(e));
          let currentConditions = this.document.effects.filter(e => e.isCondition);
    
          for (let condition of conditions) 
          {
              let owned = currentConditions.find(e => e.conditionId == condition.conditionId);
              if (owned) 
              {
                  condition.existing = true;
              }
          }
          return conditions;
      }
      catch (e)
      {
          ui.notifications.error("Error Adding Condition Data: " + e);
      }
  }
  _getContextMenuOptions() {
    let getParent = this._getParent.bind(this);
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          this.item.createEmbeddedDocuments("ActiveEffect", [document.toObject()]);
        }
      },
    ];
  }

  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, { async: true, secrets: this.item.isOwner, relativeTo: this.item })

    return expandObject(enrichment)
  }

  static async _onConfigureTraits(ev, target) {
    new ItemTraits(this.item).render(true)
  }

  static _onToggleCondition(ev, target)
  {
      let key = target.dataset.condition;
      if (this.document.hasCondition(key))
          this.document.removeCondition(key)
      else 
          this.document.addCondition(key);
  }
}