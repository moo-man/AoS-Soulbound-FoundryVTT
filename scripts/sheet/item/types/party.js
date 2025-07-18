import IMItemSheet from "../item.js";

export default class PartyItemSheet extends IMItemSheet
{
    static type="party"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/item/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: `systems/age-of-sigmar-soulbound/templates/item/types/${this.type}.hbs` },
      effects: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/item/item-effects.hbs' },
    }
}