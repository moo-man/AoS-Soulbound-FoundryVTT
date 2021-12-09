export default class Migration {

    static async checkMigration() {
        let migrationTarget = "4.0.0"
        let systemMigrationVersion = game.settings.get("age-of-sigmar-soulbound", "systemMigrationVersion")

        if (!systemMigrationVersion || foundry.utils.isNewerVersion(migrationTarget, systemMigrationVersion)) {
            this.migrateWorld()
        }
        game.settings.set("age-of-sigmar-soulbound", "systemMigrationVersion", game.system.data.version)
    }


    static async migrateWorld() {
        console.log(`Applying AOS:Soulbound System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`)

        for (let actor of game.actors.contents) {
            try {
                console.log(`Migrating Actor ${actor.name}`)
                let updateData = await this.migrateActor(actor.data)
                await actor.update(updateData)
                await this.cleanActorData(actor)
            }
            catch (e) {
                console.error(`Failed migration for Actor ${actor.name}: ${e.message}`)
            }

        }

        for (let i of game.items.contents) {
            try {
                if (i.type == "ally" || i.type == "connection" || i.type == "enemy" || i.type == "fear" || i.type == "goal" || i.type == "resource" || i.type == "rumour" || i.type == "threat") {
                    let newItem = this._convertToPartyItem(i)
                    await Item.create(newItem)
                    await i.delete()
                    console.log(`Deleting Item ${i.name}`)
                }
                else 
                {
                    console.log(`Migrating Item ${i.name}`)
                    let updateData = this.migrateItem(i)
                    i.update(updateData)
                }
            }
            catch (e) {
                console.error(`Failed migration for Item ${i.name}: ${e.message}`)
            }

        }

    }

    static async migrateActor(actor) {
        let updateData = {
            items: []
        }
        if (actor.type == "npc" && !actor.flags["age-of-sigmar-soulbound"]) {
            updateData = {
                "flags.autoCalcTokenSize": true
            }
        }

        updateData.items = actor.items.map(this.migrateItem)

        let partyItems = actor.items.filter(i => i.type == "ally" || i.type == "connection" || i.type == "enemy" || i.type == "fear" || i.type == "goal" || i.type == "resource" || i.type == "rumour" || i.type == "threat")
        let newPartyItems = partyItems.map(this._convertToPartyItem)

        updateData.items = updateData.items.concat(newPartyItems)

        return updateData
    }

    static migrateItem(item)
    {   
        let updateData = {}
        let utility = game.aos.utility
        let config = game.aos.config

        if (item.effect)
            updateData["data.description"] = `${item.description}<p>${item.effect}</p>`
        
        if (item.type == "spell")
        {
            if (item.test)
            {
                let rgx = /(.:.)\s(.+?)\s?\((.+?)\)/
                let match = item.test.match(rgx)
                updateData["data.test"] = {
                    dn : match[1],
                    attribute : match[2].toLowerCase(),
                    skill : match[3].toLowerCase()
                }
            }
            if (item.duration && item.duration.includes(" "))
            {
                let value = parseInt(item.duration) || ""
                let unit = item.duration.split(" ")[1].toLowerCase()
                updateData["data.duration"] = {
                    value, 
                    unit
                }
            }
            else if (item.duration)
            {
                updateData["data.duration"] = {
                    unit : item.duration.toLowerCase()
                }
            }

        }
        if (item.traits)
        {
            let traits = item.traits.split(",").map(i => i.trim())
            updateData["data.traits"] = traits.map(t => {
                let value
                if (t.includes("("))
                    value = this._getParenthesesText(t)
                let trait = {}
                if (value)
                    trait.value = Number.isNumeric(value) ? parseInt(value) : value
                trait.name = utility.findKey(t.split("(")[0].trim(), config.traits)
                return trait
            })
        }
        updateData._id = item.id
        return updateData

    }

    static _convertToPartyItem(item) {
        let i = item.toObject()
        if (i.type == "goal") {
            if (i.data.type == "short")
                i.data.category = "shortGoal"
            else if (i.data.type == "long")
                i.data.category = "longGoal"
        }
        else
            i.data.category = i.type
        delete i._id
        i.type = "partyItem"
        return i
    }

    static async cleanActorData(actor) {
        await actor.deleteEmbeddedDocuments("Item", actor.items.filter(i => i.type == "wound" || i.type == "ally" || i.type == "connection" || i.type == "enemy" || i.type == "fear" || i.type == "goal" || i.type == "resource" || i.type == "rumour" || i.type == "threat").map(i => i.id))
    }
}