
const binFile = {
    opened: false,
    name: '',
    data: []
};

const defaultOptions = {
    version: '0.5',
    storageName: 'cutAsStore',
    fileSizeLimit: 256,
    hexWidth: 40,
    bmpWidth: 320,
    consoleFontSize: 15,
}

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
    if (_.startsWith(udata,'$')) {
        udata = parseInt(_.trim(udata,'$'), 16);
    } else {
        udata = parseInt(udata, 10);
    }
    if (!_.isNaN(udata)) {
        return udata
    } else {
        return NaN; 
    }
}

const promptInt = (txt,defaulttxt) => {
    let uint;
    do {
        const uval = prompt(txt, defaulttxt);
        uint = userIntParse(uval);
        if (_.isNaN(uint)) alert(`*** ERROR: can not parse integer value from ${uval}`);
    } while (_.isNaN(uint))
    return uint;
}





// *************************************************  CONSOLE DISPLAY

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
        if (row>0) hex += '<br>';
        const start = row * options.hexWidth;
        hex += `$${decimalToHex(start,4)}: `;
        _.each(_.slice(data, start, start + options.hexWidth), v => hex += `${decimalToHex(v)} `);
        row++;
    }
    // console.log(hex);
    cout(hex);
    return hex;
}

const showText = () => {
    if (binFile.data.length == 0) return null;
    cout(`*** File text view:`);
    if (binFile.data.length>0) {
        var txt = new TextDecoder("iso-8859-2").decode(binFile.data);
        cout(txt.replace(/\n/g,'<br>'));
    }
}

const showInfo = () => {
    cout(`*** File information:`);
    cout(`File name: ${binFile.name}`);
    cout(`File ${getSize()}`);
}









//******************************************* FILE OPERATIONS

const openFile = function(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
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
        $('#filelabel').html(binFile.name);
        cout(`*** File ${binFile.name} opened, ${getSize()}`);
        input.value='';
    };
    if (input.files.length > 0) {
        reader.readAsArrayBuffer(input.files[0]);
    }
};

const appendFile = function(event) {
    if (binFile.data.length == 0) return null;
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(){
        var arrayBuffer = reader.result;
        const undo = { name: `file: ${input.files[0].name} merge`, data: binFile.data.slice() };
        undos.push(undo);
        binFile.data = new Uint8Array(_.concat(binFile.data, arrayBuffer));
        cout(`*** File ${binFile.name} merged, new ${getSize()}`);
        input.value='';
    };
    if (input.files.length > 0) {
        reader.readAsArrayBuffer(input.files[0]);
    }
};

const saveFile = (data, name) => {
    if (data.length>0) {
        var a = document.createElement('a');
        var file = new Blob([new Uint8Array(data)]);
        a.href = URL.createObjectURL(file);
        if (name) {
            a.download = name;
            a.click();
            setTimeout(() => {$(a).remove();}, 0); 
        }
    }
}

const exportData = () => {
    cout('*** Not implemented yet');
}



// ******************************************* DATA SLICING

const sliceData = (dstart = null, dstop=null) => {

    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dstart)) {
        dstart = promptInt('first byte address:',0);
        if (_.isNull(dstart)) {
            return null;
        }
    }
    if (!_.isNumber(dstop)) {
        dstop = promptInt('last byte address:',binFile.data.length);
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
        binFile.data = _.slice(binFile.data, dstart, dstop+1);
        cout(`*** File sliced from ${dstart} to ${dstop}, new ${getSize()}`);
        return 1;
    }
    return null;
}

const cutOffData = (dstart = null, dstop=null) => {
    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dstart)) {
        dstart = promptInt('first byte address:',0);
        if (_.isNull(dstart)) {
            return null;
        }
    }
    if (!_.isNumber(dstop)) {
        dstop = promptInt('last byte address:',binFile.data.length);
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
        binFile.data = _.concat(_.slice(binFile.data, 0, dstart),_.slice(binFile.data, dstop+1));
        cout(`*** File cuted off from ${dstart} to ${dstop}, new ${getSize()}`);
        return 1;
    }
    return null;
}

const splitData = (dsize = null) => {
    if (binFile.data.length == 0) return null;
    if (!_.isNumber(dsize)) {
        dsize = promptInt('chunk size in bytes:',0);
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
            const chunk = _.slice(binFile.data,foffset,foffset+dsize);
            const cname = `${fname}.${_.padStart(fnum,3,'0')}`;
            saveFile(chunk,cname);
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
    const uval = promptInt('value to XOR all data:',0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval ^ v));
    cout(`*** All data XORed with ${uval}`);
    return 1;
}

const dataOR = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to OR all data:',0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval | v));
    cout(`*** All data ORed with ${uval}`);
    return 1;
}

const dataAND = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to AND all data:',0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval & v));
    cout(`*** All data ANDed with ${uval}`);
    return 1;
}

const dataOffset = () => {
    if (binFile.data.length == 0) return null;
    const uval = promptInt('value to offset all data:',0);
    if (_.isNull(uval)) return null;
    binFile.data = new Uint8Array(_.map(binFile.data, (v) => uval + v));
    cout(`*** All data ofsetted by ${uval}`);
    return 1;
}

const packRLE = () => {
    let oldSize = binFile.data.length;
    if (oldSize==0) return null;
    let x = 0;
    let old = 0;
    let compressedData = [];
    const saveRle = (a, c) => {
        compressedData.push((c-1)<<1);
        compressedData.push(a);
    }
    const saveStr = (x) => {
        const tmp = [];
        let i = 0;
        while ((x < oldSize) && (i<=127)) {
            let a = binFile.data[x];
            tmp.push(a);
            if ((x < oldSize-2) && (a == binFile.data[x+1]) && (a == binFile.data[x+2])) {
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
            if (c==127) break;
        }
        if (c>2) saveRle(a, c) 
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
    localStorage.setItem(defaultOptions.storageName,JSON.stringify(options));
}

const loadOptions = () => {
    if(!localStorage.getItem(defaultOptions.storageName)) {
        options = _.assignIn({}, defaultOptions);
        storeOptions();
    } else {
        options = _.assignIn({}, defaultOptions, JSON.parse(localStorage.getItem(defaultOptions.storageName)));
    }
}

const saveOptions = () => {
    if (validateOptions()) {
        _.assignIn(options, {
            hexWidth: Number($('#hex_width').val()),
            bmpWidth: Number($('#bmp_width').val()),
            fileSizeLimit: Number($('#size_limit').val())
        });
        storeOptions();
        toggleOptions();
    }
}

// *********************************** OPTIONS

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
    if (undos.length>0) {
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
    if (redos.length>0) {
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

$(document).ready(function() {
    loadOptions();
	const app = gui(options);
    cclear();
 	app.addMenuItem('Save File', () => {
        if (binFile.opened) {
            const name = prompt('set filename of saved file:', binFile.name);
            saveFile(binFile.data, name);
        }
    }
    , 'filemenu');
 	app.addMenuItem('Export', exportData, 'filemenu');
    app.addSeparator('filemenu');
 	app.addMenuItem('Split', splitData, 'filemenu');
 	app.addMenuItem('Slice', saveUndo('data slice', sliceData), 'filemenu');
 	app.addMenuItem('Cut Off', saveUndo('data cut off', cutOffData), 'filemenu');
    app.addSeparator('filemenu');
 	app.addMenuItem('pack RLE', saveUndo('RLE compression', packRLE), 'filemenu');
    app.addSeparator('filemenu');
 	app.addMenuItem('Options', toggleOptions, 'filemenu');

 	app.addMenuItem('Negate', saveUndo('data negation', dataNegate));
 	app.addMenuItem('XOR', saveUndo('data XOR operation', dataXOR));
 	app.addMenuItem('OR', saveUndo('data OR operation', dataOR));
 	app.addMenuItem('AND', saveUndo('data AND operation', dataAND));
 	app.addMenuItem('Offset', saveUndo('data offseting', dataOffset));
    app.addBR();
	app.addMenuItem('Show Info', showInfo);
 	app.addMenuItem('Show Hex', showHex);
 	app.addMenuItem('Show Text', showText);
    app.addSeparator();
 	app.addMenuItem('Clear View', cclear);
    app.addSeparator();
 	app.addMenuItem('Undo', undo);
 	app.addMenuItem('Redo', redo);
    app.fitSize();
    
});
