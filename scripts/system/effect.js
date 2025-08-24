import SoulboundUtility from "./utility";

export default class SoulboundEffect extends WarhammerActiveEffect {


    constructor(data, context) {
        super(data, context);
    }

    static CONFIGURATION = {
        zone: true
    }

    get testDisplay() {

        let test

        if (this.system.transferData.avoidTest.value == "custom") {
            test = this.system.transferData.avoidTest;
        }
        else if (this.system.transferData.avoidTest.value == "item") {
            test = this.item.system.test
        }

        if (test)
        {
            return `DN ${test.dn} ${game.aos.config.attributes[test.attribute]} (${game.aos.config.skills[test.skill]})`
        }
        else return "";
    }

    async resistEffect() {
        let actor = this.actor;

        // If no owning actor, no test can be done, or if an item directly owns the effect
        if (!actor || this.parent.documentName == "Item") {
            return false;
        }

        let transferData = this.system.transferData;

        // If no test, cannot be avoided
        if (transferData.avoidTest.value == "none") {
            return false;
        }

        let context = {
            appendTitle: " - " + this.name,
            skipTargets: true
        };

        let test;
        if (transferData.avoidTest.value == "script") {
            let script = new WarhammerScript({ label: this.effect + " Avoidance", script: transferData.avoidTest.script }, WarhammerScript.createContext(this));
            return await script.execute();
        }
        else if (transferData.avoidTest.value == "item") {
            // let item = this.sourceItem?.toObject();
            // if (item && item.system.test.difficulty.complexity == "S")
            // {
            //     context.fields = {complexity : 1 + this.sourceTest.result.degree};
            // }
            test = await this.actor.setupTestFromItem(this.system.sourceData.item, context);
        }
        else if (transferData.avoidTest.value == "custom") {
            let dnObject = SoulboundUtility.DNToObject(transferData.avoidTest.dn)
            if (dnObject.complexity == "S")
            {
                dnObject.complexity = 1 + this.sourceTest.result.degree;
            }
            context.fields = dnObject;
            test = await this.actor.setupCommonTest({ attribute: transferData.avoidTest.attribute, skill: transferData.avoidTest.skill }, context)
        }

        if (!transferData.avoidTest.reversed) {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed) {
                return test.result.successes >= this.sourceTest?.result.successes
            }
            else {
                return test.succeeded
            }
        }
        else  // Reversed - Failure removes the effect
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed) {
                return test.result.successes < this.sourceTest?.result.successes
            }
            else {
                return !test.succeeded;
            }
        }
    }

    convertToApplied(test) {
        let effectData = super.convertToApplied(test);
        if (test) {
            // Prioritize test result duration over item duration (test result might be overcasted)
            let duration = test.result.duration || test.item?.duration
            if (duration) {
                if (duration.unit == "round")
                    effectData.duration.rounds = parseInt(duration.value)
                else if (duration.unit == "minute")
                    effectData.duration.seconds = parseInt(duration.value) * 60
                else if (duration.unit == "hour")
                    effectData.duration.seconds = parseInt(duration.value) * 60 * 60
                else if (duration.unit == "day")
                    effectData.duration.seconds = parseInt(duration.value) * 60 * 60 * 24
            }
        }
        return effectData
    }


    /** @override 
     * Adds support for referencing actor data
     * */
    apply(actor, change) {
        if (change.value.includes("@")) {
            log(`Deferring ${this.name} for ${this.parent?.name}`)
            if (change.value == "@doom" && !game.ready)
                actor.postReadyEffects.push(change)
            else
                actor.derivedEffects.push(change)
        }
        else {
            log(`Applying ${this.name} to ${this.parent?.name}`)
            super.apply(actor, change)
        }
    }

    fillDerivedData(actor, change) {
        try {

            if (change.value.includes("@test")) {
                let path = change.value.replace("@test.", "");
                change.value = getProperty(this.sourceTest, path)?.toString() || "0";
            }
            else {


                let data = (0, eval)(Roll.replaceFormulaData(change.value, actor.getRollData()))
                //Foundry Expects to find a String for numbers
                //Raw Numbers don't work anymore
                if (typeof data === "number") {
                    change.value = data.toString();
                } else {
                    change.value = data;
                }
            }
        }
        catch (e) {
            change.value = "0";
        }

    }

    get source() {
        if (!this.origin?.includes("Region"))
            return super.source
        else {
            let region = fromUuidSync(this.origin);
            if (region) {
                return region.name;
            }
            else {
                return super.source;
            }
        }
    }

    get isCondition() {
        return CONFIG.statusEffects.map(i => i.id).includes(Array.from(this.statuses)[0])
    }

    get zoneTags() 
    {
            return this.sourceZone?.flags[game.system.id]?.traits?.tags?.split(",").map(i => i.toLowerCase().trim()) || []
    }

    get sourceTest() 
    {
        let testData = this.system.sourceData.test.data;
        if (testData)
        {
            let message = game.messages.get(testData.context?.messageId);
            return message? message.system.test : game.wng.rollClasses[testData.class].recreate(testData);  
        }
    }
}