import { CommonRollDialog } from "./common";

export class MiracleRollDialog extends CommonRollDialog {

    dialogTitle = "DIALOG.MIRACLE_ROLL";

    static setupData(miracle, actor, options={})
    {
        if (typeof miracle == "string")
        {
            if (miracle.includes("."))
            {
                miracle = fromUuidSync(miracle);
            }
            else
            {
                miracle = actor.items.get(miracle);
            }
        }

        if (miracle.cost > actor.combat.mettle.value)
        {
            ui.notifications.error(game.i18n.localize("ERROR.NotEnoughMettle"))
            throw Error(game.i18n.localize("ERROR.NotEnoughMettle"));
        }
        
        let {data, fields} = super.setupData({skill : "devotion", attribute : "soul"}, actor, options)

        if (!miracle.system.test.opposed)
        {
            data.noRoll = true;
        }

        data.miracle = miracle;
        data.item = miracle;
        data.itemId = miracle.uuid;
        options.title = options.title || miracle.name;
        options.title += options.appendTitle || "";
        
        return {data, fields, options};
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        if (this.data.noRoll)
        {
            let fields = html.find(".dialog-fields");
            fields[0].classList.add("disabled", "inactive")
            $(`<div style="text-align: center; font-size: 1rem; font-family: Quadrant-Regular">This Miracle is unopposed</div>`).insertBefore(html);
        }
    }

}
