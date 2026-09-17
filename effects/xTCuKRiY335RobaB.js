let cover = this.actor.effects.contents.filter(i => i.statuses.has("total") || i.statuses.has("partial"));

cover.forEach(e => {
  e.update({disabled: true})
})