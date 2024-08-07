let confirm = await Dialog.confirm({content : `Are you sure you wish to use the <strong>${this.item.name}</strong>?`, title : this.item.name});

if (confirm)
{
    let uses = this.item.getFlag("age-of-sigmar-soulbound", "uses") || {};
    if (uses[this.actor.id])
    {
        uses[this.actor.id]++;
    }
    else 
    {
        uses[this.actor.id] = 1;
    }
    
    if (uses[this.actor.id] > this.actor.system.attributes.soul.value)
    {
        this.script.message(`<strong>${this.actor.name}</strong> dies and becomes a @UUID[Compendium.soulbound-bestiary.journals.JournalEntry.BSUIatrvpwVLc0cH.JournalEntryPage.3GUrZazfexQTZexg]{Nighthaunt}`)
    }
    else 
    {
        this.actor.applyEffect({effectUuids : [this.item.effects.contents[0].uuid]})
    }
    this.item.setFlag("age-of-sigmar-soulbound", "uses", uses)
}