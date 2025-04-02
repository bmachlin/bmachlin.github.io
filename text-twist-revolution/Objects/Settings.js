class Settings {

    constructor(storage) {
        this.storage = storage;
        this.settings = [];

        this.theme = new Setting("theme", "string", "light");
        this.theme.elementId = "themeInput";
        this.theme.options = ["light", "dark"];
        this.settings.push(this.theme);
        this.showSettings = new Setting("showSettings", "boolean", true);
        this.showSettings.elementId = "show-settings";
        this.settings.push(this.showSettings);
        this.maxWordLength = new Setting("maxWordLength", "number", 6, 4, 8);
        this.maxWordLength.elementId = "maxWordLengthInput";
        this.settings.push(this.maxWordLength);
        this.minWordLength = new Setting("minWordLength", "number", 3, 2, 4);
        this.minWordLength.elementId = "minWordLengthInput";
        this.settings.push(this.minWordLength);
        this.difficulty = new Setting("difficulty", "string", "easy");
        this.difficulty.options = ["easy","medium","hard"];
        this.difficulty.elementId = "difficultyInput";
        this.settings.push(this.difficulty);
        this.highScore = new Setting("highScore", "number", 0, 0);
        this.highScore.elementId = "highScoreText";
        this.settings.push(this.highScore);
    }

    LoadSettings() {
        this.LoadInputSetting(this.maxWordLength);
        this.LoadInputSetting(this.minWordLength);
        this.LoadInputSetting(this.theme);
        this.LoadInputSetting(this.difficulty);

        this.showSettings.Parse(this.storage.getItem(this.showSettings.name));
        if (DEBUG) console.log(this.showSettings.name, this.showSettings.value);
        this.SetSettingsVisible(this.showSettings.value);

        this.highScore.Parse(this.storage.getItem(this.highScore.name));
        if (DEBUG) console.log(this.highScore.name, this.highScore.value);
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

    OpenSettings() {
        this.showSettings.value = true;
        this.SetSettingsVisible();
    }

    CloseSettings() {
        this.showSettings.value = false;
        this.SetSettingsVisible();
    }
    
    ToggleSettings() {
        this.showSettings.value = !this.showSettings.value;
        this.SetSettingsVisible();
    }
    
    SetSettingsVisible() {
        document.getElementById("settings").hidden = !this.showSettings.value;
        document.getElementById("toggle-settings-top").innerHTML = !this.showSettings.value ? "/\\" : "\\/";
        document.getElementById("toggle-settings-bot").innerHTML = !this.showSettings.value ? "\\/" : "/\\";
        this.storage.setItem(this.showSettings.name, this.showSettings.value);
    }
}