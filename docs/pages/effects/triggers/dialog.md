---
layout: default
title: Dialog
parent: Scripts
nav_order: 2
grand_parent: Active Effects
---

Dialog scripts show up within the **Dialog Modifiers** section in roll dialog windows, and are able to be toggled on or off, causing some sort of behavior. They are probably the most powerful type of script, especially when used in conjunction with other scripts. They are unique in that they have their main script, which is generally used to modify the dialog fields (adding to modifier, SL bonus, etc.), but they also have 3 subscripts, described below. 

- Hide Script: Returning true with this script hides the option from selection, taking precedent over Activate Script

- Activate Script: Returning true with this script results in this modifier being automatically activated in the dialog window (as opposed to manually clicking on the option)

- Submission Script: This script runs when this script is *activated* and the dialog is submitted. Usually this is for setting some special flag for another script to use. See the examples below. 


## Key

`dialog`

## Arguments 

The `args` parameter corresponds the dialog application itself. which has some useful properties. 

`args.actor` - Actor performing the test (important distinction to `this.actor` because of the targeter option (see **Special Features**))

`args.attributeKey` - The attribute being used for the roll

`args.skillKey` - The skill being used for the roll

`args.item` - The Item, such as the weapon, being used

`args.fields` - Specifically the editable properties (fields) in the dialog window

`args.advantage` - The number of "advantages"

`args.disadvantage` - The number of "disadvantages"

`args.fields` - Object of all the "fields" in the dialog

&emsp;`fields.attribute` - The attribute being used for the roll

&emsp;`fields.skill` - The skill being used for the roll

&emsp;`fields.difficulty` - The difficulty field

&emsp;`fields.complexity` - The complexity field

&emsp;`fields.doubleFocus` - The double focus checkbox

&emsp;`fields.doubleTraining` - The burst checkbox

&emsp;`fields.bonusDamage` - The Bonus Damage field

&emsp;`fields.bonusFocus` - The Bonus Focus field

&emsp;`fields.attack` - The Attack field

&emsp;`fields.primaryDefence` - The Defence value for the primary target

&emsp;`fields.triggerToDamage` - Invisible checkbox that sets a flag to add the number of 6s rolled to damage


`args.flags` - An object that is intended to freely be used by scripts, it is useful to prevent duplicate executions, such as for Talents that have been taken multiple times but should only execute once. 

There are a plethora of other properties available to look at, you can use the console command `ui.activeWindow` with a dialog in focus to see everything available.


## Special Features

With `Targeter` selected, a dialog effect is designated not to apply to yourself, but to anyone who targets you and opens a dialog. This is useful for effects that increase or decrease your defensive situation, such as "Disadvantage to anyone attacking you with a ranged weapon."

## Examples

### Add Bonus Dice

**Usage**: Add Doom to bonus dice for channelling / spellcasting

#### Hide
```js
return args.fields.skill != "channelling"
```

#### Activate
```js
return args.fields.skill == "channelling"
```

#### Script
```js
args.fields.bonusDice += (args.actor.system.doom)
```

**Notes**: We hide the option if the skill isn't Channelling, and we activate it if the skill is Channelling.

---
### Social Interactions

**Usage**: Decrease difficulty for social skills

#### Hide
```js
return !["intimidation", "guile", "entertain"].includes(args.fields.skill)
```

#### Activate
```js
return return ["intimidation", "guile", "entertain"].includes(args.fields.skill)

```

#### Script
```js
args.fields.difficulty--;

```

### Add Damage

**Usage**: Adds bonus damage equal to the Actor's Weapon Skill Focus

#### Hide
```js
return !args.weapon
```

#### Activate
```js
return args.weapon
```

#### Submission
```js
this.effect.update({disabled : true})
```

#### Script
```js
args.fields.bonusDamage += (args.actor.system.skills.weaponSkill.focus)
```

