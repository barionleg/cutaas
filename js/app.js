
const binFile = {
    opened: false,
    name: '',
    data: []
};

const defaultOptions = {
    version: '0.92',
    storageName: 'cutasStore092',
    fileSizeLimit: 256,
    hexWidth: 20,
    bmpWidth: 40,
    bmpScale: 2,
    consoleFontSize: 16,
    bytesPerLine: 16,
    lastTemplate: 0
}
const dontSave = ['version', 'storageName'];

let options = {};
const undos = [];
const redos = [];

const selection = {
    isSelected: false,
    start: null,
    end: null,
    singleSelected: null,
}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

const getSize = () => {
    return `size: ${binFile.data.length} ($${decimalToHex(binFile.data.length)}) bytes`
};


const userIntParse = (udata) => {
    if (_.isNull(udata)) return null;
    udata = _.trim(udata);
    if (_.startsWith(udata, '$')) {
        udata = parseInt(_.trim(udata, '$'), 16);
    } else {
        udata = parseInt(udata, 10);
    }
    if (!_.isNaN(udata)) {
        return udata
    } else {
        return NaN;
    }
}

const promptInt = (txt, defaulttxt) => {
    let uint;
    do {
        const uval = prompt(txt, defaulttxt);
        uint = userIntParse(uval);
        if (_.isNaN(uint)) alert(`*** ERROR: can not parse integer value from ${uval}`);
    } while (_.isNaN(uint))
    return uint;
}





// *************************************************  CONSOLE DISPLAY

const setTheme = (theme) => {
    $('#consol').css('font-size', theme.consoleFontSize);
}

const cout = (txt) => {
    $('#consol').append(`${txt}<br>`);
    $('#consol')[0].scrollTop = $('#consol')[0].scrollHeight;
}

const cclear = () => {
    $('#consol').empty();
    cout(`*** CutAs v.${options.version} - simple binary data manipulation tool.`);
    cout(`*** author: bocianu@gmail.com`);
}

const showHex = () => {
    if (binFile.data.length == 0) return null;
    cout(`*** File hex view:`);
    let hex = '';
    const data = binFile.data;
    let row = 0;
    while (data.length > (row * options.hexWidth)) {
        if (row > 0) hex += '<br>';
        const start = row * options.hexWidth;
        hex += `$${decimalToHex(start, 4)}: `;
        _.each(_.slice(data, start, start + options.hexWidth), v => hex += `${decimalToHex(v)} `);
        row++;
    }
    // console.log(hex);
    cout(hex);
    return hex;
}

const showBMP = () => {
    if (binFile.data.length == 0) return null;
    cout('*** Bitmap wiew:');
    const width = options.bmpWidth * 8 * options.bmpScale;
    const height = Math.ceil(binFile.data.length / options.bmpWidth) * options.bmpScale;
    const bmp = $('<canvas/>', { 'class': 'bmp_view' }).width(width).height(height);
    const ctx = bmp[0].getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    let x, y, bit;
    let byteOffset = 0;
    ctx.fillStyle = "#0b0";
    for (y = 0; y < height; y++) {
        for (x = 0; x < options.bmpWidth; x++) {
            const bbyte = binFile.data[byteOffset];
            let bx = 0;
            for (bit = 7; bit >= 0; bit--) {
                const mask = 1 << bit;
                if ((bbyte & mask) != 0) {
                    ctx.fillRect(x * 8 * options.bmpScale + bx, y * options.bmpScale, options.bmpScale, options.bmpScale);
                }
                bx += options.bmpScale;
            }
            byteOffset++;
            if (byteOffset > binFile.data.length) break;
        }
    }
    $('#consol').append(bmp, '<br>');
    $('#consol')[0].scrollTop = $('#consol')[0].scrollHeight;
}

const showText = () => {
    if (binFile.data.length == 0) return null;
    cout(`*** File text view:`);
    if (binFile.data.length > 0) {
        var txt = new TextDecoder("iso-8859-2").decode(binFile.data);
        cout(txt.replace(/\n/g, '<br>'));
    }
}

const showInfo = () => {
    cout(`*** File information:`);
    cout(`File name: ${binFile.name}`);
    cout(`File ${getSize()}`);
}









//******************************************* FILE OPERATIONS

const openFile = function (event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var arrayBuffer = reader.result;
        //console.log(input.files[0]);
        if (input.files[0].size > (options.fileSizeLimit * 1024)) {
            cout(`*** ERROR: File too big! Size limit exceeded. File size: ${input.files[0].size} B - limit: ${options.fileSizeLimit} kB`);
            return false;
        }
        binFile.name = input.files[0].name;
        binFile.opened = true;
        binFile.data = new Uint8Array(arrayBuffer);
        _.remove(undos, _.stubTrue);
        cout(`*** File ${binFile.name} opened, ${getSize()}`);
        input.value = '';
    };
    if (input.files.length > 0) {
        reader.readAsArrayBuffer(input.files[0]);
    }
};

const appendFile = function (event) {
    if (binFile.data.length == 0) {
        cout(`*** ERROR: Cannot append to empty file, use Open File instead!`);
        return null;
    }
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var arrayBuffer = reader.result;
        const newSize = input.files[0].size + getSize();
        if (newSize > (options.fileSizeLimit * 1024)) {
            cout(`*** ERROR: File becomes too big! Size limit exceeded. File size: ${newSize} B - limit: ${options.fileSizeLimit} kB`);
            return false;
        }
        const undo = { name: `file: ${input.files[0].name} merge`, data: binFile.data.slice() };
        undos.push(undo);
        const appendData = new Uint8Array(arrayBuffer);
        const newData = new Uint8Array(binFile.data.length + appendData.length);
        newData.set(binFile.data);
        newData.set(appendData, binFile.data.length);
        binFile.data = newData;
        cout(`*** File ${binFile.name} merged, new ${getSize()}`);
        input.value = '';
    };
    if (input.files.length > 0) {
        reader.readAsArrayBuffer(input.files[0]);
    }
};

const saveFile = () => {

    if (binFile.opened) {
        const name = prompt('set filename of saved file:', binFile.name);
        
        if (binFile.data.length > 0) {
            var a = document.createElement('a');
            var file = new Blob([new Uint8Array(binFile.data)]);
            a.href = URL.createObjectURL(file);
            if (name) {
                a.download = name;
                a.click();
                setTimeout(() => { $(a).remove(); }, 0);
            }
        }
    } else return null
}



// ******************************************* DATA SLICING

const sliceData = (dstart = null, dstop = null) => {

    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dstart)) {
        dstart = promptInt('first byte address:', 0);
        if (_.isNull(dstart)) {
            return null;
        }
    }
    if (!_.isNumber(dstop)) {
        dstop = promptInt('last byte address:', binFile.data.length);
        if (_.isNull(dstop)) {
            return null;
        }
    }
    if (!_.isNull(dstart) && !_.isNull(dstop)) {
        if (!_.inRange(dstart, 0, binFile.data.length)) {
            cout('*** ERROR - starting address out of range');
            return null;
        }
        if (!_.inRange(dstop, 0, binFile.data.length)) {
            cout('*** ERROR - ending address out of range');
            return null;
        }
        binFile.data = _.slice(binFile.data, dstart, dstop + 1);
        cout(`*** File sliced from ${dstart} to ${dstop}, new ${getSize()}`);
        return 1;
    }
    return null;
}

const cutOffData = (dstart = null, dstop = null) => {
    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dstart)) {
        dstart = promptInt('first byte address:', 0);
        if (_.isNull(dstart)) {
            return null;
        }
    }
    if (!_.isNumber(dstop)) {
        dstop = promptInt('last byte address:', binFile.data.length);
        if (_.isNull(dstop)) {
            return null;
        }
    }
    if (!_.isNull(dstart) && !_.isNull(dstop)) {
        if (!_.inRange(dstart, 0, binFile.data.length)) {
            cout('*** ERROR - starting address out of range');
            return null;
        }
        if (!_.inRange(dstop, 0, binFile.data.length)) {
            cout('*** ERROR - ending address out of range');
            return null;
        }
        binFile.data = _.concat(_.slice(binFile.data, 0, dstart), _.slice(binFile.data, dstop + 1));
        cout(`*** File cuted off from ${dstart} to ${dstop}, new ${getSize()}`);
        return 1;
    }
    return null;
}

const splitData = (dsize = null) => {
    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dsize)) {
        dsize = promptInt('chunk size in bytes:', 0);
        if (_.isNull(dsize)) return null;
    }
    if (!_.isNull(dsize)) {
        if (dsize <= 0) return null;
        const fcount = Math.ceil(binFile.data.length / dsize);
        if (fcount > 9) {
            const sure = confirm(`It will produce ${fcount} files!\nAre you sure you want to proceed??`);
            if (!sure) return null;
        }
        const fname = prompt('set name for saved files:', binFile.name.split('.')[0]);
        if (_.isNull(fname)) return null;
        let fnum = 0;
        while (fnum < fcount) {
            const foffset = fnum * dsize;
            const chunk = _.slice(binFile.data, foffset, foffset + dsize);
            const cname = `${fname}.${_.padStart(fnum, 3, '0')}`;
            saveFile(chunk, cname);
            cout(`* File ${cname} saved, size ${chunk.length}`);
            fnum++;
        }
        cout(`*** File splited into ${fcount} parts`);
        return 1;
    } else {
        cout(`*** Split aborted`);
    }
    return null;
}

// ******************************************* DATA MODIFIERS


const dataNegate = () => {
    if (binFile.data.length == 0) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => ~v));
    cout('*** All data negated');
    return 1;
}

const dataXOR = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to XOR all data:', 0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval ^ v));
    cout(`*** All data XORed with ${uval}`);
    return 1;
}

const dataOR = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to OR all data:', 0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval | v));
    cout(`*** All data ORed with ${uval}`);
    return 1;
}

const dataAND = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to AND all data:', 0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval & v));
    cout(`*** All data ANDed with ${uval}`);
    return 1;
}

const dataOffset = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to offset all data:', 0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval + v));
    cout(`*** All data ofsetted by ${uval}`);
    return 1;
}

const packRLE = () => {
    let oldSize = binFile.data.length;
    if (oldSize == 0) return null;
    let x = 0;
    let old = 0;
    let compressedData = [];
    const saveRle = (a, c) => {
        compressedData.push((c - 1) << 1);
        compressedData.push(a);
    }
    const saveStr = (x) => {
        const tmp = [];
        let i = 0;
        while ((x < oldSize) && (i <= 127)) {
            let a = binFile.data[x];
            tmp.push(a);
            if ((x < oldSize - 2) && (a == binFile.data[x + 1]) && (a == binFile.data[x + 2])) {
                tmp.pop();
                break;
            }
            x += 1;
            i += 1;
        }
        i -= 1;
        a = (i << 1) | 1;
        compressedData.push(a);
        compressedData = compressedData.concat(tmp);
        return x;
    };

    while (x < oldSize) {
        old = x;
        let a = binFile.data[x];
        let c = 1;
        x += 1;
        while ((x < oldSize) && (a == binFile.data[x])) {
            c += 1;
            x += 1;
            if (c == 127) break;
        }
        if (c > 2) saveRle(a, c)
        else x = saveStr(old);
    }
    compressedData.push(0);
    //console.log(compressedData);
    binFile.data = new Uint8Array(compressedData);
    cout(`*** Data compressed, old size: ${oldSize}, new size: ${binFile.data.length}`);
    cout(`*** Saved: ${oldSize - binFile.data.length} bytes`);
    return 1;
}




// *********************************** OPTIONS

const refreshOptions = () => {
    $('#hex_width').val(options.hexWidth);
    $('#bmp_width').val(options.bmpWidth);
    $('#bmp_scale').val(options.bmpScale);
    $('#font_size').val(options.consoleFontSize);
    $('#size_limit').val(options.fileSizeLimit);
}

const valIntInput = (inputId) => {
    uint = userIntParse($(`#${inputId}`).val());
    if (_.isNaN(uint)) {
        $(`#${inputId}`).addClass('warn').focus();
        return false;
    };
    $(`#${inputId}`).val(uint);
    return true;
}

const validateOptions = () => {
    $('.dialog_text_input').removeClass('warn');
    if (!valIntInput('hex_width')) return false;
    if (!valIntInput('bmp_width')) return false;
    if (!valIntInput('size_limit')) return false;
    if (!valIntInput('font_size')) return false;

    return true;
}

const toggleOptions = () => {
    if ($('#options_dialog').is(':visible')) {
        $('#options_dialog').slideUp();
    } else {
        refreshOptions();
        $('#options_dialog').slideDown();
    }
}

const storeOptions = () => {
    localStorage.setItem(defaultOptions.storageName, JSON.stringify(_.omit(options, dontSave)));
}

const loadOptions = () => {
    if (!localStorage.getItem(defaultOptions.storageName)) {
        options = _.assignIn({}, defaultOptions);
        storeOptions();
    } else {
        options = _.assignIn({}, defaultOptions, JSON.parse(localStorage.getItem(defaultOptions.storageName)));
    }
}

const updateOptions = () => {
    _.assignIn(options, {
        hexWidth: Number($('#hex_width').val()),
        bmpWidth: Number($('#bmp_width').val()),
        bmpScale: Number($('#bmp_scale').val()),
        consoleFontSize: Number($('#font_size').val()),
        fileSizeLimit: Number($('#size_limit').val()),
        bytesPerLine: Number($('#bytes_per_line').val()),
        lastTemplate: Number($('#export_template').val()),
    });
    storeOptions();
}


const saveOptions = () => {
    if (validateOptions()) {
        updateOptions();
        toggleOptions();
        setTheme(options);
        cout(`*** Options updated`);
    }
}

// *********************************** EXPORT

const refreshExports = () => {
    $('#bytes_per_line').val(options.bytesPerLine);
    $('#export_template').empty();
    for (let templateIdx in exportTemplates) {
        const template = exportTemplates[templateIdx];
        const option = $('<option/>').val(templateIdx).html(template.name);
        $('#export_template').append(option);
    };
    $('#export_template').val(options.lastTemplate);
    //
}

const validateExport = () => valIntInput('bytes_per_line');

const updateAfterEdit = () => {
    if (validateExport()) {
        updateOptions();
    }
}

const toggleExport = () => {
    if ($('#export_dialog').is(':visible')) {
        $('#export_dialog').slideUp();
    } else {
        refreshExports();
        $('#export_dialog').slideDown();
    }
}

const exportData = () => {
    if (binFile.data.length == 0) return null;
    const deselect = () => {
        if (document.selection) document.selection.empty();
        else if (window.getSelection)
            window.getSelection().removeAllRanges();
    }
    updateOptions();
    toggleExport();
    cout(`*** Start of exported data:`);
    const body = parseTemplate($('#export_template').val());
    const block = $(`<pre>${body}</pre>`);
    $('#consol').append(block);
    deselect();
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(block[0]);
        range.select();
    }
    else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(block[0]);
        window.getSelection().addRange(range);
    }
    document.execCommand('copy');
    deselect();
    cout(`*** End of exported data`);
    cout(`*** Text copied to clipboard, paste it anywhere else`);
}


const parseTemplateVars = (template, size) => {
    return template
        .replace(/#size#/g, size)
        .replace(/#max#/g, size - 1);
}

const parseTemplate = (templateIdx) => {
    const template = exportTemplates[templateIdx];
    let templateLines = '';
    const linesCount = Math.ceil(binFile.data.length / options.bytesPerLine);
    for (let line = 0; line < linesCount; line++) {
        let lineBody = '';
        if (template.line.numbers) {
            lineBody += `${template.line.numbers.start + template.line.numbers.step * line} `;
        }
        const dataOffset = line * options.bytesPerLine;
        const lineData = _.join(_.map(_.slice(binFile.data, dataOffset, dataOffset + options.bytesPerLine),
            b => `${template.byte.prefix}${template.byte.hex ? decimalToHex(b, 2) : b}${template.byte.postfix}`
        ), template.byte.separator);
        const linePostfix = (line == linesCount - 1) ? template.line.lastpostfix || template.line.postfix : template.line.postfix;
        lineBody += `${template.line.prefix}${lineData}${linePostfix}`;
        templateLines += lineBody;
    }
    return parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`, binFile.data.length);
}


// *********************************** UNDO

const saveUndo = (name, modifier) => {
    return () => {
        const undo = { name: name, data: binFile.data.slice() };
        const result = modifier();
        if (!_.isNull(result)) {
            _.remove(redos, _.stubTrue);
            undos.push(undo);
        }
    }
}

const undo = () => {
    if (undos.length > 0) {
        const undo = undos.pop();
        const redo = { name: undo.name, data: binFile.data.slice() };
        redos.push(redo);
        binFile.data = undo.data.slice();
        cout(`*** Undo - ${undo.name} reverted`);
    } else {
        cout(`*** No Undo`);
    }
}

const redo = () => {
    if (redos.length > 0) {
        const redo = redos.pop();
        const undo = { name: redo.name, data: binFile.data.slice() };
        undos.push(undo);
        binFile.data = redo.data.slice();
        cout(`*** Redo - ${undo.name} restored`);
    } else {
        cout(`*** Can't Redo`);
    }
}


// ************************************************  ON START INIT 

$(document).ready(function () {
    loadOptions();
    const app = gui(options);
    setTheme(options);
    refreshExports();
    refreshOptions();
    $('title').append(` v.${options.version}`);
    cclear();
    app.addMenuFileOpen('Open File', openFile, 'filemenu', 'Opens new binary file');
    app.addMenuFileOpen('Append', appendFile, 'filemenu', 'Append other binary file to current data');
    app.addMenuItem('Save File', saveFile, 'filemenu', 'Saves current data into new file');
    app.addMenuItem('Export', toggleExport, 'filemenu', 'Exports current data in popular programming languages formats');
    app.addSeparator('filemenu');
    app.addMenuItem('Split', splitData, 'filemenu', 'Splits current data into n data chunks with specified size').addClass('icon icon_split');
    app.addMenuItem('Slice', saveUndo('data slice', sliceData), 'filemenu', 'Keeps only slice of current data from->to specified offset').addClass('icon icon_slice');
    app.addMenuItem('Cut Off', saveUndo('data cut off', cutOffData), 'filemenu', 'Cuts off (removes) specified range of bytes form current data').addClass('icon icon_cutoff');
    app.addSeparator('filemenu');
    app.addMenuItem('pack RLE', saveUndo('RLE compression', packRLE), 'filemenu', 'Packs current data using RLE algorithm');
    app.addSeparator('filemenu');
    app.addMenuItem('Options', toggleOptions, 'filemenu');

    app.addMenuItem('Negate', saveUndo('data negation', dataNegate), undefined, 'Negates all bytes of current data');
    app.addMenuItem('XOR', saveUndo('data XOR operation', dataXOR), undefined, 'Performs binary XOR with provided value on all bytes of current data');
    app.addMenuItem('OR', saveUndo('data OR operation', dataOR), undefined, 'Performs binary OR with provided value on all bytes of current data');
    app.addMenuItem('AND', saveUndo('data AND operation', dataAND), undefined, 'Performs binary AND with provided value on all bytes of current data');
    app.addMenuItem('Offset', saveUndo('data offseting', dataOffset), undefined, 'Offsets all bytes of current data by provided value');
    app.addBR();
    app.addMenuItem('Show Info', showInfo, undefined, 'Shows brief info about current data set');
    app.addMenuItem('Show Hex', showHex, undefined, 'Shows hexadecimal dump of current data set');
    app.addMenuItem('Show Text', showText, undefined, 'Shows current data set as an text data');
    app.addMenuItem('Show Bitmap', showBMP, undefined, 'Shows current data set as bitmap');
    app.addSeparator();
    app.addMenuItem('Clear View', cclear, undefined, 'Clears terminal window');
    app.addSeparator();
    app.addMenuItem('Undo', undo, undefined, 'Undo last operation');
    app.addMenuItem('Redo', redo, undefined, 'Redo last operation');
    app.fitSize();

});
