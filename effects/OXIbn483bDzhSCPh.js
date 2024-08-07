if (this.item.name.includes("(Choose)"))
    {
        let allSpells = await warhammer.utility.findAllItems("spell", "Loading Spells");
        let lores = ["Amber", "Amethyst", "Bright", "Celestial", "Gold", "Grey", "Jade", "Light", "The Deeps"];
        let lore = await ItemDialog.create(lores.map(i => { return {id : i.slugify(), name : i, img : this.item.img};}), 1, {title : this.effect.name, text : "Choose Lore"});
            
        if (lore[0])
        {
            this.item.updateSource({name : this.item.name.replace("Choose", lore[0].name)});
            this.effect.updateSource({name : this.effect.name.replace("Choose", lore[0].name), "system.transferData.type" : "other"});
            let loreSpells = allSpells.filter(i => (i.system.lore == "Common" || i.system.lore == lore[0].name) && !["Mystic Shield", "Arcane Bolt"].includes(i.name));
            if (loreSpells.length)
            {
                ItemDialog.create(loreSpells, 4, {title : this.effect.name, text : "Choose 4 Spells"}).then(spells => 
                {
                    spells = spells.concat(allSpells.filter(i => ["Mystic Shield", "Arcane Bolt"].includes(i.name)))
                    this.actor.createEmbeddedDocuments("Item", spells, {fromEffect: this.effect.id});
                });
            }
        }
    }