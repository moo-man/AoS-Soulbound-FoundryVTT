let spell = await fromUuid(this.effect.flags[game.system.id].spell)

this.actor.addEffectItems(spell.uuid, this.effect);

this.effect.updateSource({name: this.effect.setSpecifier(spell.name)});