import { BaseSoulboundItemModel } from "./base";

let fields = foundry.data.fields;

export class ArchetypeModel extends BaseSoulboundItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.journal = new fields.StringField();
        schema.species = new fields.StringField();
        schema.aqua = new fields.NumberField();

        schema.attributes = new fields.SchemaField({
            body : new fields.NumberField(),
            mind : new fields.NumberField(),
            soul : new fields.NumberField(),
        });

        schema.skills = new fields.SchemaField({
            core : new fields.StringField(),
            xp : new fields.NumberField(),
            list : new fields.ArrayField(new fields.StringField()),
        });

        schema.talents = new fields.SchemaField({
            core : new fields.EmbeddedDataField(DocumentReferenceListModel),
            list : new fields.EmbeddedDataField(DocumentReferenceListModel),
            choose : new fields.NumberField(),
        }); 

        schema.equipment = new fields.EmbeddedDataField(ChoiceModel);

        return schema;
    }


    async _onCreate(data, options, user)
    {   
        await super._onCreate(data, options, user);
        if (this.parent.isOwned)
        {
            await Dialog.confirm({
                title: game.i18n.localize(this.parent.actor.type == "player" ? "HEADER.CHARGEN" : "HEADER.ARCHETYPE_APPLY"),
                content: `<p>${game.i18n.localize(this.parent.actor.type == "player" ? "CHARGEN.PROMPT" : "ARCHETYPE.PROMPT")}</p>`,
                yes: () => this.parent.actor.system.applyArchetype(this.parent, true),
                no: () => this.parent.actor.system.applyArchetype(this.parent, false)
            })
        }
    }

    static migrateData(data)
    {
        super.migrateData(data);

        if (data.talents.core instanceof Array)
        {
            data.talents.core = {list : data.talents.core};
        }

        if (data.talents.list instanceof Array)
        {
            data.talents.list = {list : data.talents.list};
        }



        let _convertStructure = (structure, equipment) => {
            structure.type = ["or", "and"].includes(structure.type) ? structure.type : "option";
            if (!isNaN(structure.index))
            {
                structure.id = equipment[structure.index].groupId || equipment[structure.index].id || structure.groupId;
                if (equipment[structure.index])
                {
                    equipment[structure.index].groupId = structure.id;
                }
            }
            else 
            {
                structure.id = structure.groupId;
            }
            if (structure.items?.length)
            {
                structure.options = foundry.utils.deepClone(structure.items);
                delete structure.items;
                for(let opt of structure.options)
                {
                    _convertStructure(opt, equipment);
                }
            }
            
            return structure
        }

        if (data.equipment instanceof Array)
        {
            let oldEquipment = foundry.utils.deepClone(data.equipment);

            data.equipment = {
                structure : _convertStructure(data.groups, oldEquipment),
                
                options: oldEquipment.map(w => {
                    let type = w.type;
                    if (type == "generic")
                    {
                        type = w.filters?.length ? "filter" : "placeholder";
                    }
                    return {
                        name : w.name,
                        type : type,
                        id : w.groupId || w.id,
                        diff : w.diff,
                        documentId : w.id,
                        idType : "id",
                        filters: (w.filters || []).map(i => {
                            let opMap = {
                                lt : "<",
                                le : "<=",
                                eq : "==",
                                gt : ">",
                                ge : ">="
                            }
                            return {
                                path : i.property,
                                value : i.value,
                                operation : opMap[i.test]
                            }
                        })
                    }
            })}
        }
    }
}