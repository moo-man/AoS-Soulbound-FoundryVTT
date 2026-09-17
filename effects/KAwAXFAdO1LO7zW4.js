if (args.type == "effect" && args.options.action == "update")
{
  if (foundry.utils.hasProperty(args.data, "disabled") && args.document.id == "xIq4gXnXXmpYghwG")
  {
    let zoneEffect = this.item.effects.get("BCSMTZ293y1oPaJK");
    zoneEffect?.update({disabled: args.data.disabled});
  }
}