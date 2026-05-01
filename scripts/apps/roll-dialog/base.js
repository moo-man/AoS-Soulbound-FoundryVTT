import SoulboundUtility from "../../system/utility";

export class BaseRollDialog extends WarhammerRollDialogV2 {

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
        base : {
            template : "systems/age-of-sigmar-soulbound/templates/dialog/base-dialog.hbs",
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

    get title() 
    {
        return this.context.title;
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        if (this.fields.maximize)
        {
            game.counter.soulfire--;
        }
        return data;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.title = this.context.title;
        context.difficulties = {
           "2" : 2,
           "3" : 3,
           "4" : 4,
           "5" : 5,
           "6" : 6
        },
        context.complexities = {
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            "10": 10,
            "11": 11,
            "12": 12,
            "13": 13,
            "14": 14,
            "15": 15,
            "16": 16,
            "17": 17,
            "18": 18,
            "19": 19,
            "20": 20
        }

        context.hasSoulfire = game.counter.soulfire > 0;
        return context;
    }

    static setupData({dice=null, focus=null}={}, actor, context={}, options={})
    {
        let {data, fields} = this._baseDialogData(actor, context, options);

        data.dice = dice;
        data.focus = focus;
        
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

        data.itemId = context.itemId;

        context.title = context.title || "";
        // context.title += context.appendTitle || "";
        
        return {data, fields, context, options};
    }

    _defaultFields() 
    {
        return foundry.utils.mergeObject(super._defaultFields(), {
            difficulty : 4,
            complexity : 1,
            bonusDice : 0,
            bonusFocus : 0,
            maximize: false
        });
    }
}
