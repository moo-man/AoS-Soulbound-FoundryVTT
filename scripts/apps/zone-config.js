export default class ZoneConfig extends FormApplication 
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template : "systems/age-of-sigmar-soulbound/template/apps/zone-config.hbs",
            height : 400,
            width : 300,
            title : game.i18n.localize("HEADER.ZONE_CONFIG"),
            tabs: [
                {
                  navSelector: ".sheet-tabs",
                  contentSelector: ".sheet-body",
                  initial: "description",
                },
              ]
        })
    }

    async getData()
    {
        return getProperty(this.object, this.options.path || `flags.age-of-sigmar-soulbound`);
    }
    
    _updateObject(event, formData)
    {
        this.object.update({[this.options.path || `flags.age-of-sigmar-soulbound`] : formData})
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".effect-create").on("click", ev => {
            ui.notifications.error("Effects must be created via an Active Effect with the 'Zone' Transfer Type")
        })

        html.find(".effect-delete").on("click", ev => {
            let index = ev.currentTarget.dataset.index;
            this.object.setFlag("age-of-sigmar-soulbound", "effects", this.object.flags["age-of-sigmar-soulbound"].effects.filter((effect, i) => i != index)).then(() => this.render(true));
        })
    }
}

foundry.applications.sheets.RegionConfig.DEFAULT_OPTIONS.window.controls = [
    {
        icon: 'fa-solid fa-game-board-simple',
        label: "Zone",
        action: "zoneConfig"
    }
]

Hooks.on("renderRegionLegend", (app, html) => {
    html.querySelectorAll(".region").forEach(region => {
        $(`<button class="icon" data-tooltip="Configure Zone"><i class="fa-solid fa-game-board-simple"></i></button>`).insertBefore(region.querySelector("button")).on("click", (ev) => {
            let region = canvas.scene.regions.get(ev.currentTarget.parentElement.dataset.regionId);
            new ZoneConfig(region).render(true);
        })
    })
})

Hooks.on('setup', (app, html) => {

    foundry.applications.sheets.RegionConfig.DEFAULT_OPTIONS.actions.zoneConfig = function (event, target) {
        new ZoneConfig(this.document).render(true);
    }

})

