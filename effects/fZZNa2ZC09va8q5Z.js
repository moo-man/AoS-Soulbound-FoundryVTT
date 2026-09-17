if (!this.effect.sourceActor.sameSideAs(this.actor))
  return;

if (args.type == "effect" && args.options.action == "create" && ["difficult"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Ignore " + args.document.name);
  return false;
}