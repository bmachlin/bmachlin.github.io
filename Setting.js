class Setting {
    // types: number, boolean, string
    constructor(name, type="number", defaultValue=null, min=Number.MIN_VALUE, max=Number.MAX_VALUE, options=[]) {
        this.type = type;
        this.options = [];
        this.min = min;
        this.max = max;
        this.default = defaultValue != null ? defaultValue : type == "number" ? 0 : type == "boolean" ? false : "";
        this.value = this.default;
        this.elementId;
        this.name = name;
    }

    ParseFromElementValue() {
        return this.Parse(document.getElementById(this.elementId).value);
    }

    Parse(value, defaultIfError=true) {
        if (value == undefined || value == null) {
            this.value = this.default;
            return this.value;
        }

        switch (this.type) {
            case "number":
                let result = this.ParseNumber(value, defaultIfError);
                let bounded = Math.max(this.min, Math.min(this.max, result));
                if (result != bounded) {
                    console.log(this.name, "got value", result, "bounded to", bounded);
                }
                this.value = bounded;
                return bounded;
            case "boolean":
                this.value = this.ParseBoolean(value, defaultIfError);
                return value;
            case "string":
                this.value = this.ParseString(value, defaultIfError);
                return value;
            default:
                console.log(this.name, "unsupported setting type", this.type);
                break;
            }
        
        this.value = this.default;
        return defaultIfError ? this.default : null;
    }

    ParseNumber(value, defaultIfError=true) {
        switch (typeof(value)) {
            case "number":
                return value;
            case "boolean":
                return value ? 1 : 0;
            case "string":
                let result = parseFloat(value);
                if (isNaN(result)) {
                    console.log(this.name, "couldn't parse number from string value", value);
                } else {
                    return result;
                }
                break;
            default:
                console.log(this.name, "unsupported value type", typeof(value));
                break;
        }
        this.value = this.default;
        return defaultIfError ? this.default : null;
    }

    ParseBoolean(value, defaultIfError=true) {
        switch (typeof(value)) {
            case "number":
                return !!value;
            case "boolean":
                return value;
            case "string":
                let low = value.toLowerCase();
                if (["t", "true", "1"].includes(low)) return true;
                if (["f", "false", "0"].includes(low)) return false;
                console.log(this.name, "couldn't parse bool from string value", value);
                break;
            default:
                console.log(this.name, "unsupported value type", typeof(value));
                break;
        }
        this.value = this.default;
        return defaultIfError ? this.default : null;
    }

    ParseString(value, defaultIfError=true) {
        switch (typeof(value)) {
            case "number":
            case "boolean":
            case "string":
                let result = value.toString();
                if (this.options && !this.options.includes(result)) {
                    console.log(this.name, result, "not found in options:", ...this.options);
                    break;
                }
                this.value = value;
                return value;
            default:
                console.log(this.name, "unsupported value type", typeof(value));
                break;
        }
        this.value = this.default;
        return defaultIfError ? this.default : null;
    }
}