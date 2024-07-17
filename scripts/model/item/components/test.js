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
        return schema;
    }

}