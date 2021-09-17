/* ISC License (ISC). Copyright 2017 Michal Zalecki */
// https://michalzalecki.com/why-using-localStorage-directly-is-a-bad-idea/

function doesLoaclStorageWork() {
    try {
        const testKey = "___QWERAS.DFZXCV___";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

class Storage {
    constructor() {
        this.inMemoryStorage = {};
        this.useLocalStorage = doesLoaclStorageWork();
    }

    clear() {
        if (this.useLocalStorage) {
            localStorage.clear();
        } else {
            this.inMemoryStorage = {};
        }
    }

    getItem(name) {
        if (this.useLocalStorage) {
            return localStorage.getItem(name);
        }
        if (this.inMemoryStorage.hasOwnProperty(name)) {
            return this.inMemoryStorage[name];
        }
        return null;
    }

    removeItem(name) {
        if (this.useLocalStorage) {
            localStorage.removeItem(name);
        } else {
            delete this.inMemoryStorage[name];
        }
    }

    setItem(name, value) {
        if (this.useLocalStorage) {
            localStorage.setItem(name, value);
        } else {
            this.inMemoryStorage[name] = value;
        }
    }
}