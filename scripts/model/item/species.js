import { StandardItemModel } from "./standard";

export class SpeciesModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        return schema;
    }

    async toEmbed(config, options)
    {
        let html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        ${this.description}`

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }
}