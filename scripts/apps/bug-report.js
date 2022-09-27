export default class BugReportFormSoulbound extends Application {

    constructor(app) {
        super(app)

        this.endpoint = "https://aa5qja71ih.execute-api.us-east-2.amazonaws.com/Prod/soulbound"
        this.github = "https://api.github.com/repos/moo-man/AoS-Soulbound-FoundryVTT/"

        this.domains = [
            "Soulbound System",
            "Soulbound Core Module",
            "Soulbound Starter Set",
            "Soulbound Champions of Order"
        ]

        this.domainKeys = [
            "age-of-sigmar-soulbound",
            "soulbound-core",
            "soulbound-starter-set",
            "soulbound-order"
        ]

        this.domainKeysToLabel = {
            "age-of-sigmar-soulbound" : "system",
            "soulbound-core" : "core",
            "soulbound-starter-set" : "starter-set",
            "soulbound-order" : "champions-of-order"
        }

        this.issues = this.loadIssues();
        this.latest = this.checkVersions();
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "bug-report";
        options.template = "systems/age-of-sigmar-soulbound/template/apps/bug-report.html"
        options.classes.push("age-of-sigmar-soulbound", "soulbound-bug-report");
        options.resizable = true;
        options.width = 600;
        options.height = "auto";
        options.minimizable = true;
        options.title = "Soulbound Bug Report"
        return options;
    }

    async _render(...args)
    {
        await super._render(...args)
        this.issues = await this.issues;
        this.latest = await this.latest;
        this.element.find(".module-check").replaceWith(this.formatVersionWarnings())
    }

    getData() {
        let data = super.getData();
        data.domains = this.domains;
        data.name = game.settings.get("age-of-sigmar-soulbound", "bugReportName")
        return data;
    }

    submit(data) {
        fetch(this.endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: data.title,
                body: data.description,
                assignees: ["moo-man"],
                labels : data.labels
            })
        })
        .then(res => {
            if (res.status == 201)
            {
                ui.notifications.notify(game.i18n.localize("IssueReceived"))
                res.json().then(json => {
                    console.log(`Thank you for your submission. If you wish to monitor or follow up with additional details like screenshots, you can find your issue here: ${json.html_url}`)
                })
            }
            else 
            {
               ui.notifications.error(game.i18n.localize("IssueError"))
               console.error(res)
            }   

        })
        .catch(err => {
            ui.notifications.error(game.i18n.localize("Something went wrong"))
            console.error(err)
        })
    }

    formatVersionWarnings() {

        if (!this.latest || this.latest instanceof Promise)
        {
            return "<div></div>"
        }

        let domainMap = {};
        this.domainKeys.forEach((key, i) => {
            domainMap[key] = this.domains[i];
        })

        let allUpdated = true;
        let outdatedList = ""

        for (let key in this.latest) {
            if (!this.latest[key]) {
                allUpdated = false;
                outdatedList += `<li>${domainMap[key]}</li>`;
            }
        }

        let element = `<div class='notification warning'>`

        if (allUpdated) {
            return ``
        }
        else {
            element += `<p>The Following Soulbound packages are not up to date`
            element += "<ul>"
            element += outdatedList
            element += "</ul>"
        }

        element += "</div>"

        return element;
    }

    async checkVersions() {
        let latest = {}
        for (let key of this.domainKeys) {
            if (key == game.system.id) {
                // Have to use release tag instead of manifest version because CORS doesn't allow downloading release asset for some reason
                let release = await fetch(this.github + "releases/latest").then(r => r.json()).catch(e => console.error(e))
                latest[key] = !isNewerVersion(release.tag_name, game.system.version)
            }
            else if (game.modules.get(key)) {
                let manifest = await fetch(`https://foundry-c7-manifests.s3.us-east-2.amazonaws.com/${key}/module.json`).then(r => r.json()).catch(e => console.error(e))
                latest[key] = !isNewerVersion(manifest.version, game.modules.get(key).version)
            }
        }
        return latest;
    }

    matchIssues(text) {
        if (this.issues instanceof Promise || !this.issues?.length)
            return []
        
        let words = text.toLowerCase().split(" ");
        let percentages = new Array(this.issues.length).fill(0)


        this.issues.forEach((issue, issueIndex) => {
            let issueWords = (issue.title + " " + issue.body).toLowerCase().trim().split(" ");
            words.forEach((word) => {
                {
                    if (issueWords.includes(word))
                        percentages[issueIndex]++
                }
            })
        })
        let matchingIssues = [];
        percentages = percentages.map(i => i/this.issues.length)
        percentages.forEach((p, i) => {
            if (p > 0)
                matchingIssues.push(this.issues[i])
        })
        return matchingIssues;
    }


    showMatchingIssues(element, issues)
    {
        if(!issues || issues?.length <= 0)
            element[0].style.display="none"
        else 
        {
            element[0].style.display="flex";
            let list = element.find(".issue-list");
            list.children().remove();
            list.append(issues.map(i => `<div class="issue"><a href="${i.html_url}">${i.title}</div>`))
        }
    }

    
    async loadIssues() {
        let issues = await fetch(this.github + "issues").then(r => r.json()).catch(error => console.error(error))
        return issues
    }

    activateListeners(html) {

        
        let publicityWarning = html.find(".publicity")[0];
        let modulesWarning = html.find(".active-modules")[0];
        let title = html.find(".bug-title")[0];
        let description = html.find(".bug-description")[0];
        let matching = html.find(".matching");

        html.find(".issuer").keyup(ev => {
            publicityWarning.style.display = ev.currentTarget.value.includes("@") ? "block" : "none"
        })

        html.find(".issue-label").change(ev => {
            if (ev.currentTarget.value == "bug") {
                if (game.modules.contents.filter(i => i.active).map(i => i.id).filter(i => !this.domainKeys.includes(i)).length > 0)
                    modulesWarning.style.display = "block"
                else
                    modulesWarning.style.display = "none"
            }
            else
                modulesWarning.style.display = "none"
        })

        
        html.find(".bug-title, .bug-description").keyup(async ev => {
            let text = title.value + " " + description.value
            text = text.trim();
            if (text.length > 2) {
                this.showMatchingIssues(matching, this.matchIssues(text));
            }
        })

        html.find(".bug-submit").click(ev => {
            let data = {};
            let form = $(ev.currentTarget).parents(".bug-report")[0];
            data.domain = $(form).find(".domain")[0].value
            data.title = $(form).find(".bug-title")[0].value
            data.description = $(form).find(".bug-description")[0].value
            data.issuer = $(form).find(".issuer")[0].value
            let label = $(form).find(".issue-label")[0].value;


            if (!data.domain || !data.title || !data.description)
                return ui.notifications.error(game.i18n.localize("BugReport.ErrorForm"))
            if (!data.issuer)
                return ui.notifications.error(game.i18n.localize("BugReport.ErrorName1"))

            if (!data.issuer.includes("@") && !data.issuer.includes("#"))
                return ui.notifications.notify(game.i18n.localize("BugReport.ErrorName2"))

            data.title = `[${this.domains[Number(data.domain)]}] ${data.title}`
            data.description = data.description + `<br/>**From**: ${data.issuer}`

            data.labels = [this.domainKeysToLabel[this.domainKeys[Number(data.domain)]]]

            if (label)
                data.labels.push(label);

            game.settings.set("age-of-sigmar-soulbound", "bugReportName", data.issuer);

            let officialModules = Array.from(game.modules).filter(m => this.domainKeys.includes(m[0]))
            
            let versions = `<br/>age-of-sigmar-soulbound: ${game.system.version}`

            for (let mod of officialModules)
            {
                let modData = game.modules.get(mod[0]);
                if (modData.active)
                    versions = versions.concat(`<br/>${mod[0]}: ${modData.data.version}`)
            }

            data.description = data.description.concat(versions);
            data.description += `<br/>Active Modules: ${game.modules.contents.filter(i => i.active).map(i => i.id).filter(i => !this.domainKeys.includes(i)).join(", ")}`

            this.submit(data)
            this.close()
        })
    }
}

