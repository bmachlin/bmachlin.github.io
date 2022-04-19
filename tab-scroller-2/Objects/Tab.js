// represents the entire Tab being displayed/interacted with
class Tab {
    constructor(id, context) {
        this.id = id;
        this.context = context;
        this.text = "";
        this.lines = [];
    }

    SetText(text=null) {
        if (text != null) this.text = text;
        this.lines = this.text.split("\n");
    }

    SetLines(lines=null) {
        if (lines != null) { this.lines = lines; }
        this.text = this.lines.join("\n");
    }

    UpdateInput() {
        document.getElementById("input-tab").value = this.text;
    }

    Display() {
        this.UpdateInput();

        // make tab text
        let display = document.getElementById(this.id);
        // remove everything in the tab display
        while (display.firstChild) {
            display.removeChild(display.firstChild);
        }
        display.innerHTML = '';
        
        for (let li = 0; li < this.lines.length; li++) {
            if (this.lines[li] == "") {
                display.appendChild(document.createElement('br'));
            } else {
                let lineElement = document.createElement('p');
                lineElement.innerHTML = '<pre>' + this.lines[li] + '</pre>';
                display.appendChild(lineElement);
            }
        }
        
        // make space at bottom of page
        let bottomSpace = document.createElement("div");
        bottomSpace.id = "bottomSpace";
        bottomSpace.setAttribute("style", `height: 140px`);
        bottomSpace.innerHTML = " ";
        display.appendChild(bottomSpace);
    }
}