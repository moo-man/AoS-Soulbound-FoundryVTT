
export default class FocusAllocation extends WHFormApplication {

    static DEFAULT_OPTIONS = {
        window: { title: "HEADER.ALLOCATE" },
        classes: ["soulbound", "dice-menu"],
        actions: {
            clickDie: this._onClickDie
        },
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
    }

    static PARTS = {
        form: {
            template: "systems/age-of-sigmar-soulbound/templates/apps/dice-menu.hbs"
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    constructor(test, options) {
        super(test, options);
        this.test = test;
        this.allocation = Array(test.result.dice.length).fill(0);
    }

    static async prompt(test, options) {
        return new Promise(resolve => {
            options.resolve = resolve;
            return new this(test, options).render({ force: true })
        })
    }


    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.test = this.test;
        context.text = `Allocate ${this.test.result.focus} Focus`;
        return context;
    }

    close() {
        super.close();
        if (this.options.resolve) {
            this.options.resolve();
        }
    }


    static async submit(event) {
        this.options.resolve(this.allocation);
    }

    async _onRender(options) {
        let dice = this.element.querySelectorAll(".die");
        for (let element of dice) {
            let counter = document.createElement("div");
            counter.classList.add("focus-counter", "die-icon");
            counter.textContent = "0";
            counter.style.display = "none";
            element.appendChild(counter);
        }
    }

    static _onClickDie(ev, target) {
        let counter = target.querySelector(".focus-counter");
        let index = Number(target.dataset.index);

        let test = this.test;
        const MAX_FOCUS = test.result.focus
        let totalAllocated = this.allocation.reduce((sum, focus) => sum + focus, 0);
        let counterNum = this.allocation[index];

        counterNum++

        if (totalAllocated + 1 > MAX_FOCUS) {
            counterNum = 0
        }

        this.allocation[index] = counterNum
        counter.textContent = this.allocation[index];

        if (counterNum == 0) {
            counter.style.display = "none";
            target.classList.remove("selected");
        }
        else {
            target.classList.add("selected")
            counter.style.display = "";
        }
    }


    _sumFocus() {
        let counters = Array.from(this.element.querySelectorAll(".focus-counter"))
        let num = 0;
        counters.forEach(c => {
            num += parseInt(c.textContent) || 0
        })
        return num;
    }




}