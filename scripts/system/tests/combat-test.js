import Test from "./test.js";

export default class CombatTest extends Test {

    constructor(data)
    {
        super(data)
        if (data) 
            this.testData.combat = data.combat
    }

    _computeResult()
    {
        let result = super._computeResult()
        result.success = this.result.total,
        result.damage = this._computeDamage(result)
        return result
    }


    _computeDamage(result)
    {
        if (!result) result = this.result
        let regex = /([0-9]*)[+]*(s*)/g;
        let weaponDamage = this.item.damage.toLowerCase().replace(/( )*/g, '');
        let regexMatch = regex.exec(weaponDamage);
        let damageValue = (+regexMatch[1]) ? +regexMatch[1] : 0;
        let addSuccess =!!(regexMatch[2]);
        let traits = this.item.traits.toLowerCase()

        let damage = {
            total : 0,
            armour: this.testData.combat.armour,
            traitEffects : [] 
        }
    
        let effect = null;
    
        // TODO Deprecate in favor of trait objects
        if(traits.includes(game.i18n.localize("TRAIT.INEFFECTIVE"))) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.INEFFECTIVE_EFFECT");
            damage.traitEffects.push(effect);
            damage.armour *= 2;
        }
    
        if(damage.armour > 0 && traits.includes(game.i18n.localize("TRAIT.PENETRATING"))) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.PENETRATING_EFFECT");
            damage.traitEffects.push(effect);
            damage.armour -= 1;        
        }
    
        //On these two we may want to get more 6s if possible after we can't get more successes and have focus left over
        //No idea how to implement that yet may need to refactor _applyFocus a lot for that.
        if(traits.includes(game.i18n.localize("TRAIT.CLEAVE"))) {
            effect = this._createTraitEffect();
            effect.isCleave = true;
            effect.text = game.i18n.format("TRAIT.CLEAVE_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if(traits.includes(game.i18n.localize("TRAIT.REND"))) {
            effect = this._createTraitEffect();
            effect.isRend = true,
            effect.text = game.i18n.format("TRAIT.REND_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if (addSuccess) {
            damage.total = damageValue + result.total - damage.armour;
        } else {
            damage.total = damageValue - damage.armour;
        }
        
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