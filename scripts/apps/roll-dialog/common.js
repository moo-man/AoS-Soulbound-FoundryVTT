export class CommonRollDialog extends WarhammerRollDialog {

    dialogTitle = "DIALOG.COMMON_ROLL"

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.classes.push("soulbound")
        options.resizable = true;
        return options
    } 

    get template() 
    {
      return "systems/age-of-sigmar-soulbound/template/apps/dialog/common-dialog.hbs";
    }

    async getData()
    {
        let data = await super.getData();
        data.dialogTitle = game.i18n.localize(this.dialogTitle);
        return data;
    }

    static setupData({attribute, skill}, actor, options={})
    {
        let {data, fields} = this._baseDialogData(actor, options);

        
        mergeObject(fields, options.fields || {});
        fields.attribute = attribute || game.aos.config.skillAttributes[skill];
        fields.skill = skill

        options.title = options.title || `${game.aos.config.attributes[fields.attribute]} ${fields.skill ? "(" + game.aos.config.skills[fields.skill] + ")" : ""}`
        options.title += options.appendTitle || "";
        
        return {data, fields, options};
    }

    _defaultFields() 
    {
        return mergeObject(super._defaultFields(), {
            difficulty : 4,
            complexity : 1,
            bonusDice : 0,
            bonusFocus : 0,
        });
    }

    activateListeners(html)
    {
        super.activateListeners(html)
    }

}
