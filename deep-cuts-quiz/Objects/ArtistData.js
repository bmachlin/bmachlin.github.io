class ArtistData {
    constructor() {
        this.id;
        this.name;
        this.albums;
        this.singles;
        this.appears;
        this.compilations;
        this.followers;
        this.popularity;

        // 0 means not ready, 1 means success, -1 means failed
        this.ready = 0;
        this.readyArtist = 0;
        this.readyAlbums = 0;
        this.readySingles = 0;
        this.readyAppears = 0;
        this.readyCompilations = 0;

        this.loadedCB = null;
    }

    Load(Spot, id, callback) {
        this.id = id;
        this.loadedCB = callback;

        this.GetArtist(Spot, id);
        let adrAlbum = new ArtistDataRetiever(Spot, id, "album");
        adrAlbum.Load((res) => {
            this.albums = adrAlbum.items;
            this.readyAlbums = res ? 1 : -1;
            this.CheckReady();
        });
        let adrSingle = new ArtistDataRetiever(Spot, id, "single");
        adrSingle.Load((res) => {
            this.singles = adrSingle.items;
            this.readySingles = res ? 1 : -1;
            this.CheckReady();
        });
        let adrAppears = new ArtistDataRetiever(Spot, id, "appears_on");
        adrAppears.Load((res) => {
            this.appears = adrAppears.items;
            this.readyAppears = res ? 1 : -1;
            this.CheckReady();
        });
        let adrCompilation = new ArtistDataRetiever(Spot, id, "compilation");
        adrCompilation.Load((res) => {
            this.compilations = adrCompilation.items;
            this.readyCompilations = res ? 1 : -1;
            this.CheckReady();
        });
    }

    GetArtist(Spot, id) {
        Spot.GetArtist(id, (data) => {
            if (data) {
                this.name = data.name;
                this.popularity = data.popularity;
                this.followers = data.followers.total;
                this.readyArtist = 1;
            } else {
                this.readyArtist = -1;
            }
            this.CheckReady();
        });
    }

    CheckReady() {
        this.ready = 0;
        let checks = [this.readyArtist, this.readyAlbums, this.readySingles, this.readyAppears, this.readyCompilations];
        if (DEBUG2) console.log("checking ready", checks);
        let allSucceed = checks.every((item) => item == 1);
        let anyPending = checks.some((item) => item == 0);
        let anyFail = checks.some((item) => item == -1);

        if (allSucceed) {
            this.ready = 1;
            this.loadedCB(true);
        } else if (anyPending) {
            this.ready = 0;
        } else if (anyFail) {
            this.ready = -1;
            this.loadedCB(false);
        }
    }
}