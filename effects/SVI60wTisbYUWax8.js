let target = Array.from(game.user.targets).find(t => t.actor);

if (target)
{
    let soul = target.actor.system.attributes.soul.value;
    this.script.message(`Snuffed the <strong>Corpse Candle</strong> (${target.name})`);
    this.item.update({name: this.item.setSpecifier(soul)});

    target.actor.applyEffect({effectData: {
        name : "Corpse Candle",
        img : this.effect.img,
        system : {
          scriptData: [{
            label : "Damage",
            trigger: "immediate",
            script: `this.actor.applyDamage(${soul}, {ignoreArmour: true})`,
            options: { 
                deleteEffect: true
            }
          }]
        }
      }})
}
else 
{
    this.script.message(`Snuffed the <strong>Corpse Candle</strong> (No Target)`);
    this.item.update({name: this.item.baseName});
}