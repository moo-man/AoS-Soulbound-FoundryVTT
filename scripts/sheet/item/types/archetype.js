import IMItemSheet from "../item.js";

export default class ArchetypeSheet extends IMItemSheet
{
    static type="archetype"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/item/item-header.hbs', classes: ["sheet-header"] },
      description: { scrollable: [""], template: `systems/age-of-sigmar-soulbound/templates/item/types/${this.type}.hbs` },
    }
}