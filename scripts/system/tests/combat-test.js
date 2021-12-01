import Test from "./test.js";

export default class CombatTest extends Test {

    constructor(data)
    {
        super(data)
        if (data) 
            this.testData.combat = data.combat
    }

    computeResult()
    {
        let result = super.computeResult()
        result.damage = this.computeDamage(result)
        return result
    }

    get template() {
        return "systems/age-of-sigmar-soulbound/template/chat/weapon/weapon-roll.html"
    }

    computeDamage(result)
    {
        if (!result) result = this.result
        let regex = /([0-9]*)[+]*(s*)/g;
        let weaponDamage = this.item.damage.toLowerCase().replace(/( )*/g, '');
        let regexMatch = regex.exec(weaponDamage);
        let damageValue = (+regexMatch[1]) ? +regexMatch[1] : 0;
        let addSuccess =!!(regexMatch[2]);

        let damage = {
            total : 0,
            armour: this.testData.combat.armour,
            traitEffects : [] 
        }
    
        let effect = null;
    
        if(this.item.traitList.ineffective) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.INEFFECTIVE_EFFECT");
            damage.traitEffects.push(effect);
            damage.armour *= 2;
        }
    
        if(damage.armour > 0 && this.item.traitList.penetrating) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.PENETRATING_EFFECT");
            damage.traitEffects.push(effect);
            damage.armour -= 1;        
        }
    
        if(this.item.traitList.cleave) {
            effect = this._createTraitEffect();
            effect.isCleave = true;
            effect.text = game.i18n.format("TRAIT.CLEAVE_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if(this.item.traitList.rend) {
            effect = this._createTraitEffect();
            effect.isRend = true,
            effect.text = game.i18n.format("TRAIT.REND_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if (addSuccess) {
            damage.total = damageValue + result.successes - damage.armour;
        } else {
            damage.total = damageValue - damage.armour;
        }
       
        damage.total += this.testData.combat.bonusDamage || 0
       
        if(damage.total < 0) {
            damage.total = 0;
        }
        return damage
    }

    // TODO Deprecate in favor of trait objects
    _createTraitEffect() {
        return {
            isRend: false,
            isCleave: false,
            isPlain: false,
            text:  ""
        };
    }

    get numberOfDice()
    {
        return super.numberOfDice + this.testData.combat.swarmDice
    }

    get weapon() {
        return this.item
    }

}