export default class SpeedConfig extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        classes : ["soulbound", "speed-config"],
        window : {
            title : "Configure Speed"
        },
        position : {
            width: 500
        }
    };

    static PARTS = {
        form: {
            template: "systems/age-of-sigmar-soulbound/templates/apps/speed-config.hbs",
            classes : ["standard-form"]
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    
    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.fields = this.document.system.schema.fields.combat.fields.speeds.fields
        context.values = this.document.system.combat.speeds;
        return context;
    }
}