if (args.fields.skill == "intimidation")
{
  args.fields.difficulty--;
}
else if (["guile", "entertain"].includes(args.fields.skill))
{
  args.fields.difficulty += 2;
}