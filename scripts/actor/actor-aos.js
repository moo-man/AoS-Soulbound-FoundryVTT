export class AgeOfSigmarActor extends Actor {

    async _preCreate(data, options, user) {

        let initData = {
            "token.bar1" :{ "attribute" : "combat.health.toughness" },
            "token.bar2" :{ "attribute" : "combat.health.wounds" },
            "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "token.name" : data.name
        }
        if (data.type === "player") {
            initData["token.vision"] = true;
            initData["token.actorLink"] = true;
        }
        else if (data.type === "npc") {
            initData["flags.age-of-sigmar-soulbound.autoCalcTokenSize"] = true
        }
        this.data.update(initData)
    }

    prepareData() {
        super.prepareData();

        if (this.type === "player" || this.type === "npc") {
            this._initializeData();
            this._computeSkillTotals();
            this._computeItems();
            this._computeAttack();
            this._computeSecondary();
            this._computeRelativeCombatAbilities();
        }
        if (this.type==="npc")
            this._sizeToken()
    }

    _initializeData() {
        this.attributes.body.total = this.attributes.body.value;
        this.attributes.mind.total = this.attributes.mind.value;
        this.attributes.soul.total = this.attributes.soul.value;
        this.combat.melee.total = 0;
        this.combat.melee.relative = 0;
        this.combat.accuracy.total = 0;
        this.combat.accuracy.relative = 0;
        this.combat.defense.total = 0;
        this.combat.defense.relative = 0;
        this.combat.armour.total = 0;
        this.combat.health.toughness.max = 0;        
        this.combat.health.wounds.value = 0;
        this.combat.health.wounds.max = 0;
        this.combat.initiative.total = 0;
        this.combat.naturalAwareness.total = 0;
        this.combat.mettle.max = 0;
        this.combat.damage = 0;
        this.power.consumed = 0,
        this.power.capacity = 0,
        this.power.isUndercharge = false
    }

    _computeRelativeCombatAbilities() {
        this.combat.melee.relative = this._getCombatLadderValue("melee");
        this.combat.accuracy.relative = this._getCombatLadderValue("accuracy");
        this.combat.defense.relative = this._getCombatLadderValue("defense");

        this.combat.melee.ability = this._getCombatAbility("melee")
        this.combat.accuracy.ability = this._getCombatAbility("accuracy")
        this.combat.defense.ability = this._getCombatAbility("defense")
    }
    
    _getCombatAbility(combatStat)
    {
        let value = this.combat[combatStat].relative
        switch(value) {
            case 1: return `${game.i18n.localize("ABILITIES.POOR")} (1)`; 
            case 2: return `${game.i18n.localize("ABILITIES.AVERAGE")} (2)`;
            case 3: return `${game.i18n.localize("ABILITIES.GOOD")} (3)`;
            case 4: return `${game.i18n.localize("ABILITIES.GREAT")} (4)`;
            case 5: return `${game.i18n.localize("ABILITIES.SUPERB")} (5)`;
            case 6: return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (6)`;
            default : return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (${value})`;
        }
    }

    _getCombatLadderValue(combatStat) {
        let value = this.combat[combatStat].total

        if(value <= 2)
            return 1;
        else if(value <= 4) {
            return 2;
        } else if(value <= 6) {
            return 3;
        } else if(value <= 8) {
            return 4;
        } else if(value <= 10) {
            return 5;
        } else {
            return 6;
        }
    }

    _computeSkillTotals() {
        for (let skill of Object.values(this.skills)) {
            let attributeMod;
            switch(skill.attribute) {
                case "body" : attributeMod = this.attributes.body.total; break;
                case "mind" : attributeMod = this.attributes.mind.total; break;
                case "soul" : attributeMod = this.attributes.soul.total; break;
                default: attributeMod = 0;
            }
            skill.total = skill.training + attributeMod;
            skill.roll  = skill.training;
        }
    }

    _computeItems() {
        this.combat.wounds.forEach(i => {
            this.combat.health.wounds.value += i.damage;
        })
        this.items.filter(i => i.isActive).forEach(i => {
            this._computeGear(i)
        })
    }
    
    _computeGear(item) {

        if (item.isActive) {
            this._computeItemAttributes(item);
            this._computeItemSkills(item);
            this._computeItemCombat(item);
            if (item.isArmour) this._computeArmour(item);
            if (item.isAethericDevice) this._computeAethericDevice(item);
        }
    }

    _computeItemAttributes(item) {
        let attributes = item.bonus.attributes
    
        this.attributes.body.total += attributes.body;
        this.attributes.mind.total += attributes.mind;
        this.attributes.soul.total += attributes.soul;
    }

    /**
     * Add Bonus from Items to Total for Display to roll for acutally rolling the dice
     * @param {*} item 
     */
    _computeItemSkills(item) {
        let skills = item.bonus.skills;
        for(let skill of Object.keys(skills)) {
            this.skills[skill].roll  += skills[skill];
            this.skills[skill].total += skills[skill];
        }
    }

    _computeItemCombat(item) {
        let combat = item.bonus.combat
    
        this.combat.mettle.max +=             combat.mettle;
        this.combat.health.toughness.max +=   combat.health.toughness;
        this.combat.health.wounds.max +=      combat.health.wounds;
        this.combat.health.wounds.deadly =    this.combat.health.wounds.value >= this.combat.health.wounds.max;
        this.combat.initiative.total +=       combat.initiative;
        this.combat.naturalAwareness.total += combat.naturalAwareness;
        this.combat.melee.total +=            (combat.melee * 2);
        this.combat.accuracy.total +=         (combat.accuracy * 2);
        this.combat.defense.total +=          (combat.defense * 2);
        this.combat.armour.total +=           combat.armour;
        this.combat.damage +=                 combat.damage;
    }

    _computeArmour(item) {
        if (item.subtype === "shield") {
            // Like below treat shield benefit as an step increase
            this.combat.defense.total += (item.benefit * 2);
            this.combat.defense.relative = this._getCombatLadderValue("defense");
        } else {
            this.combat.armour.total += item.benefit;
        }
    }

    _computeAethericDevice(item) {
        this.power.consumed += item.power.consumption;
        this.power.capacity += item.power.capacity;
    }

    _sizeToken() {
        if(this.isSwarm || !this.autoCalc.tokenSize) return; //Swarms are variable let the GM decide Size

        let size = this.bio.size; 

        if(size <= 2) {
            this.data.token.update({"height" : 1});
            this.data.token.update({"width" : 1});
        } else if(size === 3) {
            this.data.token.update({"height" : 2});
            this.data.token.update({"width" : 2});
        } else if(size === 4) {
            this.data.token.update({"height" : 3});
            this.data.token.update({"width" : 3});
        } else if(size === 5) {
            this.data.token.update({"height" : 4});
            this.data.token.update({"width" : 4});
        }
    }

    _computeAttack() {

        //TODO Move this to item prepare data
        this.items.filter(i => i.isAttack).forEach(item => {
            if (item.category === "melee") {
                item.pool = this.skills.weaponSkill.total;
                item.focus = this.skills.weaponSkill.focus;
            } else {
                item.pool = this.skills.ballisticSkill.total;
                item.focus = this.skills.ballisticSkill.focus;
            }
            if(this.isSwarm) {
                item.pool += this.combat.health.toughness.value;
            }
        })
    }

    _computeSecondary() {
        // melee, accuracy and defense bonus is doubled to represent a one step increase
        this.combat.melee.total +=             this.attributes.body.total + this.skills.weaponSkill.training + (this.combat.melee.bonus * 2);
        this.combat.accuracy.total +=          this.attributes.mind.total + this.skills.ballisticSkill.training + (this.combat.accuracy.bonus * 2);
        this.combat.defense.total +=           this.attributes.body.total + this.skills.reflexes.training + (this.combat.defense.bonus * 2);
        this.combat.armour.total +=            this.combat.armour.bonus;        
        this.combat.initiative.total +=        this.attributes.mind.total + this.skills.awareness.training + this.skills.reflexes.training + this.combat.initiative.bonus;
        this.combat.naturalAwareness.total +=  Math.ceil((this.attributes.mind.total + this.skills.awareness.training) / 2) + this.combat.naturalAwareness.bonus;        
        this.power.isUndercharge =             this.power.consumed > this.power.capacity;
        
        if(this.autoCalc.toughness) {
            this.combat.health.toughness.max += this.attributes.body.total + this.attributes.mind.total + this.attributes.soul.total + this.combat.health.toughness.bonus;
        } else if(!this.isSwarm) {
            this.combat.health.toughness.max = 1;
        }
        
        if(this.autoCalc.wounds) {
            this.combat.health.wounds.max += Math.ceil((this.attributes.body.total + this.attributes.mind.total + this.attributes.soul.total) / 2) + this.combat.health.wounds.bonus;
            this.combat.health.wounds.deadly = this.combat.health.wounds.value >= this.combat.health.wounds.max;
        }

        if(this.autoCalc.mettle) {
            this.combat.mettle.max += Math.ceil(this.attributes.soul.total / 2) + this.combat.mettle.bonus;
        }
    }

    /**
     * applies Damage to the actor
     * @param {int} damages 
     */
    async applyDamage(damage) {
        let remaining = this.combat.health.toughness.value - damage;
         // Update the Actor
         const updates = {
            "data.combat.health.toughness.value": remaining >= 0 ? remaining : 0
        };

        // Delegate damage application to a hook
        const allowed = Hooks.call("modifyTokenAttribute", {
            attribute: "combat.health.toughness.value",
            value: this.combat.health.toughness.value,
            isDelta: false,
            isBar: true
        }, updates);

        let ret = allowed !== false ? await this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);

        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {          
            this.computeNewWound(remaining);
        }
        return ret;
    }

    /**
     * creates and adds a wound based on how far the actors health has gone below zero
     * @param {int} remaining 
     */
    async computeNewWound(remaining) {

        if (remaining >= 0)
            return

        let type;
        let damage;

        if(remaining === -1) {
            type = "minor"
            damage = 1;
        } else if (remaining > -4) {
            type = "serious"
            damage = 2;            
        } else {
            type = "deadly"
            damage = 3; 
        }

        //Woundtrack can't go over max so we change the value of the new wound to exactly fill it.
        if((this.combat.health.wounds.value + damage) > this.combat.health.wounds.max) {
            damage = this.combat.health.wounds.max - this.combat.health.wounds.value
        }

        return this.addWound(type, damage)
    }

    // Add new wound according to the given type, 'minor' 'serious' or 'deadly'
    addWound(type = "", damage = 0)
    {
        if (isNaN(damage) && type)
            damage = game.aos.config.woundDamage[type] || 0
        
        let wounds = duplicate(this.combat.wounds)
        wounds.unshift({type, damage})
        return this.update({"data.combat.wounds" : wounds})
    }

    async applyRend(damage) {

        let armours = this.items.filter(i => i.isArmour 
                                          && i.isActive //Only Armour that is worn
                                          && i.subtype !== "shield" // That isn't a shield
                                          && i.benefit !== 0 // not already at zero
                                          && !i.traits.toLowerCase().includes(game.i18n.localize("TRAIT.MAGICAL"))); // Only nonmagical
        
        if(armours.length === 0) return;
        
        let sub = damage
        for(let am of armours) {            
            let val = am.benefit - sub;
            sub -= am.benefit;

            
            if(val >= 0) {
                await am.update({"data.benefit": val});
            } else {
                await am.update({"data.benefit": 0}); 
            }
            
            if(sub === 0) break;            
        }
        
        let note = game.i18n.format("NOTIFICATION.APPLY_REND", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);
    }


    get autoCalc() {
        return {
            toughness : this.type == "player" || this.bio.type > 1,
            mettle :  this.type == "player" || this.bio.type > 2,
            wounds :  this.type == "player" || this.bio.type > 3,
            tokenSize : !this.isSwarm && this.getFlag("age-of-sigmar-soulbound", "autoCalcTokenSize")
        }
    }

    get speakerData() {
        if (this.isToken)
        {
            return {
                token : this.token.id,
                scene : this.token.parent.id
            }
        }
        else
        {
            return {
                actor : this.id
            }
        }
    }


    get Speed() {
        let speed = this.combat.speeds
        let display = []
        display.push(`${game.aos.config.speed[speed.foot]}`)

        if (speed.flight != "none")
            display.push(`${game.i18n.localize("HEADER.FLY_SPEED")} (${game.aos.config.speed[speed.flight]})`)

        if (speed.swim != "none")
            display.push(`${game.i18n.localize("HEADER.SWIM_SPEED")} (${game.aos.config.speed[speed.swim]})`)

        return display.join(", ")
        
    }

    // @@@@@ BOOLEAN GETTERS @@@@@
    get isSwarm() {return this.bio.type === 0}

    // @@@@@@ DATA GETTERS @@@@@@
    get attributes() {return this.data.data.attributes}
    get skills() {return this.data.data.skills}
    get combat() {return this.data.data.combat}
    get currencies() {return this.data.data.currencies}
    get bio() {return this.data.data.bio}
    get experience() {return this.data.data.experience}
    get notes() {return this.data.data.notes}
    get soulfire() {return this.data.data.soulfire}
    get doom() {return this.data.data.doom}
    get power() {return this.data.data.power}
}