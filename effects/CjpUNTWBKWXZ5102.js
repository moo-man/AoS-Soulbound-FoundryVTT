Item.create({
    "name": "Mandibles",
    "type": "weapon",
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "<p>A creature damaged by this attack is @UUID[Compendium.soulbound-core.journals.JournalEntry.iUQ14OOc9XlVIeLG.JournalEntryPage.hNuI4uvL9qfEzaJp#poisoned]{Poisoned} until the end of their next turn.</p>",
        "category": "melee",
        "damage": "2 + S",
        "availability": "",
        "cost": "—",
        "traits": [
            {
                "name": "rend"
            },
            {
                "name": "slashing"
            }
        ],
        "attribute": "body"
    },
    "effects": [
        {
            "statuses": [
                "poisoned"
            ],
            "name": "Poisoned",
            "img": "systems/age-of-sigmar-soulbound/assets/icons/poisoned.svg",
            "system": {
                "scriptData": [
                    {
                        "label": "Penalty to all Tests",
                        "script": "args.fields.bonusDice -= 1",
                        "trigger": "dialog",
                        "options": {
                            "activateScript": "return true;",
                            "targeter": false,
                            "defending": false,
                            "runIfDisabled": false,
                            "deleteEffect": false,
                            "showDuplicates": false
                        },
                        "async": false
                    }
                ],
                "transferData": {
                    "type": "damage",
                    "originalType": "document",
                    "documentType": "Actor",
                    "avoidTest": {
                        "value": "none",
                        "opposed": false,
                        "prevention": true,
                        "reversed": false
                    },
                },
            },
            "_id": "asKeW6DwqeOsIMpH",
            "type": "base",
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})