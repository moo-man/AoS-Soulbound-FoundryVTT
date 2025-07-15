import CharacterCreation from "../../apps/character-creation";
import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class PlayerModel extends StandardActorModel 
{
    static preventItemTypess = [];
    static singletonItemPaths = {};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.bio = new fields.SchemaField({
            archetype : new fields.StringField(),
            species : new fields.StringField(),
            age : new fields.StringField(),
            eyes : new fields.StringField(),
            hair : new fields.StringField(),
            height : new fields.StringField(),
            weight : new fields.StringField(),
            distinguishingFeatures : new fields.StringField(),
            background : new fields.HTMLField(),
            faction : new fields.StringField(),
            subfaction : new fields.StringField(),
            eyeType : new fields.StringField(),
            connections : new fields.HTMLField()
        });
        schema.experience = new fields.SchemaField({
            total : new fields.NumberField({min : 0, initial : 35})
        })

        return schema;
    }

    async _preCreate(data, options) 
    {
        super._preCreate(data, options);
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.sight" : {enabled : true},
                "prototypeToken.actorLink" : true,
                "prototypeToken.disposition" : CONST.TOKEN_DISPOSITIONS.FRIENDLY
            })
        }
    }

    computeDerived()
    {
        super.computeDerived();
        this.computeSpentExperience();
    }

    computeSpentExperience() 
    {
        if(this.experience.total === undefined) return;

        let spent = 0;
        let costs = game.aos.config.Expcost;

        for(let attribute of Object.values(this.attributes))
        {
            let index = attribute.value >= 1 && attribute.value <= 8 ? attribute.value-1 : 0;
            spent += costs.attributes[index];
        }

        for(let skill of Object.values(this.skills)) {
            spent += this.getSkillCost(costs, skill.training);            
            spent += this.getSkillCost(costs, skill.focus);
        }

        let tam = this.parent.itemTypes.talent.concat(this.parent.itemTypes.miracle).filter(x =>!x.free);

        spent += tam.length * costs.talentsAndMiracles;

        this.experience.spent = spent;
        this.experience.outstanding = this.experience.total - spent;
    }

    
    getSkillCost(costs, val) {
        let index = val >= 1 && val <= 3 ? val : 0;
        return costs.skillAndFocus[index];
    }

    
    async applyArchetype(archetype, apply) {

        if (apply)
        {
            new CharacterCreation({actor: this.parent, archetype}).render(true)
        }
        else
        {
            this.parent.update({"system.bio.archetype" : archetype.name, "system.bio.species" : archetype.species })
        }
    }

    get autoCalc() {
        return mergeObject(super.autoCalc, {
            tokenSize : this.parent.getFlag("age-of-sigmar-soulbound", "autoCalcTokenSize")
        })
    }
}

