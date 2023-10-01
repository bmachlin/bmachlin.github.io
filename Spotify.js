class Spotify {
    API_BASE = "https://api.spotify.com/v1/";

    constructor(clientId, redirectUri, storage) {
        this.storage = storage ?? localStorage;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this.expireTime = new Date().getTime();
    }

    //#region Authorization

    // https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    async AuthorizePKCE() {

        let codeVerifier = this.GenerateRandomString(128);

        this.GenerateCodeChallenge(codeVerifier).then(codeChallenge => {
            let state = this.GenerateRandomString(16);
            let scope = 'user-top-read';

            this.storage.setItem('code_verifier', codeVerifier);

            let args = new URLSearchParams({
                response_type: 'code',
                client_id: this.clientId,
                scope: scope,
                redirect_uri: this.redirectUri,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });

            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
    }

    GenerateRandomString(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async GenerateCodeChallenge(codeVerifier) {
        function base64encode(string) {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        return base64encode(digest);
    }

    async AuthorizePKCE2(code) {
        let codeVerifier = this.storage.getItem('code_verifier');

        let body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            code_verifier: codeVerifier
        });

        const response = fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log("Authorization succeeded")
                this.SetAccessToken(data.access_token);
                this.SetRefreshToken(data.refresh_token);
                this.SetExpireTime(new Date().getTime() + data.expires_in * 1000);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    RefreshAccess(successCB, failureCB) {
        console.log("refreshing access token");

        let body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.clientId,
            refresh_token: this.storage.getItem("refreshToken")
        });

        const response = fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log("Refresh succeeded")
                this.SetAccessToken(data.access_token);
                this.SetRefreshToken(data.refresh_token);
                this.SetExpireTime(new Date().getTime() + data.expires_in * 1000);
                successCB(data);
            })
            .catch(error => {
                console.error('Error:', error);
                this.ResetRefresh();
                failureCB(error);
            });
    }

    SetAccessToken(token) {
        this.storage.setItem("accessToken", token);
    }
    SetRefreshToken(token) {
        this.storage.setItem("refreshToken", token);
    }
    SetExpireTime(time) {
        this.expireTime = time;
        this.storage.setItem("expireTime", this.expireTime);
    }
    IsAccessExpired() {
        return !this.storage.getItem("expireTime") || new Date().getTime() > parseInt(this.storage.getItem("expireTime"));
    }
    HasRefreshToken() {
        return true && this.storage.getItem("refreshToken");
    }
    ResetRefresh() {
        this.storage.removeItem('refreshToken');
    }
    ResetAccess() {
        this.expireTime = new Date().getTime();
        this.storage.removeItem('accessToken');
        this.storage.removeItem('expireTime');
    }
    NeedsAuth() {
        return this.IsAccessExpired() || !this.storage.getItem("accessToken");
    }

    //#endregion

    //#region Music data

    CallSpotify(url, options, callback) {
        let access = "";
        if (this.NeedsAuth()) {
            console.log("needs auth!")
            return;
        } else {
            access = this.storage.getItem("accessToken");
        }

        // append options to the url as params
        if (options != null && !(Object.keys(options).length === 0 && options.constructor === Object)) {
            url += (url.includes('?') ? '&' : '?') + new URLSearchParams(options).toString();
        }

        let r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.responseType = 'json';

        // set auth header if we have an access token
        if (access !== '') {
            r.setRequestHeader("Authorization", "Bearer " + access);
        }

        r.onload = () => {
            if (r.status == 200) {
                callback(r.response);
            } else {
                console.log("error on request", r.status);
                this.ProcessRequestError(url, options, callback, r);
            }
        };

        r.send();
    }

    ProcessRequestError(url, options, callback, request) {
        console.log("error on request", url, request.status, request.response);
        switch (request.status) {
            case 401:
                this.ResetAccess();
                break;
            case 429:
                let retryAfter = parseInt(request.getResponseHeader('Retry-After'), 10) * 1000;
                if (!retryAfter) retryAfter = 3000;
                console.log('TMR, Retry-After: ', retryAfter);
                setTimeout(() => { this.CallSpotify(url, options, callback) }, retryAfter);
                break;
            default:
                callback(null);
                break;
        }
    }

    // options: TYPE, market, limit, offset
    // types = "album", "artist", "playlist", "track", "show", "episode", "audiobook"
    // Full query functionality not yet implemented.
    SearchSpotify(query, options = {}, callback) {
        if (!options) options = {};
        if (!options.type) options.type = "artist,album,track";
        options.query = query;
        let url = 'https://api.spotify.com/v1/search';
        return this.CallSpotify(url, options, callback);
    }

    GetArtist(id, callback) {
        let url = this.API_BASE + "artists/" + id;
        return this.CallSpotify(url, {}, callback);
    }

    //#endregion
}