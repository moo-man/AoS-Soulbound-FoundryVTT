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
    
    async preCreateData(data, options, user) 
    {
        let preCreateData = {};
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.name" : data.name,
            });
        }
        return preCreateData;
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