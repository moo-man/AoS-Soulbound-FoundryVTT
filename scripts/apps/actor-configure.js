export default class ActorConfigForm extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        classes : ["soulbound", "actor-config"],
        window : {
            title : "Configure Actor"
        },
        position : {
            width: 500
        }
    };

    static PARTS = {
        form: {
            template: "systems/age-of-sigmar-soulbound/templates/apps/actor-configure.hbs",
            classes : ["standard-form"]
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    
    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.fields = this.document.system.schema.fields.settings.fields;
        context.values = this.document.system.settings;
        return context;
    }
}