class AlbumDataRetiever {
    constructor(Spot, id, type) {
        this.Spot = Spot;
        this.id = id;
        this.type = type;
        this.items = [];
        this.loadedCB = null;
    }

    Load(callback) {
        this.loadedCB = callback;
        this.Spot.GetArtistAlbums(this.id, { include_groups: this.type, limit: 50, offset: 0 }, (data) => {
            if (data) {
                if (data.items.length == 0) {
                    this.loadedCB(true);
                    return;
                }
                this.ProcessList(data);
                this.FillList();
            } else {
                console.log("error getting list", this.id, this.type);
            }
        });
    }

    ProcessList(data) {
        let total = data.total;
        data.items.forEach((item) => {
            let newItem = {
                "id": item.id,
                "uri": item.uri,
                "name": item.name,
                "totalTracks": item.total_tracks,
                "releaseYear": parseInt(item.release_date.substring(0, 4))
            };
            this.items.push(newItem);
        });
        this.items.sort((a, b) => {
            return a.releaseYear > b.releaseYear;
        });
    }

    ParseReleaseYear(date, precision) {
        return parseInt(date.substring(0, 4));
    }

    FillList() {
        let idLists = [];
        for (let i = 0; i < this.items.length; i += 20) {
            const idGroup = this.items.slice(i, i + 20).map((item) => { return item.id });
            idLists.push(idGroup);
        }

        for (let i = 0; i < idLists.length; i ++) {
            this.Spot.GetAlbums(idLists[i], {}, (data) => {
                if (data) {
                    this.ProcessListFill(data, i+1 == idLists.length);
                } else {
                    console.log("error filling list", this.id, this.type);
                }
            });
        }
    }

    ProcessListFill(data, last) {
        let albums = {};
        data.albums.forEach((album) => {
            albums[album.id] = album;
        });
        this.items.forEach((item) => {
            if (!albums[item.id]) return;
            let album = albums[item.id];
            item.popularity = album.popularity;
            item.artists = this.ProcessArtists(album.artists);
            item.label = album.label ?? "";
            item.image = album.images.length > 0 ? album.images[0].url : "no-album-art.png";
            item.tracks = this.ProcessAlbumTracks(album)
        });
        this.items.sort((a, b) => {
            return a.popularity < b.popularity;
        });
        if (last) this.loadedCB(true);
    }

    ProcessArtists(artistsData) {
        let artists = [];
        artistsData.forEach((artist) => {
            artists.push({
                "id": artist.id,
                "name": artist.name
            });
        });
        return artists;
    }

    ProcessAlbumTracks(albumData) {
        let tracks = [];

        albumData.tracks.items.forEach((track) => {
            tracks.push({
                "artists": this.ProcessArtists(track.artists),
                "disc": track.disc_number,
                "duration": track.duration_ms,
                "id": track.id,
                "name": track.name,
                "preview": track.preview_url,
                "trackNum": track.track_number
            });
        });

        return tracks;
    }
}