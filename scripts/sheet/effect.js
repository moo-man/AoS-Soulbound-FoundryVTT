export default class SoulboundActiveEffectConfig extends WarhammerActiveEffectConfig 
{
    effectKeysTemplate = "systems/age-of-sigmar-soulbound/templates/apps/effect-key-options.hbs";

    systemTemplate="systems/age-of-sigmar-soulbound/templates/partials/effect-zones.hbs"

    static DEFAULT_OPTIONS = {
        advancedActions : {
            zoneConfig : this._onZoneConfig
        }
    };

    static _onZoneConfig(ev, target)
    {
        new ZoneConfig(this.document).render({force : true});
    }

    hiddenProperties(){
        let hidden = super.hiddenProperties();
        hidden.equipTransfer = !this.document.item?.system?.equippable;
        return hidden;
    }
}