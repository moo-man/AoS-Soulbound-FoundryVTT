import IMItemSheet from "../item.js";

export default class ArmourSheet extends IMItemSheet
{
    static type="armour"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/item/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: `systems/age-of-sigmar-soulbound/templates/item/types/${this.type}.hbs` },
      effects: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/item/item-effects.hbs' },
    }


    async _prepareContext(options)
    {
      let context = await super._prepareContext(options);
      context.types = {
        "light" : "TYPE.LIGHT",
        "medium" : "TYPE.MEDIUM",
        "heavy" : "TYPE.HEAVY",
        "shield" : "TYPE.SHIELD",
      }
      return context;
    }
}