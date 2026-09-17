debugger;
this.actor.system.combat.defence.total = this.actor.system.attributes.body.value + this.actor.system.skills.devotion.training + (this.actor.system.combat.defence.bonus * 2);
this.actor.system.combat.defence.relative = this.actor.system.combat._getCombatLadderValue("defence");
this.actor.system.combat.defence.ability = this.actor.system.combat._getCombatAbility("defence");