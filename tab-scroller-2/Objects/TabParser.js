class TabParser {
    static ExtractMarkersFromTab(tabText) {
        let markers = [];
        let lines = tabText.split('\n');
        
        for (let li = 0; li < lines.length; li++) {
            let m = TabParser.ExtractMarkerFromLine(lines[li], li);
            if (m == null) { continue; }

            let ok = true;
            if (m.time == 0) {
                alert(`Time 0 is reserved - fix line ${li}`);
                ok = false;
            }
            for (let n of markers) {
                if (m.time == n.time) {
                    console.log(m)
                    alert(`Cannot have multiple markers with the same time.\nLines ${n.line} and ${li}: ${m.TimeString()}`);
                    ok = false;
                    break;
                }
            }

            if (ok) { markers.push(m); }
        }

        // set starting timestamp to snap to top of tab
        markers.unshift(new Marker(0, 0, 'snap', 0, true));
        // set ending timestamp so that it scrolls to the end after the last stamp
        markers.push(new Marker(Infinity, 1, 'scroll', lines.length-1, true));
        
        return markers;
    }

    static MarkerRegex = /#\[\d\d:\d\d( [sn]| \d\d| \d\d [sn]| [sn] \d\d)?]/g;
    static ExtractMarkerFromLine(line, li) {
        let matches = line.match(TabParser.MarkerRegex);
        if (matches == null || matches.length == 0) { return null; }
        if (matches.length > 1) {
            console.log("More than one marker found on line", li);
        }
        
        let marker = TabParser.MarkerStringToObject(matches[0]);
        marker.line = li;
        return marker;
    }

    static MarkerStringToObject(markerString) {
        let timeString = markerString.substr(2,5); // "MM:SS"
        let time = parseInt(timeString.substr(0,2)) * 60 + parseInt(timeString.substr(3,2));
        let scrollType = 'scroll'; // default scroll type
        let position = 0.5; // default position
        if (markerString.length == 10) {
            scrollType = markerString.charAt(8).toLowerCase() == 'n' ? 'snap' : 'scroll'
        } else if (markerString.length == 11) {
            position = parseInt(markerString.substr(8,2))/100;
        } else if (markerString.length == 13) {
            if (isNaN(parseInt(markerString.substr(8,2)))) {
                // scroll type was listed first
                scrollType = markerString.charAt(8).toLowerCase() == 'n' ? 'snap' : 'scroll'
                position = parseInt(markerString.substr(10,2))/100;
            } else {
                scrollType = markerString.charAt(11).toLowerCase() == 'n' ? 'snap' : 'scroll'
                position = parseInt(markerString.substr(8,2))/100;
            }
        }

        return new Marker(time,position,scrollType)
    }
}