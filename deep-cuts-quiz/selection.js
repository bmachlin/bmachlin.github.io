// Copyleft benmachlin.com, 2023
let DEBUG = true;
let DEBUG2 = false;


let Spot;

function test() {
    Spot.SearchSpotify("pink", null, (data) => { console.log("works", data) });
}

function setup() {
    Spot = new Spotify(config.client, config.redirectRoot + "index.html", localStorage);
    if (Spot.NeedsAuth()) {
        if (Spot.HasRefreshToken()) {
            Spot.RefreshAccess(
                (data) => { processArgs(); },
                (error) => { window.location = "index.html"; });
        } else {
            window.location = "index.html";
        }
    } else {
        processArgs();
    }
}

function search(query, offset) {
    let off = isNaN(parseInt(offset)) ? 0 : parseInt(offset);
    Spot.SearchSpotify(query, { "type": "artist", "limit": 20, "offset": off }, (data) => {
        console.log(data);
        processSearchResults(data["artists"], query, off);
    });
}

function processSearchResults(results, query, offset) {
    let $resultList = document.querySelector("#search-results");
    results["items"].forEach((item) => {createResult(item,$resultList)});

    let $moreBtn = document.createElement("a");
    $moreBtn.innerText = "More results";
    $moreBtn.href = `selection.html?q=${query}&offset=${offset+20}`;
    $resultList.appendChild($moreBtn);
}

function createResult(item, parent) {
    let $result = document.createElement('div');
    $result.className = 'result-button';

    let ref = config.redirectRoot + "quiz.html?id=" + item.id;

    $result.onclick = (event) => {
        window.location.href = ref;
    };

    let imgSrc = "";
    if (!item.images || item.images.length == 0) {
        imgSrc = "no-album-art.png";
    } else {
        imgSrc = item.images[0].url;
    }

    let $resultPic = document.createElement('img');
    $resultPic.src = imgSrc;

    $result.appendChild($resultPic);
    $result.innerHTML += item.name;
    parent.appendChild($result);
}

async function processArgs() {
    if (DEBUG) console.log("processing args");
    let urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
    if (urlParams.get("q")) {
        let query = urlParams.get("q");
        document.querySelector("#search-query").value = query;
        search(query, urlParams.get("offset"));
    }
}