let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseSoulboundActorModel extends BaseWarhammerActorModel 
{

    static preventItemTypes = [];
    static singletonItemTypes = [];
    
    static defineSchema() 
    {
        let schema = {};
        schema.notes = new fields.StringField();
        return schema;
    }
    
    async _preCreate(data, options, user) 
    {
        super._preCreate(data, options);
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.name" : data.name,
                "prototypeToken.displayName" : CONST.TOKEN_DISPLAY_MODES.HOVER,
                "prototypeToken.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
            })
        }
    }

    async allowCreation(data, options, user)
    {
        return true;
    }

    /**
     * @abstract
     */
    initialize() 
    {

    }

    
    checkSingletonItems(item)
    {
        if (this.constructor.singletonItemTypes.includes(item.type))
        {
            return item.actor.update({[`system.${item.type}`] : this[item.type].updateSingleton(item)});
        }
    }


    computeBase() 
    {
        this.initialize();
    }

    computeDerived() 
    {
        // Abstract
    }
}