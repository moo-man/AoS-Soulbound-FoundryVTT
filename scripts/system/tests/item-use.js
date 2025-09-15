import SoulboundTest from "./test";

export default class SoulboundItemUseTest extends SoulboundTest {


    constructor(data) {
        super();
        if (!data)
            return 
        this.data = {
            testData : {
                itemId : data.itemId,
            },
            context : {
                speaker : data.speaker,
                title: data.title,
                targetSpeakers : data.targets || [],
                rollClass : this.constructor.name,
                itemId : data.itemId,
                focusAllocated : false,
                messageId : undefined,
                rollMode : data.rollMode
            },
            result : {}
        }
    }

    static recreate(data)
    {
        let test = new game.aos.config.rollClasses[data.context.rollClass]();
        test.data = data;
        return test
    }



    static fromItem(item, actor)
    {
        return new this({
            speaker : CONFIG.ChatMessage.documentClass.getSpeaker({actor}),
            targetSpeakers : Array.from(game.user.targets).map(t => t.actor.speakerData(t.document)),
            rollMode: game.settings.get("core", "rollMode"),
            itemId : item.uuid,
            title : item.name
        })
    }



    get template() {
        return "systems/age-of-sigmar-soulbound/templates/chat/item-use.hbs"
    }


    async roll() {
        this.result.description = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.description, {secrets: false, relativeTo: this.item})
    }

    _hasTest(item) {
        return this.item?.hasTest
    }

}