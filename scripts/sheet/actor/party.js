import { SoulboundActorSheet } from "./actor";

export class PartySheet extends SoulboundActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["party"],
        window : {
          controls : [],
        },
        actions : {

        },
        defaultTab : "main"
      } 
      
      static PARTS = {
        header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/actor/party/party-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/actor/party/party-main.hbs'},
        members : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/actor/party/party-members.hbs'},      }

      
      static TABS = {
        main : {
            id : "main",
            group : "primary",
            label : "TAB.MAIN"
        },
        members : {
            id : "members",
            group : "primary",
            label : "TAB.MEMBERS"
        }
      }


    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.items.party = this.costructPartyItemLists(context.items)
        context.members = {}
        for (let id of this.document.system.members) {
          let actor = game.actors.get(id);
          context.members[id] = actor;
      }
      return context;
    }

    costructPartyItemLists(items)
    {
        return {
            longGoal : items.partyItem.filter(i => i.category == "longGoal"),
            shortGoal : items.partyItem.filter(i => i.category == "shortGoal"),
            ally : items.partyItem.filter(i => i.category == "ally"),
            enemy : items.partyItem.filter(i => i.category == "enemy"),
            resource : items.partyItem.filter(i => i.category == "resource" || !i.category),
            rumour : items.partyItem.filter(i => i.category == "rumour"),
            fear :  items.partyItem.filter(i => i.category == "fear"),
            threat : items.partyItem.filter(i => i.category == "threat")
        }
    }
}