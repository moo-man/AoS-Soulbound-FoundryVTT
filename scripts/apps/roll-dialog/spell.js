import { CommonRollDialog } from "./common";

export class SpellRollDialog extends CommonRollDialog {

    dialogTitle = "DIALOG.SPELL_ROLL"

    get item()
    {
        return this.data.spell;
    }

    get spell()
    {
        return this.data.spell;
    }


    static setupData(spell, actor, options={})
    {
        if (typeof spell == "string")
        {
            if (spell.includes("."))
            {
                spell = fromUuidSync(spell);
            }
            else
            {
                spell = actor.items.get(spell);
            }
        }

        let skill = "channelling" 
        let attribute = spell.system.attribute || game.aos.config.skillAttributes[skill]

        
        options.title = options.title || `${spell.name}`
        options.title += options.appendTitle || "";
        let {data, fields} = super.setupData({skill, attribute}, actor, options)
        data.scripts = data.scripts.concat(spell?.getScripts("dialog"));

        mergeObject(fields, spell.system.difficulty, {overwrite : false});

        data.spell = spell;
        data.item = spell;
        data.itemId = spell.uuid;
        options.title = options.title || spell.name;
        options.title += options.appendTitle || "";
        
        return {data, fields, options};
    }
}
