/**
 * Abstract class that interfaces with the Item class
 */
export class BaseSoulboundItemModel extends BaseWarhammerItemModel
{
    async preCreateData()//data) 
    {
        return {};
    }

    async preUpdateChecks(data)
    {
        return data;
    }

    async updateChecks()
    {
        if (this.parent.actor)
        {
            await this.parent.actor.update(await this.parent.actor.system.updateChecks({}, {}));
        }

        return {};
    }

    async createChecks(data, options, user)
    {
        
    }

    /**
     * Used by sheet dropdowns, posting to chat, and test details
     */
    async summaryData()
    {
        return {
            notes : "",
            gmnotes : "",
            details : {
                physical : "",
                item : {

                }
            },
            tags : [],
            summaryLabel : game.i18n.localize("IMPMAL.Description")
        };
    }
}