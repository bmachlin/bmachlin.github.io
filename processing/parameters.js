let elemById = document.getElementById.bind(document);

// https://stackoverflow.com/a/175787
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)... 
        !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

function getSliderValue(elem, def=0) {
    let val = elem.value;
    if (isNumeric(val))
        return parseFloat(val);
    return def;
}

function getNumberValue(elem, def=0) {
    let val = elem.value;
    if (isNumeric(val))
        return parseFloat(val);
    return def;
}

function updateSliderValue(elem, val) {
    elem.value = val;
    elem.nextElementSibling.innerHTML = val;
}

function boundParam(val, min, max, isInt = false) {
    val = Math.min(Math.max(val, min), max);
    return isInt ? val : Math.round(val);
}