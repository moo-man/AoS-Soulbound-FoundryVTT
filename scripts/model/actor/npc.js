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
        if(this.isSwarm || !this.autoCalc.tokenSize || !this.parent.pack) return; //Swarms are variable let the GM decide Size

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
        return mergeObject(super.autoCalc, {
                toughness : this.bio.type > 1,
                mettle :  this.bio.type > 2,
                wounds :  this.bio.type > 3
        })
    }
}

