class QuestionMaker {
    constructor(artistData) {
        this.artistData = artistData;
        this.types = ["choice", "text", "number", "order"];
    }

    // type ["choice", "text", "number", "order"] | anything else = random
    // difficulty [1-100] (50)
    GenerateQuestion(type = null, difficulty = 50) {
        if (!this.types.includes(type)) {
            type = randomElement(this.types);
        }

        type = "choice";

        switch (type.toLowerCase()) {
            case this.types[0]: // Choice
                return this.GenerateChoiceQuestion(difficulty);
            case this.types[1]: // Text
                return this.GenerateTextQuestion(difficulty);
            case this.types[0]: // Number
                return this.GenerateNumberQuestion(difficulty);
            case this.types[1]: // Order
                return this.GenerateOrderQuestion(difficulty);
        }
    }

    GenerateChoiceQuestion(difficulty) {
        // if >= 4 albums, which album is song on
        // if >= 1 album, album has > 1 track, which track number is song
        // pick track from preview
        // pick album from preview

        let question = new ChoiceQuestion();
        let album = randomElement(this.artistData.albums);
        let track = randomElement(album.tracks);
        console.log(track);
        let correctAnswer = album.name;
        let incorrectAnswers = randomElements(this.artistData.albums, 3, (item) => {
            if (item.id == album.id) return false;
            return !item.tracks.map((t) => t.name).some((n) => n == track.name);
        }).map((item) => item.name);
        if (incorrectAnswers.length < 3 && !incorrectAnswers.includes(this.artistData.name)
            && correctAnswer != this.artistData.name) {
            // add s/t if there aren't enough other albums and noe are already s/t
            incorrectAnswers.push(this.artistData.name);
        }
        console.log(track.name, correctAnswer, incorrectAnswers);
        question.text = "What album has the track " + track.name + "?";
        question.correctAnswer = correctAnswer;
        question.incorrectAnswers = incorrectAnswers;
        return question;
    }

    GenerateTextQuestion(difficulty) {
        // name track from preview
        // name album from preview
    }

    GenerateNumberQuestion(difficulty) {
        // how many albums between years
        // what year release
        // how many tracks on album
    }

    GenerateOrderQuestion(difficulty) {
        // if >= 4 albums, order albums by year
        // if >= 4 tracks on album, order tracks
    }
}