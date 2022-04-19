class NonMarker {
    // time = seconds into song to activate marker
    // position = vertical position marker should be when activated
    // line = line number
    // scroll = type of scroll to get to marker
    // artificial = is this marker hidden/created for control purposes e.g. start/end
    constructor(line=-1) {
        this.line = line;
        this.element = null;
    }

    GetElement(remake=false) {
        if (this.element != null && !remake) {
            return this.element;
        }

        this.element = document.createElement("div");
        this.element.setAttribute("class", "non-marker");
        this.element.innerHTML = "&nbsp";

        return this.element;
    }
}
