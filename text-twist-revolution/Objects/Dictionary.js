class Dictionary {
    constructor() {
        this.words;
    }

    async LoadWords() {
        try {
            const response = await fetch('words.json');
            const jsonData = await response.json();
            if (jsonData) {
                const dataSet = new Set(Object.keys(jsonData));
                this.words = dataSet;
            } else {
                console.error("Failed to load words.");
            }
        } catch (error) {
            console.error("Error fetching words:", error);
            return null;
        }
    }

    IsWord(word) {
        return this.words.has(word);
    }

    GetAllSubWords(letters, wordSoFar="") {
        if (letters.length == 0) return [];
        let found = new Set();
        for (let i = 0; i < letters.length; i++) {
            let letter = letters[i];
            let newWord = wordSoFar + letter;
            if (this.IsWord(newWord)) {
                if (DEBUG2) console.log("found", newWord);
                found.add(newWord);
            }
            let newLetters = letters.slice();
            newLetters.splice(i,1);
            found = new Set([...found, ...this.GetAllSubWords(newLetters, newWord)]);
        }
        return found;
    }

    GetWordOfLength(length) {
        let list = [...this.words].filter(w => w.length == length);
        return list[Math.floor(Math.random() * list.length)];
    }

}