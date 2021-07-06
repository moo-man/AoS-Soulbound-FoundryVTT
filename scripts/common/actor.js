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
        this.data.update(initData)
    }


    prepareData() {
        super.prepareData();

        if (this.type === "player" || this.type === "npc") {

            //defaults for Players
            let flags = {
                autoCalcToughness : true,
                autoCalcMettle : true,
                autoCalcWounds : true,
                isSwarm : false
            };

            if(this.type === "npc") {
                flags.autoCalcToughness = this.bio.type > 1;
                flags.autoCalcMettle = this.bio.type > 2;
                flags.autoCalcWounds = this.bio.type > 3;
                flags.isSwarm = this.bio.type === 0;

                if(game.settings.get("age-of-sigmar-soulbound", "sizeTokens")) {
                    this._sizeToken(flags.isSwarm);
                }
                
            }

            this._initializeData(flags.isSwarm);
            this._computeSkillOrder();
            this._computeItems();
            this._computeAttack(flags.isSwarm);
            this._computeSecondary(flags);
            this._computeRelativeCombatAbilities();
        }
    }

    _initializeData(isSwarm) {
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
        if(!isSwarm) { // Swarms Max Toughness is user set if we initialize it here it's reset
            this.combat.health.toughness.max = 1;
        }
        this.combat.health.wounds.value = 0;
        this.combat.health.wounds.max = 0;
        this.combat.initiative.total = 0;
        this.combat.naturalAwareness.total = 0;
        this.combat.mettle.total = 0;
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

    _computeSkillOrder() {
        let middle = Object.values(this.skills).length / 2;
        let i = 0;
        for (let skill of Object.values(this.skills)) {
            skill.isLeft = i < middle;
            skill.isRight = i >= middle;
            skill.total = skill.training;
            i++;
        }
    }

    _computeItems() {
        let types = this.itemTypes;
        types["wound"].forEach(i => {
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

    _computeItemSkills(item) {
        let skills = item.bonus.skills
    
        this.skills.arcana.total +=         skills.arcana;
        this.skills.athletics.total +=      skills.athletics;
        this.skills.awareness.total +=      skills.awareness;
        this.skills.ballisticSkill.total += skills.ballisticSkill;
        this.skills.beastHandling.total +=  skills.beastHandling;
        this.skills.channelling.total +=    skills.channelling;
        this.skills.crafting.total +=       skills.crafting;
        this.skills.determination.total +=  skills.determination;
        this.skills.devotion.total +=       skills.devotion;
        this.skills.dexterity.total +=      skills.dexterity;
        this.skills.entertain.total +=      skills.entertain;
        this.skills.fortitude.total +=      skills.fortitude;
        this.skills.guile.total +=          skills.guile;
        this.skills.intimidation.total +=   skills.intimidation;
        this.skills.intuition.total +=      skills.intuition;
        this.skills.lore.total +=           skills.lore;
        this.skills.medicine.total +=       skills.medicine;
        this.skills.might.total +=          skills.might;
        this.skills.nature.total +=         skills.nature;
        this.skills.reflexes.total +=       skills.reflexes;
        this.skills.stealth.total +=        skills.stealth;
        this.skills.survival.total +=       skills.survival;
        this.skills.theology.total +=       skills.theology;
        this.skills.weaponSkill.total +=    skills.weaponSkill;
    }

    _computeItemCombat(item) {
        let combat = item.bonus.combat
    
        this.combat.mettle.total +=           combat.mettle;
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

    _sizeToken(isSwarm) {
        if(isSwarm) return; //Swarms are variable let the GM decide Size

        let size = this.bio.size; 

        if(size <= 2) {
            this.data.token.width = 1;
            this.data.token.height = 1;
        } else if(size === 3) {
            this.data.token.width = 2;
            this.data.token.height = 2;
        } else if(size === 4) {
            this.data.token.width = 3;
            this.data.token.height = 3;
        } else if(size === 5) {
            this.data.token.width = 4;
            this.data.token.height = 4;
        }
    }

    _computeAttack(isSwarm) {

        //TODO Move this to item prepare data
        this.items.filter(i => i.isAttack).forEach(item => {
            if (item.category === "melee") {
                item.pool = this.attributes.body.total + this.skills.weaponSkill.total;
                item.focus = this.skills.weaponSkill.focus;
            } else {
                item.pool = this.attributes.body.total + this.skills.ballisticSkill.total;
                item.focus = this.skills.ballisticSkill.focus;
            }
            if(isSwarm) {
                item.pool += this.combat.health.toughness.value;
            }
        })
    }

    _computeSecondary(flags) {
        // melee, accuracy and defense bonus is doubled to represent a one step increase
        this.combat.melee.total +=             this.attributes.body.value + this.skills.weaponSkill.total + (this.combat.melee.bonus * 2);
        this.combat.accuracy.total +=          this.attributes.mind.value + this.skills.ballisticSkill.total + (this.combat.accuracy.bonus * 2);
        this.combat.defense.total +=           this.attributes.body.total + this.skills.reflexes.total + (this.combat.defense.bonus * 2);
        this.combat.armour.total +=            this.combat.armour.bonus;        
        this.combat.initiative.total +=        this.attributes.mind.total + this.skills.awareness.total + this.skills.reflexes.total + this.combat.initiative.bonus;
        this.combat.naturalAwareness.total +=  Math.ceil((this.attributes.mind.total + this.skills.awareness.total) / 2) + this.combat.naturalAwareness.bonus;        
        this.power.isUndercharge =             this.power.consumed > this.power.capacity;
        
        if(flags.autoCalcToughness) {
            this.combat.health.toughness.max = this.attributes.body.total + this.attributes.mind.total + this.attributes.soul.total + this.combat.health.toughness.bonus;
        }
        
        if(flags.autoCalcWounds) {
            this.combat.health.wounds.max += Math.ceil((this.attributes.body.total + this.attributes.mind.total + this.attributes.soul.total) / 2) + this.combat.health.wounds.bonus;
            this.combat.health.wounds.deadly = this.combat.health.wounds.value >= this.combat.health.wounds.max;
        }

        if(flags.autoCalcMettle) {
            this.combat.mettle.total += Math.ceil(this.attributes.soul.total / 2) + this.combat.mettle.bonus;
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

        let ret = allowed !== false ? this.update(updates) : this;

        let note = game.i18n.format("NOTIFICATION.APPLY_DAMAGE", {damage : damage, name : this.data.token.name});
        ui.notifications.notify(note);

        // Doing this here because foundry throws an error if wounds are added before the update
        if(remaining < 0 && this.combat.health.wounds.max > 0) {          
            this.addWound(remaining);
        }
        return ret;
    }

    /**
     * creates and adds a wound based on how far the actors health has gone below zero
     * @param {int} remaining 
     */
    async addWound(remaining) {
        let woundName;
        let value;
        let imgPath;

        if(remaining === -1) {
            woundName = game.i18n.localize("WOUND.LIGHT");
            imgPath = "icons/skills/wounds/blood-spurt-spray-red.webp" 
            value = 1;
        } else if (remaining > -4) {
            woundName = game.i18n.localize("WOUND.SERIOUS");
            imgPath = "icons/skills/wounds/injury-triple-slash-bleed.webp"
            value = 2;            
        } else {
            woundName = game.i18n.localize("WOUND.DEADLY");
            imgPath = "icons/skills/wounds/injury-pain-body-orange.webp"
            value = 3; 
        }

        //Woundtrack can't go over max so we change the value of the new wound to exactly fill it.
        if((this.combat.health.wounds.value + value) > this.combat.health.wounds.max) {
            value = this.combat.health.wounds.max - this.combat.health.wounds.value
        }

        await this.createEmbeddedDocuments("Item", [{            
            name: woundName, 
            type: "wound", 
            img: imgPath,
            "data.damage": value     
        }]);
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