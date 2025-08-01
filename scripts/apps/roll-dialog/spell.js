import { CommonRollDialog } from "./common";

export class SpellRollDialog extends CommonRollDialog {

    get item()
    {
        return this.data.spell;
    }

    get spell()
    {
        return this.data.spell;
    }


    static setupData(spell, actor, context={}, options={})
    {
        if (typeof spell == "string")
        {
            if (spell.includes("."))
            {
                spell = fonudry.utils.fromUuidSync(spell);
            }
            else
            {
                spell = actor.items.get(spell);
            }
        }

        let skill = "channelling" 
        let attribute = spell.system.attribute || game.aos.config.skillAttributes[skill]

        
        context.title = context.title || `${spell.name}`
        context.title += context.appendTitle || "";
        let {data, fields} = super.setupData({skill, attribute}, actor, context)
        data.scripts = data.scripts.concat(spell?.getScripts("dialog"));

        foundry.utils.mergeObject(fields, spell.system.difficulty, {overwrite : false});

        data.spell = spell;
        data.item = spell;
        data.itemId = spell.uuid;
        context.title = context.title || spell.name;
        context.title += context.appendTitle || "";
        
        return {data, fields, context};
    }
}
