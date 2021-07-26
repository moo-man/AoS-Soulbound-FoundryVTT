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
                let updateData = await this.migrateActor(actor.data)
                await actor.update(updateData)
                await this.cleanActorData(actor)
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
        let wounds = actor.items.filter(i => i.type == "wound")
        let newWounds = wounds.map(i => {
            let woundType = i.data.data.woundType
            if (!woundType)
            {
                switch (i.data.data.damage)
                {
                case 1 : 
                    woundType = "minor";
                    break;
                case 2 : 
                    woundType = "serious";
                    break;
                case 3 :
                    woundType = "deadly";
                    break;
                }
            }
            return {
                type : woundType,
                damage : i.data.data.damage
            }
        })
        setProperty(updateData, "data.combat.wounds", newWounds)
        return updateData
    }

    static async cleanActorData(actor)
    {
        await actor.deleteEmbeddedDocuments("Item", actor.items.filter(i => i.type == "wound").map(i => i.id))
    }
}