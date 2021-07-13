export default class Migration {

    static async checkMigration() {
        let needsMigrationVersion = "3.1.0"
        let systemMigrationVersion = game.settings.get("age-of-sigmar-soulbound", "systemMigrationVersion")

        if (!systemMigrationVersion || !foundry.utils.isNewerVersion(systemMigrationVersion, needsMigrationVersion)) {
            this.migrateWorld()
        }
        game.settings.set("age-of-sigmar-soulbound", "systemMigrationVersion", game.system.data.version)
    }


    static async migrateWorld() {
        console.log(`Applying AOS:Soulbound System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`)

        for (let actor of game.actors.contents) {
            try {
                console.log(`Migrating Actor ${actor.name}`)
                let updateData = this.migrateActor(actor.data)
                await actor.update(updateData)
            }
            catch (e) {
                console.error(`Failed migration for Actor ${actor.name}: ${e.message}`)
            }

        }

    }

    static async migrateActor(actor) {
        let updateData = {}
        if (actor.type == "npc" && !actor.flags["age-of-sigmar-soulbound"]) {
            updateData = {
                "flags.autoCalcTokenSize": true
            }
        }
        return updateData
    }
}