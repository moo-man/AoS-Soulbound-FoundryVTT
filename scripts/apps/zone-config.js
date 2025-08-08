export default class ZoneConfig extends WarhammerZoneConfig
{
    static configTemplate = "systems/age-of-sigmar-soulbound/templates/apps/zone-config.hbs";
    static PARTS = {
        tabs : {template : "modules/warhammer-lib/templates/partials/sheet-tabs.hbs"},
        config: { template: this.configTemplate },
        effects : { template : "modules/warhammer-lib/templates/apps/zone-effects.hbs" },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };


    static DEFAULT_OPTIONS = {
        classes : ["soulbound"], 
        position: {
            width:  400
        }
    };
}