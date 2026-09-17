if (args.test?.weapon.system.isMagical)
    {
        this.actor.applyEffect({effectData : [{
            name : `Damage Bonus`,
            origin : this.effect.uuid,
            img : this.effect.img,
            statuses : ["warpstoneDamageBonus"],
            duration : {
                turns: 1
            },
            system : {
                scriptData : [
                {
                    label : "+1 Damage",
                    trigger : "dialog",
                    script : "args.fields.bonusDamage++;",
                    options : {
                        activateScript : "return true;",
                        hideScript : "return !args.weapon && !args.spell;"
                    }
                },
                {
                    label : "Delete",
                    trigger : "endTurn",
                    script : "this.effect.delete();"
                }
                ]
            }
        }]})
    }