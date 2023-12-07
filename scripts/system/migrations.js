export default class Migration {

    static async checkMigration() {
        let migrationTarget = "6.0.0"
        let systemMigrationVersion = game.settings.get("age-of-sigmar-soulbound", "systemMigrationVersion")

        if (!systemMigrationVersion || foundry.utils.isNewerVersion(migrationTarget, systemMigrationVersion)) {
            this.migrateWorld();
        }

        // if (!systemMigrationVersion || foundry.utils.isNewerVersion(migrationTarget, systemMigrationVersion)) {
        //     this.migrateExperience();
        // }
        game.settings.set("age-of-sigmar-soulbound", "systemMigrationVersion", game.system.version)
    }

    // static async migrateExperience() {
    //     console.log(`Applying AOS:Soulbound System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`);

    //     let players = game.actors.contents.filter(x => x.type === "player");
    //     for (let player of players) {
    //         try {
    //             let updateData = {}
    //             console.log(`Migrating Actor ${player.name}`);
    //             let current = player.experience || 0; // keep for later, expecting this to be unspent XP
    //             updateData["system.experience"] = { total: 0 };
    //             await player.update(updateData); // update to new datastructure

    //             // After the upate use calculated data to combine spent and current xp
    //             updateData["system.experience"] = { total: current + player.experience.spent };
    //             await player.update(updateData);
    //         } catch (e) {
    //             console.error(`Failed migration for Actor ${player.name}: ${e.message}`);
    //         }
    //     }
    // }

    static async migrateWorld() {
        console.log(`Applying AOS:Soulbound System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`)

        for (let actor of game.actors.contents) {
            try {
                console.log(`Migrating Actor ${actor.name}`)
                let updateData = await this.migrateActor(actor)
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

        
        for (let i of game.journal.contents) {
            try {
                console.log(`Migrating Journal ${i.name}`)
                let updateData = this.migrateJournalData(i)
                await i.update(updateData)
            }
            catch (e) {
                console.error(`Failed migration for Journal ${i.name}: ${e.message}`)
            }
        }

        
        for (let i of game.tables.contents) {
            try {
                console.log(`Migrating Table ${i.name}`)
                let updateData = this.migrateTableData(i)
                await i.update(updateData)
            }
            catch (e) {
                console.error(`Failed migration for Table ${i.name}: ${e.message}`)
            }
        }
    }

    static async migrateActor(actor) {
        let updateData = {
            items: []
        }
        updateData.effects = actor.effects.map(this.migrateEffect)
        let html = this._migrateV10Links(actor.system.notes)
        if (html != actor.system.notes) {
            updateData["system.notes"] = html;
        }

        for(let item of actor.items)
        {
            let itemData = this.migrateItem(item);
            if (!foundry.utils.isEmpty(itemData))
            {
                itemData._id = item.id;
                updateData.items.push(itemData);
            }
        }

        if (updateData.items.length == 0)
        {
            delete updateData.items;
        }

        return updateData
    }

    static migrateItem(item) {
        let updateData = {

        }

        if (item.category == "range")
        updateData["system.category"] = "ranged"
        
        let html = this._migrateV10Links(item.system.description)
        if (html != item.system.description) {
            updateData["system.description"] = html;
        }

        updateData.effects = item.effects.map(this.migrateEffect)

        return updateData
    }

    static migrateEffect(effect) {
        let effectData = effect.toObject()

        let description = effect.getFlag("age-of-sigmar-soulbound", "description")
        effectData.changes.forEach((c, i) => {
            if (c.mode == 0) {
                if (c.key.includes("target"))
                    c.mode = 7
                else
                    c.mode = 6
                setProperty(effectData, `flags.age-of-sigmar-soulbound.changeCondition.${i}`, { description, script: "" })
            }
        })
        return effectData
    }


    static migrateJournalData(journal) {
        let updateData = { _id: journal.id, pages: [] };

        for (let page of journal.pages) {
            let html = page.text.content;
            console.log(`Checking Journal Page HTML ${journal.name}.${page.name}`)
            let newHTML = this._migrateV10Links(html)

            if (html != newHTML) {
                updateData.pages.push({ _id: page.id, "text.content": newHTML });
            }
        }
        return updateData;
    }

    static migrateTableData(table) {
        let updateData = { _id: table.id, results: [] };

        for (let result of table.results) {
            if (result.type == 0) {
                let html = result.text;
                let newHTML = this._migrateV10Links(html)

                if (html != newHTML) {
                    updateData.results.push({ _id: result.id, text: newHTML });
                }
            }

            else if (result.type == 2 && this.v10Conversions[result.documentCollection]) {
                updateData.results.push({ _id: result.id, documentCollection: this.v10Conversions[result.documentCollection] });
            }
        }
    }


    static v10Conversions = {
        "soulbound-core.bestiary": "soulbound-core.actors",
        "soulbound-core.archetypes": "soulbound-core.items",
        "soulbound-core.equipment": "soulbound-core.items",
        "soulbound-core.miracles": "soulbound-core.items",
        "soulbound-core.spells": "soulbound-core.items",
        "soulbound-core.talents": "soulbound-core.items",
        "soulbound-order.equipment": "soulbound-order.items",
        "soulbound-order.archetypes": "soulbound-order.items",
        "soulbound-order.talents": "soulbound-order.items",
        "soulbound-order.spells": "soulbound-order.items",
        "soulbound-order.miracles": "soulbound-order.items",
    }


    static _migrateV10Links(html) {
        try {
            if (!html) return

            for (let key in this.v10Conversions) {
                let priorHTML = html
                html = html.replaceAll(key, this.v10Conversions[key])
                if (html != priorHTML) {
                    console.log(`Replacing ${key} with ${this.v10Conversions[key]}`)
                }
            }
            return html;
        }
        catch (e) {
            console.error("Error replacing links: " + e);
        }
    }

    static _getParenthesesText(text) {
        return text.slice(text.indexOf("(") + 1, text.indexOf(")"))
    }
}