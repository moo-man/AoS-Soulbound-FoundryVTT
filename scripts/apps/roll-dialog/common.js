import SoulboundUtility from "../../system/utility";

export class CommonRollDialog extends WarhammerRollDialogV2 {

    get tooltipConfig() 
    {
        return {
            difficulty: {
                label: "Difficulty",
                type: 1,
                path: "fields.difficulty",
                hideLabel: true
            },
            complexity: {
                label: "Complexity",
                type: 1,
                path: "fields.complexity",
                hideLabel: true
            },
            bonusDice: {
                label: "bonusDice",
                type: 1,
                path: "fields.bonusDice",
                hideLabel: true

            },
            bonusFocus: {
                label: "Bonus ",
                type: 0,
                path: "fields.bonusFocus",
                hideLabel: true
            }
        }
    }

    static PARTS = {
        common : {
            template : "systems/age-of-sigmar-soulbound/templates/dialog/common-dialog.hbs",
            fields: true
        },
        mode : {
            template : "modules/warhammer-lib/templates/apps/dialog/dialog-mode.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    // Backwards compatibility with migrated scripts
    get skillKey()
    {
        return this.fields.skill;
    }

    // Backwards compatibility with migrated scripts
    get attributeKey()
    {
        return this.fields.attribute;
    }

    get title() 
    {
        return this.context.title;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.title = this.context.title;
        return context;
    }

    static setupData({attribute, skill}, actor, context={}, options={})
    {
        let {data, fields} = this._baseDialogData(actor, context, options);

        
        foundry.utils.mergeObject(fields, context.fields || {});

        if (context.dn)
        {
            let {difficulty, complexity} = SoulboundUtility.DNToObject(context.dn);
            if (!fields.difficulty) 
            {
                fields.difficulty = difficulty;
            }
            if (!fields.complexity) 
            {
                fields.complexity = complexity;
            }
        }   

        fields.attribute = attribute || game.aos.config.skillAttributes[skill];
        fields.skill = skill;

        context.title = context.title || `${game.aos.config.attributes[fields.attribute]} ${fields.skill ? "(" + game.aos.config.skills[fields.skill] + ")" : ""}`
        context.title += context.appendTitle || "";
        
        return {data, fields, context, options};
    }

    _defaultFields() 
    {
        return foundry.utils.mergeObject(super._defaultFields(), {
            difficulty : 4,
            complexity : 1,
            bonusDice : 0,
            bonusFocus : 0,
        });
    }
}
