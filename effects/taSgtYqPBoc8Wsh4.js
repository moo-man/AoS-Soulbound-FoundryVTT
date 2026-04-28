this.actor.addEffectItems("Compendium.soulbound-core.items.Item.nop4Bja1CoY2s2dO", this.effect, {
    effects: [
        {
            "name": "Unarmed",
            "img": "modules/soulbound-core/assets/icons/weapons/unarmed.webp",
            "system": {
                "transferData" : {
                    "documentType": "Item"
                },
                "scriptData": [
                    {
                        "script": "let halfDamage = Math.floor(args.damage / 2);\n\nthis.actor.applyHealing({toughness: halfDamage});",
                        "label": "Heal",
                        "trigger": "applyDamage",
                    }
                ],
            },
        }
    ],
    system : {
        equipped: true,
        traits: [{name: "piercing"}]
    }
})