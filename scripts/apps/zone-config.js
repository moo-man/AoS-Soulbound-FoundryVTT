export default class ZoneConfig extends FormApplication 
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template : "systems/age-of-sigmar-soulbound/template/apps/zone-config.html",
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


    _updateObject(event, formData)
    {
        this.object.update(formData)
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}


Hooks.on('renderDrawingHUD', (hud, html) => {

    const button = $(
    `<div class='control-icon'><i class="fas fa-cog"></i></div>`
    );
    button.attr(
    'title',
    'Zone Config'
    );

    button.mousedown(event => {
        new ZoneConfig(hud.object.document).render(true)
    })
    html.find('.col.right').append(button);
})

