class YTPlayer {
    // default ytPlayer state values
    ytUNSTARTED = -1;
    ytENDED = 0;
    ytPLAYING = 1;
    ytPAUSED = 2;
    ytBUFFERING = 3;
    ytCUED = 5;

    constructor(id, context) {
        this.id = id;
        this.context = context;
    }

    GetElement() {

    }
    
    CreatePlayer() {
        // only create player if it isn't already created
        if (!context.Player) {
            let tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            tag.id = "player-script";
            let timerElement = document.getElementById('timer');
            timerElement.parentNode.insertBefore(tag, timerElement);
        } else {
            this.LoadPlayer();
        }
    }
    
    LoadPlayer() {
        if (!context.Player) {
            this.CreatePlayer();
            return;
        }
        // show iframe if hidden
        let iframe = document.getElementById("player");
        if (iframe) iframe.hidden = false;
    
        // set player id and store value
        let id = document.getElementById('playerId').value;
        context.Storage.setItem('playerId', id);
        context.Player.cueVideoById(id);
    
        context.usingPlayer = true;
    }
    
    unloadPlayer() {
        context.usingPlayer = false;
        let iframe = document.getElementById("player");
        if (iframe)
            iframe.hidden = true;
        if (context.Player) {
            context.Player.stopVideo();
        }
    
        document.getElementById("playerId").value = "";
        context.Storage.removeItem('playerId');
    }
    
    OnYouTubeIframeAPIReady() {
        this.context.Player = new YT.Player('player', {
            height: '100',
            width: '300',
            events: {
                'onReady': this.OnPlayerReady,
                'onStateChange': this.OnPlayerStateChange,
                'onError': this.OnPlayerError
            }
        });
    }
    
    OnPlayerReady(event) {
        this.context.usingPlayer = true;
        this.LoadPlayer();
    }
    
    OnPlayerStateChange(event) {
        switch(event.data) {
            case YT.PlayerState.PLAYING:
                // console.log("Player state change: PLAYING", event.data);
                play();
                break;
            case YT.PlayerState.PAUSED:
                // console.log("Player state change: PAUSED", event.data);
                pause();
                break;
            case YT.PlayerState.BUFFERING:
                // console.log("Player state change: BUFFERING", event.data);
                // pause();
                break;
            case YT.PlayerState.ENDED:
                // console.log("Player state change: ENDED", event.data);
                break;
            case YT.PlayerState.UNSTARTED:
                // console.log("Player state change: UNSTARTED", event.data);
                break;
            case YT.PlayerState.CUED:
                // console.log("Player state change: CUED", event.data);
                break;
            default:
                // console.log("Player state change: " + event.data);
                break;
        }
    }
    
    OnPlayerError(event) {
        alert(`Error with YouTube video: ${event}`);
        context.usingPlayer = false;
    }
}