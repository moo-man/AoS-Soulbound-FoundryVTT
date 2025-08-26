export default class Migration {

    static async checkMigration() {
        let migrationTarget = "8.0.0"
        let systemMigrationVersion = game.settings.get("age-of-sigmar-soulbound", "systemMigrationVersion")

        if (!systemMigrationVersion || foundry.utils.isNewerVersion(migrationTarget, systemMigrationVersion)) 
        {

            ChatMessage.create({
                content: `
                <h1>New Users - Read This!</h1>
                <p>Welcome! Before you dive in, it may be best to browse the Wiki, below are some important topics:</p>
                <ul>
                <li><p><a href="https://moo-man.github.io/AoS-Soulbound-FoundryVTT/pages/faq.html">FAQ</a></p></li>
                <li><p><a href="https://moo-man.github.io/AoS-Soulbound-FoundryVTT/pages/premium.html">Premium Content</a> (this will tell you how to use any official content you've purchased!</p></li>
                <li><p><a href="https://moo-man.github.io/AoS-Soulbound-FoundryVTT/pages/troubleshooting.html">Troubleshooting</a></p></li>
                </ul>
                <p><strong>Note</strong>: The Wiki is still heavily WIP, having just been created.</p>
                <p><strong>Also Note</strong>: Character Creation has not been converted to AppV2 yet (see below), until then, it may have styling issues and bugs!</p>
                <hr>
                <h1>Soulbound in Foundry V13</h1>
                <p>As Foundry itself progresses in its adoption of its new application framework, so too has the Soulbound system. All sheets and applications have been converted to use AppV2, my hope is that I have covered all existing functionality, but it is inevitable that more complex sheets (such as Actor sheets) may be missing some features here and there. Please be patient as I work through issues that arise!
                <ul>
                    <li><p>Actor and Item Sheets in V2 have had their <em>right click</em> functionalities greatly expanded. You can right click any owned Item or Active Effect to see a context menu for various actions.</p></li>
                    <li><p>Module Initialization has been centralized in the System settings, check the wiki link above!</p></li>
                </ul>`
            })

            if (foundry.utils.isNewerVersion("7.0.0", systemMigrationVersion))
            {
                this.migrateWorld();
            }

            game.settings.set("age-of-sigmar-soulbound", "systemMigrationVersion", game.system.version)
        }
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
        ui.notifications.notify(`Applying AOS:Soulbound System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`)

        for (let actor of game.actors.contents) {
            try {
                console.log(`Migrating Actor ${actor.name}`)
                let updateData = await this.migrateActor(actor)
                await this.migrateActorEffectRefactor(actor);
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
                await this.migrateItemEffectRefactor(actor);

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

        ui.notifications.notify(`Migration Complete`)

    }

    static async migrateActor(actor) {
        let updateData = {
            items: []
        }
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

        return updateData
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

    static async migrateActorEffectRefactor(actor)
    {
        let effectsToDelete = [];

        for(let effect of actor.effects)
        {
            let originItem = await fromUuid(actor.pack ? `Compendium.${actor.pack}.${effect.origin}` : effect.origin);
            if (originItem)
            {
                let originEffect = originItem.effects.getName(effect.name);
                if (originEffect)
                {
                    let effectData = effect.toObject();
                    effectData.transfer = originEffect.transfer;
                    originEffect.update(this.migrateEffectRefactor(effectData, effect));
                    effectsToDelete.push(effect.id);
                }
            }
        }
        await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToDelete);
        for(let item of actor.items)
        {
            await this.migrateItemEffectRefactor(item);
        }

    }

    static async migrateItemEffectRefactor(item)
    {
        for(let effect of item.effects)
        {
            await effect.update(this.migrateEffectRefactor(effect.toObject(), effect));
        }
    }

    static migrateEffectRefactor(data, document)
    {
        let changes = data?.changes || [];
        let migrateScripts = false;
        if (changes.some(c => c.mode == 6 || c.mode == 7) || data.system?.scriptData?.length == 0)
        {
            migrateScripts = true;
        }

        if (document.parent.documentName == "Item" && !document.getFlag("age-of-sigmar-soulbound", "migrated"))
        {
            if (data.transfer == false)
            {
                setProperty(data, "system.transferData.type", "target");
            }
            setProperty(data, "flags.age-of-sigmar-soulbound.migrated", true);
        }
    
        if (migrateScripts) 
        {
            let scriptData = []

            let changeConditon = foundry.utils.getProperty(data, "flags.age-of-sigmar-soulbound.changeCondition");
            for (let i in changeConditon) {
                if (changes[i]?.mode >= 6) {
                    let script;

                    if (changes[i].value === "true" || changes[i].value === "false") {
                        script = `args.fields.${changes[i].key.split("-").map((i, index) => index > 0 ? i.capitalize() : i).join("")} = ${changes[i].value}`
                    }
                    else if (changes[i].value.includes("@"))
                    {
                        script = `args.fields.${changes[i].key.split("-").map((i, index) => index > 0 ? i.capitalize() : i).join("")} += (${changes[i].value.replace("@", "args.actor.system.")})`
                    }
                    else {
                        script = `args.fields.${changes[i].key.split("-").map((i, index) => index > 0 ? i.capitalize() : i).join("")} += (${changes[i].value})`
                    }
                    scriptData.push({
                        trigger: "dialog",
                        label: changeConditon[i].description,
                        script: script,
                        options: {
                            targeter: changes[i].mode == 7,
                            activateScript: changeConditon[i].script,
                            hideScript: changeConditon[i].hide
                        }
                    })
                }
            }

            const convertScript = (str = "") => {
                str = str.replaceAll("@test", "this.effect.sourceTest");
                str = str.replaceAll("data.", "args.");
                str = str.replaceAll("attributeKey", "fields.attribute");
                str = str.replaceAll("skillKey", "fields.skill");
                return str;
            }


            for (let newScript of scriptData) {
                newScript.script = convertScript(newScript.script);
                newScript.options.hideScript = convertScript(newScript.options.hideScript);
                newScript.options.activateScript = convertScript(newScript.options.activateScript);
                newScript.options.submissionScript = convertScript(newScript.options.submissionScript);
            }



            data.changes = data.changes.filter(i => i.mode < 6);
            setProperty(data, "system.scriptData", scriptData)
        }
        return data;
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