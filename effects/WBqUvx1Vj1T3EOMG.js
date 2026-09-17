Item.create({
    "name": "Skitterstrand Fangs",
    "type": "weapon",
    "folder": "TCovxfnXO0v98WoK",
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
    "system": {
        "equipped": true,
        "test": {
            "attribute": "body",
            "skill": "fortitude",
            "dn": "4:3",
        },
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
                        },
                    }
                ],
                "transferData": {
                    "type": "damage",
                    "avoidTest": {
                        "value": "item",
                        "prevention": true,
                    },
                },
            },
            "_id": "asKeW6DwqeOsIMpH",
            "type": "base",
        },
        {
            "name": "Skitterstrand Fangs",
            "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
            "_id": "EJ6fZkmOZY7K6Bkx",
            "type": "base",
            "system": {
                "transferData": {
                    "documentType": "Item",
                },
                "scriptData": [
                    {
                        "script": "args.fields.bonusDice = 10 - args.numberOfDice();\nargs.fields.attack = 5;",
                        "label": "10d6 (Superb)",
                        "trigger": "dialog",
                        "options": {
                            "activateScript": "return true;",
                        },
                    }
                ],
            }
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})