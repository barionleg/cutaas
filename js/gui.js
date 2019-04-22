const gui = (options) => {

    const fitSize = () => {
        const cpos = $('#consol').offset();
        $('#consol')
            .css('height', $('body').height() - cpos.top)
            .css('width', $('body').width() - 30)
            .css('font-size', `${options.consoleFontSize}`);
        $('.menulist')
            .css('width', $('body').width() - 30)
        //console.log(cpos);
    }

    let fileDialogs = 0;

    $(window).resize(fitSize);
    $('#save_options').click(saveOptions);
    $('#save_export').click(exportData);
    $('#bytes_per_line').change(updateAfterEdit);

    $('<ul/>').attr('id', 'menulist').addClass('menulist').appendTo('#menu');

    const addMenuItem = (name, handler, parent = 'menulist', hint) => {
        const li = $('<li/>').html(name).addClass('menuitem').bind('click', handler);
        if (hint) li.attr('title', hint);
        li.appendTo(`#${parent}`);
        return li;
    }

    const addMenuFileOpen = (name, handler, parent = 'menulist', hint) => {
        const inp = $(`<input type='file' id='fdialog${fileDialogs}' class='fileinput'>`);
        const label = $('<label/>').attr('for', `fdialog${fileDialogs}`).html(name).addClass('menuitem');
        inp.change(handler);
        if (hint) label.attr('title', hint);
        $(`#${parent}`).append(inp, label);
        fileDialogs++;
        return label;
    }


    const addSeparator = (parent = 'menulist') => {
        $('<div/>').addClass('menuseparator').appendTo(`#${parent}`)
    }

    const addBR = (parent = 'menulist') => {
        $('<div/>').addClass('menubr').appendTo(`#${parent}`)
    }

    return {
        addMenuItem,
        addMenuFileOpen,
        addSeparator,
        addBR,
        fitSize
    }
};
