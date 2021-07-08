import { prepareCombatRoll, preparePowerRoll } from "./dialog.js";

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
        if(item.isWeapon) {        
            return AOS_MacroUtil.createWeaponDialog(actor, item);        
        }
        if(item.isSpell) {
            return AOS_MacroUtil.createSpellRoll(actor, item);
        }
    
        item.sendToChat();
        return;    
    }

    static createWeaponDialog(actor, weapon) {
        let attributeName, skillName;
        if (weapon.category === "melee") {
            attributeName = "body";
            skillName = "weaponSkill"
        } else {
            attributeName = "body";
            skillName = "ballisticSkill"
        }
        const attributes = actor.sheet._setSelectedAttribute(attributeName)
        const skills = actor.sheet._setSelectedSkill(skillName)
        const combat = actor.sheet._getCombat(weapon);
        return prepareCombatRoll(attributes, skills, combat);
    }

    static createSpellRoll(actor, spell) {
        const attributes = actor.sheet._setSelectedAttribute("mind")
        const skills = actor.sheet._setSelectedSkill("channelling")
        return preparePowerRoll(attributes, skills, spell);
    }
}