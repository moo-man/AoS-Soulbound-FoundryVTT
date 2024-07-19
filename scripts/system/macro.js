
export default class AOS_MacroUtil {
    /**
     * Retrieves the item being requested by the macro from the selected actor,
     * sending it to the correct setup____ function to be rolled.
     * 
     * @param {String} itemName name of item being rolled
     * @param {String} itemType type of item ("weapon", "spell", etc)
     */
    static rollItemMacro(itemName, itemType) {
        const speaker = ChatMessage.getSpeaker();
        let actor;
        
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);

        let item = actor ? actor.items.find(i => i.name === itemName && i.type == itemType) : null;
        
        if (!item) return ui.notifications.warn(`${game.i18n.localize("NOTIFICATION.MACRO_ITEM_NOT_FOUND")} ${itemName}`);

        // Trigger the item roll
        if(item.isAttack) { // Is Weapon or Aetheric Device with Damage       
            return AOS_MacroUtil.createWeaponDialog(actor, item);        
        }
        if(item.isSpell) {
            return AOS_MacroUtil.createSpellRoll(actor, item);
        }
        if(item.isMiracle) {
            return AOS_MacroUtil.createMiracleRoll(actor, item);
        }
    
        item.sendToChat();
        return;    
    }

    static async createWeaponDialog(actor, weapon) {
        actor.setupCombatTest(weapon)
    }

    static async createSpellRoll(actor, spell) {
        actor.setupSpellTest(spell)
    }

    static async createMiracleRoll(actor, spell) {
        actor.setupMiracleTest(spell)
    }
}