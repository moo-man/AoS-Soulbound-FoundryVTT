let fields = foundry.data.fields;

export class SoulboundAvoidTestModel extends AvoidTestModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.dn = new fields.StringField({});
        schema.attribute = new fields.StringField({});
        schema.skill = new fields.StringField({});

        return schema;
    }
}

export class SoulboundActiveEffectModel extends WarhammerActiveEffectModel {
    static _avoidTestModel = SoulboundAvoidTestModel;

    static defineSchema()
    {
        let schema = super.defineSchema();
        schema.zone.fields.traits = new fields.SchemaField({
            cover : new fields.StringField({initial : ""}), //choices:["partial", "total"]}),
            hazard : new fields.StringField({initial : ""}), //choices:["minor", "major", "deadly"]}),
            ignoreArmour : new fields.BooleanField({initial : false}),
            obscured : new fields.StringField({initial : ""}), //choices:["light", "heavy"]}),
            difficult : new fields.BooleanField({initial : false}),
        })
        return schema
    }
}