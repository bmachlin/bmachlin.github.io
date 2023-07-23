class Settings {
    // defaults
    static defaultTheme = "light"
    static defaultNumLetters = 6;
    static defaultMode = "normal";
    static defaultMinWordLength = 3;

    constructor(storage) {
        this.storage = storage;
        this.theme;
        this.numLetters;
        this.minWordLength;
    }

    LoadSettings() {
        this.numLetters = parseInt(this.storage.getItem('numLetters')) || Settings.defaultNumLetters;
        console.log("nl", this.numLetters);
        document.getElementById("numLettersInput").value = this.numLetters;

        this.minWordLength = parseInt(this.storage.getItem('minWordLength')) || Settings.defaultMinWordLength;
        console.log("mw", this.minWordLength)
        document.getElementById("minWordLengthInput").value = this.minWordLength;

        this.theme = this.storage.getItem("theme");
        if (this.theme == null || this.theme === "light") {
            this.SetTheme("light")
        } else {
            this.SetTheme("dark");
        }

        // some weird stuff here bc sometimes show-heading is stored as a bool, sometimes it's stored as a string "true"/"false"
        let sh = this.storage.getItem("show-heading") ?? "true";
        if (sh == null || sh.toString() === "true") {
            this.SetHeadingVisible(true);
        } else {
            this.SetHeadingVisible(false);
        }
    }

    SaveSettings(nli, mwl, thm) {
        nli = this.IsNanOrNull(nli) ? Settings.defaultNumLetters : nli;
        mwl = this.IsNanOrNull(mwl) ? Settings.defaultMinWordLength : mwl;
        thm = thm == undefined || this.theme == undefined || this.theme == null || this.theme == "" ? Settings.defaultTheme : thm;
        this.storage.setItem('numLetters', nli);
        this.storage.setItem('minWordLength', mwl);
        this.storage.setItem('theme', thm);
        console.log("saved settings", nli, mwl, thm);
        this.LoadSettings();
    }

    SaveDefaultSettings() {
        this.SaveSettings(Settings.defaultNumLetters, Settings.defaultMinWordLength, Settings.defaultTheme);
    }

    SetNumLetters(numLettersInput) {
        if (!isNaN(numLettersInput)) {
            console.log("Set numLetters to", numLettersInput);
            this.numLetters = numLettersInput;
        }
    }

    SetMinWordLength(minWordLengthInput) {
        if (!isNaN(minWordLengthInput)) {
            console.log("Set minWordLength to", minWordLengthInput);
            this.minWordLength = minWordLengthInput;
        }
    }
    
    SetTheme(themeName) {
        this.storage.setItem('theme', themeName);
        if (themeName === "light") {
            document.getElementById("themeLight").checked = true;
        } else {
            document.getElementById("themeDark").checked = true;
        }
        this.theme = themeName;
    }
    
    ToggleHeading() {
        this.SetHeadingVisible(document.getElementById("heading").hidden);
    }
    
    SetHeadingVisible(visible) {
        document.getElementById("heading").hidden = !visible;
        document.getElementById("toggle-heading").innerHTML = !visible ? "\\/" : "/\\";
        this.storage.setItem("show-heading", visible);
    }


    // helper
    IsNanOrNull(val) {
        return val == undefined || val == null || isNaN(val);
    }
}