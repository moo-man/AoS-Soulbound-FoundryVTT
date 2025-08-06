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

        return `DN ${test.dn} ${game.aos.config.attributes[test.attribute]} (${game.aos.config.skills[test.skill]})`
    }

    async resistEffect() {
        let actor = this.actor;

        // If no owning actor, no test can be done
        if (!actor) {
            return false;
        }

        let transferData = this.system.transferData;

        // If no test, cannot be avoided
        if (transferData.avoidTest.value == "none") {
            return false;
        }

        let options = {
            appendTitle: " - " + this.name,
            skipTargets: true
        };

        let test;
        if (transferData.avoidTest.value == "script") {
            let script = new WarhammerScript({ label: this.effect + " Avoidance", script: transferData.avoidTest.script }, WarhammerScript.createContext(this));
            return await script.execute();
        }
        else if (transferData.avoidTest.value == "item") {
            test = await this.actor.setupTestFromItem(this.system.sourceData.item, options);
        }
        else if (transferData.avoidTest.value == "custom") {
            let dnObject = SoulboundUtility.DNToObject(transferData.avoidTest.dn)
            options.fields = dnObject;
            test = await this.actor.setupCommonTest({ attribute: transferData.avoidTest.attribute, skill: transferData.avoidTest.skill }, options)
        }

        if (!transferData.avoidTest.reversed) {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed) {
                // TODO
            }
            else {
                return test.succeeded
            }
        }
        else  // Reversed - Failure removes the effect
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed) {
                // TODO
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
        if (!this.origin?.includes("Drawing"))
            return super.source
        else {
            let drawing = fromUuidSync(this.origin);
            if (drawing) {
                return drawing.text;
            }
            else {
                return super.source;
            }
        }
    }

    get isCondition() {
        return CONFIG.statusEffects.map(i => i.id).includes(Array.from(this.statuses)[0])
    }
}