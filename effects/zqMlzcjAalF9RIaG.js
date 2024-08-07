if (this.item.name.includes("(Choose)"))
    {
        let allMiracles = await warhammer.utility.findAllItems("miracle", "Loading Miracles");
        let gods = ["Sigmar", "Ethersea", "Teclis", "Alarielle", "Grungni", "Khaine", "Grimnir"];
        let god = await ItemDialog.create(gods.map(i => { return {id : i.slugify(), name : i, img : this.item.img};}), 1, {title : this.effect.name, text : "Choose God"});
            
        if (god[0])
        {
            this.item.updateSource({name : this.item.name.replace("Choose", god[0].name)});
            this.effect.updateSource({name : this.effect.name.replace("Choose", god[0].name), "system.transferData.type" : "other"});
            let godMiracles = allMiracles.filter(i => i.system.god == god[0].name);
            if (godMiracles.length)
            {
                ItemDialog.create(godMiracles, 1, {title : this.effect.name, text : "Choose Miracle"}).then(miracles => 
                {
                    this.actor.createEmbeddedDocuments("Item", miracles, {fromEffect: this.effect.id});
                });
            }
        }
    }