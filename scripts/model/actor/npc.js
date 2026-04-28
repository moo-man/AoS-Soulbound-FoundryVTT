import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class NPCModel extends StandardActorModel 
{
    static preventItemTypes = [];
    static singletonItemPaths = {};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.bio = new fields.SchemaField({
            size : new fields.NumberField({initial: 2}),
            type : new fields.NumberField({initial: 1}),
            faction : new fields.StringField(),
            subfaction : new fields.StringField(),
            role : new fields.StringField()
        });
        schema.experience = new fields.SchemaField({
            total : new fields.NumberField({min : 0, initial : 0})
        })

        return schema;
    }
    
    async _preCreate(data, options) 
    {
        super._preCreate(data, options);
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "flags.age-of-sigmar-soulbound.autoCalcTokenSize" : true
            })
        }
    }

    computeDerived()
    {
        super.computeDerived();
        this.computeTokenSize();
    }

    computeTokenSize() {
        if(this.isSwarm || !this.autoCalc.tokenSize || this.parent.pack) return; //Swarms are variable let the GM decide Size

        let size = this.bio.size; 

        if(size <= 2) {
            this.parent.update({"prototypeToken.height" : 1, "prototypeToken.width" : 1});
        } else if(size === 3) {
            this.parent.update({"prototypeToken.height" : 2, "prototypeToken.width" : 2});
        } else if(size === 4) {
            this.parent.update({"prototypeToken.height" : 3, "prototypeToken.width" : 3});
        } else if(size === 5) {
            this.parent.update({"prototypeToken.height" : 4, "prototypeToken.width" : 4});
        }
    }

    async applyArchetype(archetype, apply) 
    {
        if (apply)
        {
            ui.notifications.notify(`${game.i18n.localize("CHARGEN.APPLYING")} ${archetype.name} ${game.i18n.localize("BIO.ARCHETYPE")}`)

            let items = [];
            let actorData = this.parent.toObject();
    
            actorData.system.bio.faction = archetype.species
    
            actorData.system.attributes.body.value = archetype.attributes.body
            actorData.system.attributes.mind.value = archetype.attributes.mind
            actorData.system.attributes.soul.value = archetype.attributes.soul
    
            archetype.skills.list.forEach(skill => {
                actorData.system.skills[skill].training = 1
                actorData.system.skills[skill].focus = 1
            })
    
            actorData.system.skills[archetype.skills.core].training = 2
            actorData.system.skills[archetype.skills.core].focus = 2
    
            items = items.concat(await archetype.GetArchetypeItems());
    
            actorData.system.bio.type = 3; // Champion
    
            // Fill toughness and mettle so it doesn't start as 0 (not really ideal though, doesnt't take into account effects)
            actorData.system.combat.health.toughness.value = archetype.attributes.body + archetype.attributes.mind + archetype.attributes.soul
            actorData.system.combat.mettle.value = Math.ceil(archetype.attributes.soul / 2)
    
            actorData.name = archetype.name;
            actorData.img = archetype.img
            actorData.prototypeToken.texture.src = archetype.img.replace("images", "tokens").replace("actors", "tokens")
    
    
            await this.parent.update(actorData)
    
            // Add items separately so active effects get added seamlessly
            await this.parent.createEmbeddedDocuments("Item", items)
        }
    }

    get isSwarm() {return this.bio.type === 0}

    get autoCalc() {
        return foundry.utils.mergeObject(super.autoCalc, {
                toughness : this.bio.type > 1,
                mettle :  this.bio.type > 2,
                wounds :  this.bio.type > 3
        })
    }


    async toEmbed(config, options)
    {

        let description = this.notes;

        let img = this.parent.img;

        if (config.token)
        {
            img = this.parent.prototypeToken.texture.src
        }

        img = `<div class="journal-image centered"><img src="${img}" width=300/></div>`

        const weaponHTML = async (weapon) => {
            let description = (await foundry.applications.ux.TextEditor.implementation.enrichHTML(weapon.system.description, {relativeTo: weapon})).replace("<p>", "");

            let html = `<p>@UUID[${weapon.uuid}]{${weapon.name}}: ${weapon.system.isMelee ? "Melee Attack" : "Ranged Attack"} (${(weapon.system.isMelee ? this.combat.melee.ability : this.combat.accuracy.ability).split("(")[0].trim()}), ${weapon.system.isMelee ? this.skills.weaponSkill.value : this.skills.ballisticSkill.value}d6, ${weapon.system.damage} Damage, ${weapon.system.Traits} ${description}`;
            return html;
        }

        let talentText = ``;

        for(let talent of this.parent.itemTypes.talent)
        {
            talentText += `<p>@UUID[${talent.uuid}]{${talent.name}}: ${(await foundry.applications.ux.TextEditor.implementation.enrichHTML(talent.system.description, {relativeTo: talent})).replace("<p>", "")}</p>`;
        }

        let weaponText = ``;

        for (let weapon of this.parent.itemTypes.weapon)
        {
            weaponText += await weaponHTML(weapon);
        }

        let html = `
        <div class="table-border">
        <table>
        <tbody>
        <tr class="npc-header">
            <td colspan="12">
                <p>@UUID[${this.parent.uuid}]{${this.parent.name}}</p>
            </td>
        </tr>
        <tr class="npc-values">
            <td colspan="12">
                <p>${game.aos.config.actorSize[this.bio.size]} ${this.bio.role} (${this.bio.faction}${this.bio.subfaction ? ", " + this.bio.subfaction : ""}), ${game.aos.config.npcType[this.bio.type]}</p>
            </td>
        </tr>
        <tr class="npc-values abilities">
            <td colspan="4">
                <div>
                <img src="systems/age-of-sigmar-soulbound/assets/image/melee.webp" width="24" height="24">
                ${this.combat.melee.ability.split("(")[0].trim()}
                </div>
            </td>
            <td colspan="4">
                <div>
                <img src="systems/age-of-sigmar-soulbound/assets/image/accuracy.webp" width="24" height="24">
                ${this.combat.accuracy.ability.split("(")[0].trim()}
                </div>
            </td>
            <td colspan="4">
                <div>
                <img src="systems/age-of-sigmar-soulbound/assets/image/defence.webp" width="24" height="24">
                ${this.combat.defence.ability.split("(")[0].trim()}
                </div>
            </td>
        </tr>
        <tr class="npc-labels">
            <td colspan="3">
                <p>Armour</p>
            </td>
            <td colspan="3">
                <p>Toughness</p>
            </td>
            <td colspan="3">
                <p>Wounds</p>
            </td>
            <td colspan="3">
                <p>Mettle</p>
            </td>
        </tr>
        <tr class="npc-values">
            <td colspan="3">
                <p>${this.combat.armour.value}</p>
            </td>
            <td colspan="3">
                <p>${this.isSwarm ? this.combat.health.toughness.value : this.combat.health.toughness.max}</p>
            </td>
            <td colspan="3">
                <p>${this.combat.health.wounds.max}</p>
            </td>
            <td colspan="3">
                <p>${this.combat.mettle.max}</p>
            </td>
        </tr>
        <tr class="separator">
            <td colspan="12">TRAITS</td>
        </tr>
        <tr>
        <td colspan="12">${talentText}</td>
        </tr>
        <tr class="separator">
            <td colspan="12">ATTACK</td>
        </tr>
        <tr>
        <td colspan="12">${weaponText}</td>
        </tr>
        
        <tr class="npc-labels">
            <td colspan="4">
                <p>BODY</p>
            </td>
            <td colspan="4">
                <p>MIND</p>
            </td>
            <td colspan="4">
                <p>SOUL</p>
            </td>
        </tr>
        <tr class="npc-values">
            <td colspan="4">
                <p>${this.attributes.body.value}</p>
            </td>
            <td colspan="4">
                <p>${this.attributes.mind.value}</p>
            </td>
            <td colspan="4">
                <p>${this.attributes.soul.value}</p>
            </td>
        </tr>
       `

        html += `</tbody></table></div>`;

        if (config.description == "top")
        {
            html = description + html;
        }
        else if (config.description == "bottom")
        {
            html += description
        }

        if (config.image == "top")
        {
            html = img + html;
        }
        else if (config.image == "bottom")
        {
            html += img
        }
        

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }
}

