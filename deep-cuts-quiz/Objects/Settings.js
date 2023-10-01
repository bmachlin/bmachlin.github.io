class Settings {

    constructor(storage) {
        this.storage = storage;
        this.settings = [];

        // this.theme = new Setting("theme", "string", "light");
        // this.theme.elementId = "themeInput";
        // this.theme.options = ["light", "dark"];
        // this.settings.push(this.theme);
        this.highScore = new Setting("highScore", "number", 0, 0);
        this.highScore.elementId = "highScoreText";
        this.settings.push(this.highScore);
    }

    LoadSettings() {
        // this.LoadInputSetting(this.theme);

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
}