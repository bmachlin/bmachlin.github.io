class Renderer {
    constructor(context) {
        this.context = context;
        this.BLANK_CHAR = "￭";
    }

    RenderLetters() {

    }

    RenderWord() {

    }

    RenderDownTimer() {

    }

    RenderUpTimer() {

    }

    RenderLevel() {

    }

    // hide = hide finable words (false for testing)
    // showPrevFound = show words found in prev rounds
    RenderFindableWords(hide=false,showPrevFound=true) {
        let el = document.getElementById("findableWords");
        let c1 = el.children[0];
        let c2 = el.children[1];
        while (c1.firstChild) {
            c1.removeChild(c1.firstChild);
        }
        while (c2.firstChild) {
            c2.removeChild(c2.firstChild);
        }

        let fbwords = [...this.context.Game.findableWords];
        // sort first by word length, then alphabetically
        fbwords.sort((a,b) => {
            if (a.length != b.length) return a.length - b.length;
            return b < a;
        });

        let col = c1;
        for (let word of fbwords) {
            // adding 2 elems per word so halfway is when children = # of words
            if (col.childElementCount >= fbwords.length-1) col = c2;

            let child = document.createElement("span");
            if (this.context.Game.foundWords.has(word)) {
                child.innerHTML = word.toUpperCase();
            }
            else {
                child.innerHTML = this.BLANK_CHAR.repeat(word.length);
            }
            
            col.appendChild(child);
            col.appendChild(document.createElement("br"));
        }
    }
}