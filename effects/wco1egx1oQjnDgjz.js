let success = await this.effect.resistEffect();

if (success)
{
  this.effect.delete();
}