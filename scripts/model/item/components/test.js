import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class TestDataModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.attribute =  new fields.StringField();
        schema.skill =  new fields.StringField();
        schema.dn =  new fields.StringField();
        schema.opposed = new fields.BooleanField();
        schema.self = new fields.BooleanField();
        return schema;
    }

    get difficulty()
    {
        return game.aos.utility.DNToObject(this.dn)
    }

    roll(actor, options={})
    {
        return actor.system.setupCommonTest({attribute: this.attribute, skill : this.skill}, mergeObject({fields : this.difficulty}, options))
    }
}