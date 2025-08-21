import IMItemSheet from "../item.js";

export default class ArchetypeSheet extends IMItemSheet
{
    static type="archetype"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions : {
        toggleSkill : this._onToggleSkill
      }
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/item/item-header.hbs', classes: ["sheet-header"] },
      description: { scrollable: [""], template: `systems/age-of-sigmar-soulbound/templates/item/types/${this.type}.hbs` },
    }

    static _onToggleSkill(ev, target)
    {
      let skill = target.dataset.skill 
      if (this.document.system.skills.list.includes(skill))
      {
        this.document.update({"system.skills.list" : this.document.system.skills.list.filter(i => i != skill)});
      }
      else 
      {
        this.document.update({"system.skills.list" : this.document.system.skills.list.concat(skill)});
      }
    }

    async _onDropItem(data, ev)
    {
      let item = await Item.implementation.fromDropData(data);

      if (item.type == "talent")
      {
        let path = ev.target.closest("[data-path]")?.dataset.path || "system.talents.list"
        let list = foundry.utils.getProperty(this.document, path);
        this.document.update(list.add(item));
      }
    }
  
}