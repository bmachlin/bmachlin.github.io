class MarkerBar {
    constructor(id, context) {
        this.id = id;
        this.context = context;
        this.elements = [];
        this.element = null;
    }

    GetElement(remake=false) {
        if (this.element != null && !remake) {
            return this.element;
        }

        this.element = document.createElement("div");
        this.element.setAttribute("id", this.id);
        let markerLines = this.context.markers.map((m) => m.line);
        for (let i = 0; i < this.context.Tab.lines.length; i++) {
            let el = new NonMarker(i).GetElement();
            if (markerLines.includes(i)) {
                let m = this.context.markers.filter((m) => m.line == i)[0];
                if (!m.artificial) {
                    el = m.GetElement();
                }
            }
            el.addEventListener("click", (event) => {
                this.context.MarkerEditor.Click(i);
            });
            this.elements.push(el);
            this.element.appendChild(el);
        }

        return this.element;
    }

    Display() {
        document.getElementById(this.id).remove();
        document.getElementById('tab-display').appendChild(this.GetElement(this.context.Tab.lines.length));
    }
}