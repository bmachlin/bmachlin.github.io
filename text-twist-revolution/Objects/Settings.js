class Settings {

    constructor(storage) {
        this.storage = storage;
        this.settings = [];

        this.theme = new Setting("theme", "string", "light");
        this.theme.elementId = "themeInput";
        this.theme.options = ["light", "dark"];
        this.settings.push(this.theme);
        this.showHeading = new Setting("show-heading", "boolean", true);
        this.showHeading.elementId = "heading";
        this.settings.push(this.showHeading);
        this.maxWordLength = new Setting("maxWordLength", "number", 6, 4, 8);
        this.maxWordLength.elementId = "maxWordLengthInput";
        this.settings.push(this.maxWordLength);
        this.minWordLength = new Setting("minWordLength", "number", 3, 2, 4);
        this.minWordLength.elementId = "minWordLengthInput";
        this.settings.push(this.minWordLength);
    }

    LoadSettings() {
        this.LoadInputSetting(this.maxWordLength);
        this.LoadInputSetting(this.minWordLength);
        this.LoadInputSetting(this.theme);

        this.showHeading.Parse(this.storage.getItem(this.showHeading.name));
        if (DEBUG) console.log(this.showHeading.name, this.showHeading.value);
        this.SetHeadingVisible(this.showHeading.value);
    }

    LoadInputSetting(setting) {
        setting.Parse(this.storage.getItem(setting.name));
        if (DEBUG) console.log(setting.name, setting.value);
        document.getElementById(setting.elementId).value = setting.value;
    }

    SaveSettings() {
        for (let setting of this.settings) {
            this.SaveSettingObj(setting);
        }
        this.LoadSettings();
    }

    SaveSettingByName(name) {
        for (let setting of this.settings) {
            if (setting.name == name) {
                this.SaveSettingObj(setting);
            }
        }
    }

    SaveDefaultSettings() {
        for (let setting of this.settings) {
            this.SaveSettingObj(setting, true);
        }
        this.LoadSettings();
    }

    SaveSettingObj(setting, useDeafult=false) {
        this.storage.setItem(setting.name, useDeafult ? setting.default : setting.value);
    }
    
    ToggleHeading() {
        this.showHeading.value = !this.showHeading.value;
        this.SetHeadingVisible();
    }
    
    SetHeadingVisible() {
        document.getElementById("heading").hidden = !this.showHeading.value;
        document.getElementById("toggle-heading").innerHTML = !this.showHeading.value ? "\\/" : "/\\";
        this.storage.setItem(this.showHeading.name, this.showHeading.value);
    }
}