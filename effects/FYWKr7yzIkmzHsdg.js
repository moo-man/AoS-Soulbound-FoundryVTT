Item.create({
    "name": "Bite",
    "type": "weapon",
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "<p>An @UUID[JournalEntry.gvm7f7XusbIys5wM.JournalEntryPage.EcsbWALQROzR1QMu#ogor]{Ogor's} bite deals + S Damage, and has the @UUID[Compendium.soulbound-core.journals.JournalEntry.jbNCZWQLegnUEmQN.JournalEntryPage.CntBWfAowyjNzUCJ#piercing]{Piercing} and @UUID[Compendium.soulbound-core.journals.JournalEntry.jbNCZWQLegnUEmQN.JournalEntryPage.CntBWfAowyjNzUCJ#rend]{Rend} Traits.</p>",
        "category": "melee",
        "damage": "+ S",
        "cost": "—",
        "traits": [
            {
                "name": "piercing"
            },
            {
                "name": "rend"
            }
        ],
        "attribute": "body"
    }
}, {parent: this.actor, fromEffect: this.effect.id})