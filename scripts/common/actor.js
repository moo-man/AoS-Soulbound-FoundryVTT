export class AgeOfSigmarActor extends Actor {

    async _preCreate(data, options, user) {
        mergeObject(data, {
            "token.bar1" :{ "attribute" : "combat.health.toughness" },
            "token.bar2" :{ "attribute" : "combat.health.wounds" },
            "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "token.name" : data.name
        });
        if (data.type === "player") {
            data.token.vision = true;
            data.token.actorLink = true;
        }
    }


    prepareData() {
        super.prepareData();
        if (this.data.type === "player" || this.data.type === "npc") {
            this._initializeData();
            this._computeSkillOrder();
            this._computeItems();
            this._computeAttack();
            this._computeSecondary();
            this._computeRelativeCombatAbilities();
        } else if (this.data.type === "party") {
            this._computePartyItems();
        }
    }

    _initializeData() {
        let data = this.data
        data.data.attributes.body.total = data.data.attributes.body.value;
        data.data.attributes.mind.total = data.data.attributes.mind.value;
        data.data.attributes.soul.total = data.data.attributes.soul.value;
        data.data.combat.melee.total = 0;
        data.data.combat.melee.relative = 0;
        data.data.combat.accuracy.total = 0;
        data.data.combat.accuracy.relative = 0;
        data.data.combat.defense.total = 0;
        data.data.combat.defense.relative = 0;
        data.data.combat.armour.total = 0;
        data.data.combat.health.toughness.max = 0;
        data.data.combat.health.wounds.value = 0;
        data.data.combat.health.wounds.max = 0;
        data.data.combat.initiative.total = 0;
        data.data.combat.naturalAwareness.total = 0;
        data.data.combat.mettle.total = 0;
        data.data.combat.damage = 0;
        data.data.power = {
            consumed: 0,
            capacity: 0,
            isUndercharge: false
        }
    }

    _computeRelativeCombatAbilities() {
        this.data.data.combat.melee.relative = this._getCombatLadderValue("melee");
        this.data.data.combat.accuracy.relative = this._getCombatLadderValue("accuracy");
        this.data.data.combat.defense.relative = this._getCombatLadderValue("defense");
    }
    
    _getCombatLadderValue(combatStat) {
        let value = this.data.data.combat[combatStat].total

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
        let middle = Object.values(this.data.data.skills).length / 2;
        let i = 0;
        for (let skill of Object.values(this.data.data.skills)) {
            skill.isLeft = i < middle;
            skill.isRight = i >= middle;
            skill.total = skill.training;
            i++;
        }
    }

    _computeItems() {
        this.itemTypes["wound"].forEach(i => {
            this.data.data.combat.health.wounds.value += item.data.data.damage;
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
        let attributes = item.data.data.bonus.attributes

        this.data.data.attributes.body.total += attributes.body;
        this.data.data.attributes.mind.total += attributes.mind;
        this.data.data.attributes.soul.total += attributes.soul;
    }

    _computeItemSkills(item) {
        let skills = item.data.data.bonus.skills
        let data = this.data

        data.data.skills.arcana.total +=         skills.arcana;
        data.data.skills.athletics.total +=      skills.athletics;
        data.data.skills.awareness.total +=      skills.awareness;
        data.data.skills.ballisticSkill.total += skills.ballisticSkill;
        data.data.skills.beastHandling.total +=  skills.beastHandling;
        data.data.skills.channelling.total +=    skills.channelling;
        data.data.skills.crafting.total +=       skills.crafting;
        data.data.skills.determination.total +=  skills.determination;
        data.data.skills.devotion.total +=       skills.devotion;
        data.data.skills.dexterity.total +=      skills.dexterity;
        data.data.skills.entertain.total +=      skills.entertain;
        data.data.skills.fortitude.total +=      skills.fortitude;
        data.data.skills.guile.total +=          skills.guile;
        data.data.skills.intimidation.total +=   skills.intimidation;
        data.data.skills.intuition.total +=      skills.intuition;
        data.data.skills.lore.total +=           skills.lore;
        data.data.skills.medicine.total +=       skills.medicine;
        data.data.skills.might.total +=          skills.might;
        data.data.skills.nature.total +=         skills.nature;
        data.data.skills.reflexes.total +=       skills.reflexes;
        data.data.skills.stealth.total +=        skills.stealth;
        data.data.skills.survival.total +=       skills.survival;
        data.data.skills.theology.total +=       skills.theology;
        data.data.skills.weaponSkill.total +=    skills.weaponSkill;
    }

    _computeItemCombat(item) {
        let combat = item.data.data.bonus.combat
        let data = this.data

        data.data.combat.mettle.total +=           combat.mettle;
        data.data.combat.health.toughness.max +=   combat.health.toughness;
        data.data.combat.health.wounds.max +=      combat.health.wounds;
        data.data.combat.health.wounds.deadly =    data.data.combat.health.wounds.value >= data.data.combat.health.wounds.max;
        data.data.combat.initiative.total +=       combat.initiative;
        data.data.combat.naturalAwareness.total += combat.naturalAwareness;
        data.data.combat.melee.total +=            (combat.melee * 2);
        data.data.combat.accuracy.total +=         (combat.accuracy * 2);
        data.data.combat.defense.total +=          (combat.defense * 2);
        data.data.combat.armour.total +=           combat.armour;
        data.data.combat.damage +=                 combat.damage;
    }

    _computeArmour(item) {
        if (item.data.type === "shield") {
            // Like below treat shield benefit as an step increase
            this.data.data.combat.defense.total += (item.data.data.benefit * 2);
            this.data.data.combat.defense.relative = this._getCombatLadderValue("defense");
        } else {
            this.data.data.combat.armour.total += item.data.data.benefit;
        }
    }

    _computeAethericDevice(item) {
        this.data.data.power.consumed += item.data.data.power.consumption;
        this.data.data.power.capacity += item.data.data.power.capacity;
    }

    _computeAttack() {

        this.items.filter(i => i.isAttack).forEach(item => {
            if (item.data.data.category === "melee") {
                item.data.data.pool = this.data.data.attributes.body.total + this.data.data.skills.weaponSkill.total;
                item.data.data.focus = this.data.data.skills.weaponSkill.focus;
            } else {
                item.data.data.pool = this.data.data.attributes.mind.total + this.data.data.skills.ballisticSkill.total;
                item.data.data.focus = this.data.data.skills.ballisticSkill.focus;
            }
        })
    }

    _computeSecondary() {
        let data = this.data
        // melee, accuracy and defense bonus is doubled to represent a one step increase
        data.data.combat.melee.total +=             data.data.attributes.body.value + data.data.skills.weaponSkill.total + (data.data.combat.melee.bonus * 2);
        data.data.combat.accuracy.total +=          data.data.attributes.mind.value + data.data.skills.ballisticSkill.total + (data.data.combat.accuracy.bonus * 2);
        data.data.combat.defense.total +=           data.data.attributes.body.total + data.data.skills.reflexes.total + (data.data.combat.defense.bonus * 2);
        data.data.combat.health.toughness.max +=    data.data.attributes.body.total + data.data.attributes.mind.total + data.data.attributes.soul.total + data.data.combat.health.toughness.bonus;
        data.data.combat.health.wounds.max +=       Math.ceil((data.data.attributes.body.total + data.data.attributes.mind.total + data.data.attributes.soul.total) / 2) + data.data.combat.health.wounds.bonus;
        data.data.combat.health.wounds.deadly =     data.data.combat.health.wounds.value >= data.data.combat.health.wounds.max;
        data.data.combat.initiative.total +=        data.data.attributes.mind.total + data.data.skills.awareness.total + data.data.skills.reflexes.total + data.data.combat.initiative.bonus;
        data.data.combat.naturalAwareness.total +=  Math.ceil((data.data.attributes.mind.total + data.data.skills.awareness.total) / 2) + data.data.combat.naturalAwareness.bonus;
        data.data.combat.mettle.total +=            Math.ceil(data.data.attributes.soul.total / 2) + data.data.combat.mettle.bonus;
        data.data.power.isUndercharge =             data.data.power.consumed > data.data.power.capacity;
    }
}