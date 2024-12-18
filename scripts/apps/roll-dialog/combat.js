import { CommonRollDialog } from "./common";

export class CombatRollDialog extends CommonRollDialog {

    dialogTitle = "DIALOG.COMBAT_ROLL";

    
    get template() 
    {
      return "systems/age-of-sigmar-soulbound/template/apps/dialog/combat-dialog.hbs";
    }

    get item()
    {
        return this.data.weapon;
    }

    get weapon()
    {
        return this.data.weapon;
    }

    async computeFields() 
    {

        if (this.fields.dualWielding)
        {
            let dice = this.numberOfDice();

            if (this.poolModified == "primary")
            {
                this.fields.primaryPool = Math.min(dice, this.fields.primaryPool);
                this.fields.secondaryPool = dice - this.fields.primaryPool
            }

            else if (this.poolModified == "secondary")
            {
                this.fields.secondaryPool = Math.min(dice, this.fields.secondaryPool);
                this.fields.primaryPool = dice - this.fields.secondaryPool
            }

            else 
            {
                this.fields.primaryPool = Math.ceil(dice / 2);
                this.fields.secondaryPool = Math.floor(dice / 2);
            }
        }
    }

    numberOfDice()
    {
        let num = this.actor.system.attributes[this.fields.attribute].value + this.fields.bonusDice
        if (this.fields.skill)
        {
            let skillData = this.data.actor.skills[this.fields.skill]
            num += (this.fields.doubleTraining ? skillData.training * 2 : skillData.training) + skillData.bonus
        }
        return num
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.dn = this._getDN(data.weapon.name, data.attack, this.fields.primaryDefence)
        if(this.fields.dualWielding)
        {
            let secondaryWeapon = data.actor.items.get(this.fields.dualWeapon)
            data.dualWieldingData = {
                primary : {
                    pool : data.primaryPool,
                    defence : data.primaryDefence,
                    armour : data.primaryArmour,
                    name : data.primaryTarget.name,
                    tokenId : data.primaryTarget.tokenId,
                    dn : this._getDN(data.weapon.name, data.attack, this.fields.primaryDefence)
                },
                secondary: {
                    pool : data.secondaryPool,
                    defence : data.secondaryDefence,
                    armour : data.secondaryArmour,
                    name : data.secondaryTarget.name,
                    tokenId : data.secondaryTarget.tokenId,
                    dn : this._getDN(secondaryWeapon?.name, data.attack, this.fields.secondaryDefence),
                    itemId : secondaryWeapon.uuid
                }
            }
        }

        return data;
    }

    _getDN(name, rating, defence) {
        let difficulty = 4 - (rating - defence);
        difficulty = Math.clamped(difficulty, 2, 6)
        return {name, difficulty, complexity : 1}
    }

    static setupData(weapon, actor, options={})
    {
        if (typeof weapon == "string")
        {
            if (weapon.includes("."))
            {
                weapon = fromUuidSync(weapon);
            }
            else
            {
                weapon = actor.items.get(weapon);
            }
        }

        let skill = weapon.category === "melee" ? "weaponSkill" : "ballisticSkill"
        let attribute = weapon.system.attribute || game.aos.config.skillAttributes[skill]

        
        options.title = options.title || `${weapon.name} ${game.i18n.localize("WEAPON.TEST")}`
        options.title += options.appendTitle || "";
        let {data, fields} = super.setupData({skill, attribute}, actor, options)
        data.scripts = data.scripts.concat(weapon?.getScripts("dialog"));

        data.weapon = weapon;
        data.item = weapon;
        data.itemId = weapon.uuid;

        data.combat = {
            melee: actor.system.combat.melee.relative,
            accuracy: actor.system.combat.accuracy.relative,
            swarmDice: actor.type === "npc" && actor.isSwarm ? actor.system.combat.health.toughness.value : 0,
        }

        fields.bonusDice = data.combat.swarmDice;
        
        fields.attack = weapon.system.isMelee ? actor.system.combat.melee.relative : actor.system.combat.accuracy.relative

        data.showDualWielding = actor.items.filter(i => i.isAttack && i.equipped).length >= 2;
        data.otherWeapons = actor.items.filter(i => i.isAttack && i.equipped && i.id != weapon.id);

        data.primaryTarget = {
            defence : 3,
            armour : 0
        }
        data.secondaryTarget = duplicate(data.primaryTarget)

        if (data.targets.length > 0) {
            let targets = data.targets;
            data.primaryTarget = this.tokenToData(targets[0])

            if (targets[1])
            {
                data.secondaryTarget = this.tokenToData(targets[1])
            }
            else // Populate secondary target with the same as the primary target
                data.secondaryTarget = duplicate(data.primaryTarget)

            if (data.primaryTarget)
            {
                fields.primaryDefence = data.primaryTarget.defence;
                fields.primaryArmour = data.primaryTarget.armour;
            }
            if (data.secondaryTarget)
            {
                fields.secondaryDefence = data.secondaryTarget.defence;
                fields.secondaryArmour = data.secondaryTarget.armour;
            }
        }
        fields.dualWeapon = data.otherWeapons[0]?.id;
        
        return {data, fields, options};
    }

    static tokenToData(token)
    {
        return {
            name : token.name,
            defence : token.actor.system.combat.defence.relative,
            armour : token.actor.system.combat.armour.value,
            tokenId : token.id
        }
    }

    activateListeners(html)
    {
        super.activateListeners(html);
        html.find("[name='primaryPool'").change(ev => {
            this.poolModified = "primary";
        })
        html.find("[name='secondaryPool'").change(ev => {
            this.poolModified = "secondary";
        })
    }

    _defaultFields() 
    {
        return mergeObject(super._defaultFields(), {
            bonusDamage : 0,
            primaryDefence : 3,
            secondaryDefence : 3,
            dualWeapon : ""
        });
    }
}
