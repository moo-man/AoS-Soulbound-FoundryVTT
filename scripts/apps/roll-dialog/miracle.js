import { CommonRollDialog } from "./common";

export class MiracleRollDialog extends CommonRollDialog {

    dialogTitle = "DIALOG.MIRACLE_ROLL";

    static setupData(miracle, actor, context={}, options={})
    {
        if (typeof miracle == "string")
        {
            if (miracle.includes("."))
            {
                miracle = foundry.utils.fromUuidSync(miracle);
            }
            else
            {
                miracle = actor.items.get(miracle);
            }
        }

        if (miracle.cost > actor.combat.mettle.value)
        {
            ui.notifications.error("ERROR.NotEnoughMettle", {localize: true});
            throw Error(game.i18n.localize("ERROR.NotEnoughMettle"));
        }
        
        let {data, fields} = super.setupData({skill : "devotion", attribute : "soul"}, actor, context)

        if (!miracle.system.test.opposed)
        {
            data.noRoll = true;
        }

        data.miracle = miracle;
        data.item = miracle;
        data.itemId = miracle.uuid;
        context.title = context.title || miracle.name;
        context.title += context.appendTitle || "";
        
        return {data, fields, context, options};
    }

    async _onRender(options)
    {
        await super._onRender(options)

        if (this.data.noRoll)
        {
            let fields = this.element.querySelector(".dialog-fields");
            fields.classList.add("disabled", "inactive")
            this.element.querySelector(".window-content").insertAdjacentHTML("afterbegin", `<div style="text-align: center; font-size: 1rem; font-family: Quadrant-Regular">This Miracle is unopposed</div>`);
        }
    }

}
