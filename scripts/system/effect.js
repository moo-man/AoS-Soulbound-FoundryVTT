
export default class SoulboundEffect extends WarhammerActiveEffect {

    static CONFIGURATION = {
        zone : true
    }


    /** @override 
     * Adds support for referencing actor data
     * */
    apply(actor, change) {
        if (change.value.includes("@"))
        {
            log(`Deferring ${this.name} for ${this.parent?.name}`)
            if (change.value == "@doom" && !game.ready)
                actor.postReadyEffects.push(change)
            else
                actor.derivedEffects.push(change)
        }
        else
        {
            log(`Applying ${this.name} to ${this.parent?.name}`)
            super.apply(actor, change)
        }
    }

    fillDerivedData(actor, change) {

        // See if change references an ID
        let matches = Array.from(change.value.matchAll(/@UUID\[Actor\.(.+?)\]\.system\.(.+)/gm));

        if (matches[0])
        {
            let [, id, path] = matches[0]
            // If matches, replace values
            actor = game.actors.get(id)
            
            if (!actor)
            return console.error(`ERROR.ReferencedActorNotFound`);
            change.value = "@" + path;
        }

        let data = (0, eval)(Roll.replaceFormulaData(change.value, actor.getRollData()))
        //Foundry Expects to find a String for numbers
        //Raw Numbers don't work anymore
        if(typeof data === "number") {
            change.value = data.toString();
        } else {
            change.value = data;
        }
        
    }
    

    /**
     * Takes a test object and returns effect data populated with the results and overcasts computed
     * 
     * @param {Test} test 
     */
    static async populateEffectData(effectData, test, item)
    {
        effectData.origin = test.actor.uuid

        effectData.statuses = effectData.statuses || effectData.name.slugify()
        
        if(!item)  
            item = test.item

        // Prioritize test result duration over item duration (test result might be overcasted)
        let duration = test.result.duration || item.duration
        if (duration)
        {
            if (duration.unit == "round")
                effectData.duration.rounds = parseInt(duration.value)
            else if  (duration.unit == "minute")
                effectData.duration.seconds = parseInt(duration.value) * 60
            else if (duration.unit == "hour")
                effectData.duration.seconds = parseInt(duration.value) * 60 * 60
            else if (duration.unit == "day")
                effectData.duration.seconds = parseInt(duration.value) * 60 * 60 * 24
        }

        // Some effects (e.g. Aethyric Armour) may need to take from test data to fill its change value (to match with possible overcasts)
        // These effects have a change value of `@test.result.<some-property>`
        for(let change of effectData.changes)
        {
            let split = change.value.split(".")
            // Remove @test and replace it with the value
            let value = change.value
            if (split[0] == "@test")
            {
                // Remove @test and get the property from the test (@test.result.damage.total -> result.damage.total -> actual value)
                split.splice(0, 1)
                value = split.join(".")
                value = getProperty(test, value)
            }

            // Get referential derived data from a different actor
            if (split[0].includes("@UUID"))
            {
                change.value = change.value.replace("Actor.ID", `Actor.${test.actor.id}`)
            }

            if (Number.isNumeric(value))
                change.value = parseInt(value)
            else if (!change.value.includes("@UUID"))
                change.value = 0
        }


        return effectData


    }

    get source() {
        if (!this.origin?.includes("Drawing"))
            return super.source
        else 
        {
            let drawing = fromUuidSync(this.origin);
            if (drawing)
            {
                return drawing.text;
            }
            else 
            {
                return super.source;
            }
        }
    }

    get isCondition() {
        return CONFIG.statusEffects.map(i => i.id).includes(Array.from(this.statuses)[0])
    }
}