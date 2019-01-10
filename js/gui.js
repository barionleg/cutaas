const gui = (options) => {

    const fitSize = () => {
        const cpos = $('#consol').offset();
        $('#consol')
            .css('height', $('body').height() - cpos.top)
            .css('width', $('body').width() - 30)
            .css('font-size',`${options.consoleFontSize}`);
        $('.menulist')
            .css('width', $('body').width() - 30)
        //console.log(cpos);
    }
    
    $(window).resize(fitSize);
    $('#file').change(openFile);
    $('#afile').change(appendFile);
    $('#save_options').click(saveOptions);
    $('#save_export').click(exportData);
    $('#bytes_per_line').change(updateAfterEdit);

	$('<ul/>').attr('id','menulist').addClass('menulist').appendTo('#menu');

	const addMenuItem = (name, handler, parent = 'menulist') => {
		$('<li/>').html(name).addClass('menuitem').appendTo(`#${parent}`)
    .bind('click', handler);
	}
	const addSeparator = (parent = 'menulist') => {
		$('<div/>').addClass('menuseparator').appendTo(`#${parent}`)
	}

	const addBR = (parent = 'menulist') => {
		$('<div/>').addClass('menubr').appendTo(`#${parent}`)
	}
    
	return {
		addMenuItem,
        addSeparator,
        addBR,
        fitSize
	}
};
