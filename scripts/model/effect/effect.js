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

    static defineSchema() {
        let schema = super.defineSchema();
        schema.transferData.fields.zone.fields.traits = new fields.EmbeddedDataField(SoulboundZoneTraitsModel)
        return schema
    }
}

export class SoulboundZoneTraitsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.cover  =new fields.StringField({ label: "ZONE.COVER", choices: game.aos.config.zoneCover }, { name: "cover" });
        schema.hazard = new fields.StringField({ label: "ZONE.HAZARD", choices: game.aos.config.zoneHazard }, { name: "hazard" });
        schema.ignoreArmour = new fields.BooleanField({ label: "ZONE.HAZARD_IGNORE_ARMOUR" }, { name: "ignoreArmour" });
        schema.obscured = new fields.StringField({ label: "ZONE.OBSCURED", choices: game.aos.config.zoneObscured }, { name: "obscured" });
        schema.difficult = new fields.BooleanField({ label: "ZONE.DIFFICULT_TERRAIN" }, { name: "difficult" });
        schema.tags = new fields.StringField();
        schema.filter = new fields.JavaScriptField();
        return schema;
    }


    get text() {
        let text = [];
        for (let key in this) {
            if (this[key]) {
                if (typeof this[key] == "boolean") {
                    text.push(game.i18n.localize(this.schema.fields[key].options.label))
                }
                else if (typeof this[key] == "string" && this.schema.fields[key].options.choices?.length) {
                    text.push(this.schema.fields[key].options.choices[this[key]])
                }
            }
        }
        return text.join(", ")
    }
}   