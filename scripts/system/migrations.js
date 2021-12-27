export default class Migration {

    static async checkMigration() {
        let migrationTarget = "4.2.2"
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
            }
            catch (e) {
                console.error(`Failed migration for Actor ${actor.name}: ${e.message}`)
            }

        }

        for (let i of game.items.contents) {
            try {
                    console.log(`Migrating Item ${i.name}`)
                    let updateData = this.migrateItem(i)
                    await i.update(updateData)
                }
            catch (e) {
                console.error(`Failed migration for Item ${i.name}: ${e.message}`)
            }

        }
    }

    static async migrateActor(actor) {
        let updateData = {}
        updateData.effects = actor.effects.map(this.migrateEffect)

        return updateData
    }

    static migrateItem(item)
    {   
        let updateData = {
            items: []
        }
        updateData.effects = item.effects.map(this.migrateEffect)

        return updateData
    }

    static migrateEffect(effect)
    {
        let effectData = effect.toObject()
        
        let description = effect.getFlag("age-of-sigmar-soulbound", "description")
        effectData.changes.forEach((c, i) => {
            if (c.mode == 0)
            {
                c.mode = 6
                setProperty(effectData, `flags.age-of-sigmar-soulbound.changeCondition.${i}`, {description, script:""})
            }
        })
        return effectData
    }


    static _getParenthesesText(text)
    {
        return text.slice(text.indexOf("(") + 1, text.indexOf(")"))
    }
}