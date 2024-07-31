import ZoneConfig from "./zone-config";

export default class SoulboundActiveEffectConfig extends WarhammerActiveEffectConfig {

    systemTemplate="systems/age-of-sigmar-soulbound/template/apps/active-effect-config.hbs"

    async _render(...args)
    {
        await super._render(...args);

        this.element.find(".zone-traits").click(ev => {
            new ZoneConfig(this.object, {path : "system.zone.traits"}).render(true);
        })
    }

    activateListeners(html)
    {
        super.activateListeners(html);


    }
}