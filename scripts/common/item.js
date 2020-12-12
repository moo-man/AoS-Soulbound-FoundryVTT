export class AgeOfSigmarItem extends Item {
    static async create(data, options) {
        super.create(data, options);
    }

    async sendToChat() {
        const item = duplicate(this.data);
        if (item.img.includes("/unknown")) {
            item.img = null;
        }
        item.isGoal = item.type === "goal";
        item.isConnection = item.type === "connection";
        item.isWound = item.type === "wound";
        item.isSpell = item.type === "spell";
        item.isMiracle = item.type === "miracle";
        item.isTalent = item.type === "talent";
        item.isArmour = item.type === "armour";
        item.isWeapon = item.type === "weapon";
        item.isAethericDevice = item.type === "aethericDevice";
        item.isRune = item.type === "rune";
        item.isEquipment = item.type === "equipment";
        const html = await renderTemplate("systems/age-of-sigmar-soulbound/template/chat/item.html", item);
        const chatData = {
            user: game.user._id,
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
        };
        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");
        } else if (chatData.rollMode === "selfroll") {
            chatData.whisper = [game.user];
        }
        ChatMessage.create(chatData);
    }
}