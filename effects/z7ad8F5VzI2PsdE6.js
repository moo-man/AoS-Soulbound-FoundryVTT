let tokens = this.actor.getActiveTokens();

for(let token of tokens)
{
  token.document.update({width: this.actor.system.bio.size - 1, height: this.actor.system.bio.size - 1})
}