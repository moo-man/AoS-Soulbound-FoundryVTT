import SoulboundTest from "./test.js";

export default class CombatTest extends SoulboundTest {

    constructor(data)
    {
        super(data)
        if (data) 
        {
            this.testData.combat = data.combat
            this.testData.dualWieldingData = data.dualWieldingData
        }

    }

    computeResult()
    {
        super.computeResult()

        if (this.isDualWielding)
        {
            this.result.primary = this.computeDualResult("primary")
            this.result.secondary = this.computeDualResult("secondary")
        }
        else if (this.result.success) {
                this.result.damage = this.computeDamage()
        }
        return this.result
    }

    // Compute primary or secondary result (for dual wielding)
    computeDualResult(type)
    {
        let result = { triggerToDamage: this.result.triggerToDamage}
        let testData = this.testData.dualWieldingData[type]

        // assign dice based on index to separate pool
        if (type == "primary")
            result.dice = duplicate(this.result.dice.filter(i => i.index < testData.pool))
        else
            result.dice = duplicate(this.result.dice.filter(i => i.index >= this.testData.dualWieldingData.primary.pool))


        result.dice.forEach(d => d.success = d.value >= testData.dn.difficulty) // Re (0, eval)uate whether the dice succeded or not with new difficulty

        result.successes = result.dice.reduce((prev, current) => prev += current.success, 0)
        result.success = result.successes >= testData.dn.complexity
        result.degree = result.success ? result.successes - testData.dn.complexity : testData.dn.complexity - result.successes
        result.triggers = result.dice.filter(die => die.value === 6).length
        result.dn = testData.dn

        if (result.success)
            result.damage = this._computeDamageWithWeapon(result, type == "primary" ? this.weapon : this.secondaryWeapon)


        let path = game.aos.config.dicePath;
        result.dice.forEach(die => {
            die.img = `${path}/dice-${die.value}-failed.webp`
            if (die.success)
                die.img = `${path}/dice-${die.value}-chat.webp`
            if (die.highlight)
                die.img = `${path}/dice-${die.value}-highlight.webp`
        })    

        return result
    }

    


    get template() {
        if (this.isDualWielding)
            return "systems/age-of-sigmar-soulbound/template/chat/weapon/weapon-dual-roll.hbs"
        else
            return "systems/age-of-sigmar-soulbound/template/chat/weapon/weapon-roll.hbs"
    }

    computeDamage(result)
    {
        if (!result) result = this.result
        return this._computeDamageWithWeapon(result, this.item)
    }

    _computeDamageWithWeapon(result, weapon)
    {
        let regex = /([0-9]*)[+]*(s*)/g;
        let weaponDamage = weapon.system.damage.toLowerCase().replace(/( )*/g, '');
        let regexMatch = regex.exec(weaponDamage);
        let damageValue = (+regexMatch[1]) ? +regexMatch[1] : 0;
        let addSuccess =!!(regexMatch[2]);

        let damage = {
            total : 0,
            armour: this.testData.combat.armour,
            traitEffects : [] 
        }
    
        let effect = null;
    
        if(weapon.traitList.ineffective) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.INEFFECTIVE_EFFECT");
            damage.traitEffects.push(effect);
        }
    
        if(damage.armour > 0 && weapon.traitList.penetrating) {
            effect = this._createTraitEffect();
            effect.isPlain = true;
            effect.text = game.i18n.localize("TRAIT.PENETRATING_EFFECT");
            damage.traitEffects.push(effect);     
        }
    
        if(weapon.traitList.cleave) {
            effect = this._createTraitEffect();
            effect.isCleave = true;
            effect.text = game.i18n.format("TRAIT.CLEAVE_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if(weapon.traitList.rend) {
            effect = this._createTraitEffect();
            effect.isRend = true,
            effect.text = game.i18n.format("TRAIT.REND_EFFECT", {triggers : result.triggers});
            damage.traitEffects.push(effect);
        }
    
        if (addSuccess) {
            damage.total = damageValue + result.successes;
        } else {
            damage.total = damageValue;
        }

        if(result.triggerToDamage) {
            damage.total += result.triggers; 
        }
       
        damage.total += this.testData.combat.bonusDamage || 0;
       
        if(damage.total < 0) {
            damage.total = 0;
        }
        return damage;
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

    get isDualWielding() 
    {
        return !!this.testData.dualWieldingData
    }

    get weapon() {
        return this.item
    }

    get secondaryWeapon() {
        return fromUuidSync(this.testData.dualWieldingData?.secondary?.itemId)
    }

    
    get secondaryTestEffects() {
        return this._testEffects(this.secondaryWeapon)
    }

    get secondaryItemTest() {
        return this._itemTest(this.secondaryWeapon)
    }

    get secondaryItemTestDisplay() {
        return this._ItemTestDisplay(this.secondaryWeapon)
    }

    get secondaryHasTest() {
        return this._hasTest(this.secondaryWeapon)
    }

}