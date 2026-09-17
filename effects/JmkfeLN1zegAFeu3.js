Item.create({
    "name": "Thrown Boulder",
    "type": "weapon",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "<p>The target of this attack must make a DN 4:X Body (Might or Reflexes) Test, where X is equal to the Damage taken. On a failure, they are knocked @UUID[Compendium.soulbound-core.journals.JournalEntry.iUQ14OOc9XlVIeLG.JournalEntryPage.hNuI4uvL9qfEzaJp#prone]{Prone}.</p>",
        "category": "ranged",
        "damage": "1 + S",
        "availability": "",
        "cost": "",
        "traits": [
            {
                "name": "crushing"
            },
            {
                "name": "loud"
            },
            {
                "name": "range",
                "value": "Medium"
            },
            {
                "name": "spread"
            }
        ],
        "attribute": "body"
    },
    "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
    "effects": [
        {
            "name": "Thrown Boulder",
            "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
            "type": "base",
            "system": {
                "transferData": {
                    "documentType": "Item",
                },
                "scriptData": [
                    {
                        "script": "if (args.damage <= 0)\n  return;\n\nlet skill = await foundry.applications.api.Dialog.wait({window: {title: this.effect.name}, content: \"Choose Skill to resist being knocked Prone.\", buttons: [\n  {\n    action: \"might\",\n    label: \"Might\"\n  },\n  {\n    action: \"Reflexes\",\n    label: \"Reflexes\"\n  }\n]})\n\nif (skill)\n{\n  let test = await this.actor.setupCommonTest({skill}, {dn: `4:${args.damage}`, appendTitle: ` - ${this.effect.name}`});\n  if (test.failed)\n  {\n    this.actor.addCondition(\"prone\");\n  }\n}",
                        "label": "Prone",
                        "trigger": "applyDamage",
                    }
                ],
            },
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})