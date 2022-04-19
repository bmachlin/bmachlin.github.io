class Settings {
    // defaults
    static defaultSeekTime = 5;
    static defaultSkipBackBuffer = 1.0;
    static defaultTheme = "light"

    constructor(storage) {
        this.storage = storage;
        this.seekTime;
        this.skipBackBuffer;
        this.theme;
    }

    LoadSettings() {
        this.seekTime = parseInt(this.storage.getItem('seekTime'));
        if (!this.seekTime) {
            this.seekTime = Settings.defaultSeekTime;
        }
        document.getElementById("seekInput").value = this.seekTime;

        this.skipBackBuffer = parseFloat(this.storage.getItem('skipBackBuffer'));
        if (!this.skipBackBuffer) {
            this.skipBackBuffer = Settings.defaultSkipBackBuffer;
        }
        document.getElementById("skipBackInput").value = this.skipBackBuffer;

        this.theme = this.storage.getItem("theme");
        if (this.theme == null || this.theme === "light") {
            setTheme("light")
        } else {
            setTheme("dark");
        }

        // some weird stuff here bc sometimes show-heading is stored as a bool, sometimes it's stored as a string "true"/"false"
        let sh = this.storage.getItem("show-heading") ?? "true";
        if (sh == null || sh.toString() === "true") {
            this.SetHeadingVisible(true);
        } else {
            this.SetHeadingVisible(false);
        }
    }

    SaveSettings(st, sbb, thm) {
        st = this.IsNanOrNull(st) ? Settings.defaultSeekTime : st;
        sbb = this.IsNanOrNull(sbb) ? Settings.defaultSkipBackBuffer : sbb;
        thm = thm == undefined || this.theme == undefined || this.theme == null || this.theme == "" ? Settings.defaultTheme : thm;
        this.storage.setItem('seekTime', st);
        this.storage.setItem('skipBackBuffer', sbb);
        this.storage.setItem('theme', thm);
        console.log("saved settings", st, sbb, thm);
        this.LoadSettings();
    }

    SaveDefaultSettings() {
        this.SaveSettings(Settings.defaultSeekTime, Settings.defaultSkipBackBuffer, Settings.defaultTheme);
    }

    SetSeekTime(seekInput) {
        if (!isNaN(seekInput)) {
            console.log("Set seekTime to", seekInput);
            this.seekTime = seekInput;
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