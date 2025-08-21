let fields = foundry.data.fields;

export default class SoulboundThemeConfig extends HandlebarsApplicationMixin(ApplicationV2)
{
  static DEFAULT_OPTIONS = {
    id: "theme-config",
    tag: "form",
    window: {
      title: "WH.Theme.Config",
      contentClasses: ["standard-form"]
    },
    form: {
      closeOnSubmit: true,
      handler: this.onSubmit
    },
    position: { width: 540 },
    actions: {
      reset: this.onReset
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/age-of-sigmar-soulbound/templates/apps/theme-config.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  static get schema() {
    return SoulboundThemeConfig.#schema;
  }

  static #schema = new foundry.data.fields.SchemaField({

    enabled: new foundry.data.fields.BooleanField({ initial: true },  {label : "Enabled"}),
    font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" }},  {label : "Font"})
  });

  /**
   * The current setting value
   * @type {GameUIConfiguration}
   */
  #setting;

  /**
   * Track whether the schema has already been localized.
   * @type {boolean}
   */
  static #localized = false;

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preFirstRender(_context, _options) {
    await super._preFirstRender(_context, _options);
    if (!SoulboundThemeConfig.#localized) {
      foundry.helpers.Localization.localizeDataModel({ schema: SoulboundThemeConfig.#schema }, {
        prefixes: ["WH.Theme"],
          prefixPath: "age-of-sigmar-soulbound.theme."
      });
      SoulboundThemeConfig.#localized = true;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    if (options.isFirstRender) this.#setting = await game.settings.get("age-of-sigmar-soulbound", "theme");
    return {
      setting: this.#setting,
      fields: SoulboundThemeConfig.#schema.fields,
      buttons: [
        { type: "reset", label: "Reset", icon: "fa-solid fa-undo", action: "reset" },
        { type: "submit", label: "Save Changes", icon: "fa-solid fa-save" }
      ]
    };
  }

  _onChangeForm(_formConfig, _event) {
    const formData = new foundry.applications.ux.FormDataExtended(this.form);
    this.#setting = SoulboundThemeConfig.#cleanFormData(formData);
    this._setTheme();
    this.render();
  }

  /** @inheritDoc */
  _onClose(options) {
    super._onClose(options);
    if (!options.submitted) game.configureUI(this.#setting);
  }

  _setTheme()
  {
    this.constructor.setTheme(this.#setting);
  }

  static setTheme(setting=game.settings.get("age-of-sigmar-soulbound", "theme"))
  {
    if (setting.enabled)
    {
      document.body.classList.add("soulbound-theme");
      if (setting.font == "classic")
      {
        document.body.classList.add("soulbound-font");
      }
      else 
      {
        document.body.classList.remove("soulbound-font");
      }
    }
    else document.body.classList.remove("soulbound-theme", "soulbound-font")
  }

  setThemeOnElement(element, theme)
  {
    if (theme.enabled)
    {
      element.classList.remove("no-theme")

      if (theme.font == "classic")
      {
        element.classList.add("classic-font")
      }
      else
      {
        element.classList.remove("classic-font")
      }
    }
    else
    {
      element.classList.add("no-theme")
      element.classList.remove("classic-font")
    }
  }

  /**
   * Clean the form data, accounting for the field names assigned by game.settings.register on the schema.
   * @param {FormDataExtended} formData
   * @returns {GameUIConfiguration}
   */
  static #cleanFormData(formData) {
    return SoulboundThemeConfig.#schema.clean(foundry.utils.expandObject(formData.object)["age-of-sigmar-soulbound"].theme);
  }

  /**
   * Submit the configuration form.
   * @this {UIConfig}
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async onSubmit(event, form, formData) {
    await game.settings.set("age-of-sigmar-soulbound", "theme", this.#setting);
  }
}