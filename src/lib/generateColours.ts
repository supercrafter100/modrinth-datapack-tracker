
export function makeColorGradient(frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center: number, width: number, len: number) {
    var colors = []
    if (len == undefined)
        len = 50;
    if (center == undefined)
        center = 128;
    if (width == undefined)
        width = 127;

    for (var i = 0; i < len; ++i) {
        var red = Math.sin(frequency1 * i + phase1) * width + center;
        var grn = Math.sin(frequency2 * i + phase2) * width + center;
        var blu = Math.sin(frequency3 * i + phase3) * width + center;
        colors.push(RGB2Color(red, grn, blu));
    }

    return colors;
}

function RGB2Color(r: number, g: number, b: number) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}
function byte2Hex(n: number) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}