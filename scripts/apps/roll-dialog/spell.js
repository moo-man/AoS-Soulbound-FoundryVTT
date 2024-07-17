import { CommonRollDialog } from "./common";

export class SpellRollDialog extends CommonRollDialog {

    dialogTitle = "DIALOG.SPELL_ROLL"

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
        let {data, fields} = super.setupData({skill, attribute}, actor, options)

        mergeObject(fields, spell.system.difficulty, {overwrite : false});

        data.spell = spell;
        data.item = spell;
        data.itemId = spell.uuid;
        options.title = options.title || spell.name;
        options.title += options.appendTitle || "";
        
        return {data, fields, options};
    }
}
