class ArtistData {
    constructor() { }

    //#region DATA RETREIVAL

    async Load(Spot, id) {
        this.id = id;
        Spot.GetArtist(id, (data) => {
            if (!data) return false;
        });
        
        
        return true;
    }

    //#endregion
}