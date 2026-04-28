let target = Array.from(game.user.targets).find(t => t.actor);

if (target)
{
    target.actor.applyEffect({effectData: {
        name : `Corpse Candle Channelling Bonus (${this.item.specifier})`,
        img : this.effect.img,
        statuses: ["corpse-candle"],
        system : {
          scriptData: [{
            label : "Channelling Bonus",
            trigger: "dialog",
            script: `args.fields.bonusDice += Number(this.effect.specifier)`,
            options: { 
                hideScript: "return !args.spell && args.skillKey != 'channelling'",
                activateScript: "return true;",
                submissionScript: "this.effect.delete()"
            }
          }]
        }
      }})

    this.item.update({name: this.item.baseName});
}
else {
    this.script.notifications("No Target!", "error");
}