//  #size#
//  #max#

const exportTemplates = [
    {
        name:'Mad-Pascal byte array',
        block: {
            prefix: "var data: array [0..#max#] of byte = (\n", postfix: ");"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },

    {
        name:'Mad-Pascal word array',
        block: {
            prefix: "var data: array [0..#max#] of word = (\n", postfix: ");"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 2,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },

    {
        name:'Mad-Pascal cardinal array',
        block: {
            prefix: "var data: array [0..#max#] of cardinal = (\n", postfix: ");"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 4,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },

    {
        name:'Action! BYTE array',
        block: {
            prefix: "BYTE ARRAY DATA=[\n", postfix: "]"
        },
        line: {
            numbers: false, prefix: '  ', postfix: "\n"
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ' ',
            prefix: '$', postfix: ''
        }
    },

    {
        name:'Action! CARD array',
        block: {
            prefix: "CARD ARRAY DATA=[\n", postfix: "]"
        },
        line: {
            numbers: false, prefix: '  ', postfix: "\n"
        },
        byte: {
            valueSize: 2,
            hex: true, separator: ' ',
            prefix: '$', postfix: ''
        }
    },


    {
        name:'C byte array',
        block: {
            prefix: "unsigned char data[#size#] = {\n", postfix: "};"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ', ',
            prefix: '0x', postfix: ''
        }
    },

    {
        name:'C integer array',
        block: {
            prefix: "unsigned data[#size#] = {\n", postfix: "};"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 2,
            hex: true, separator: ', ',
            prefix: '0x', postfix: ''
        }
    },

    {
        name:'C long array',
        block: {
            prefix: "unsigned long data[#size#] = {\n", postfix: "};"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            valueSize: 4,
            hex: true, separator: ', ',
            prefix: '0x', postfix: ''
        }
    },

    {
        name:'BASIC byte data',
        block: {
            prefix: "", postfix: ""
        },
        line: {
            numbers: { start: 10000, step: 10}, prefix: 'DATA ', postfix: "\n"
        },
        byte: {
            valueSize: 1,
            hex: false, separator: ',',
            prefix: '', postfix: ''
        }
    },

    {
        name:'BASIC word data',
        block: {
            prefix: "", postfix: ""
        },
        line: {
            numbers: { start: 10000, step: 10}, prefix: 'DATA ', postfix: "\n"
        },
        byte: {
            valueSize: 2,
            hex: false, separator: ',',
            prefix: '', postfix: ''
        }
    },


    {
        name:'MADS .array .BYTE',
        block: {
            prefix: '.array DATA [#size#] .byte\n', postfix: '.enda'
        },
        line: {
            numbers: false,
            prefix: '  ', postfix: '\n'
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    }, 


    {
        name:'MADS .array .WORD',
        block: {
            prefix: '.array DATA [#size#] .word\n', postfix: '.enda'
        },
        line: {
            numbers: false,
            prefix: '  ', postfix: '\n'
        },
        byte: {
            valueSize: 2,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    }, 
    

    {
        name:'MADS .array .DWORD',
        block: {
            prefix: '.array DATA [#size#] .dword\n', postfix: '.enda'
        },
        line: {
            numbers: false,
            prefix: '  ', postfix: '\n'
        },
        byte: {
            valueSize: 4,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },     

    
    {
        name:'Assembler DAT',
        block: {
            prefix: 'data_label\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  dat ', postfix: '\n'
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },    

    {
        name:'Assembler .BYTE',
        block: {
            prefix: 'data_label\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  .byte ', postfix: '\n'
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },    

    {
        name:'Assembler .WORD',
        block: {
            prefix: 'data_label\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  .word ', postfix: '\n'
        },
        byte: {
            valueSize: 2,
            hex: true, separator: ', ',
            prefix: '$', postfix: ''
        }
    },  

    {
        name:'Raw hex data CSV',
        block: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '', postfix: '\n'
        },
        byte: {
            valueSize: 1,
            hex: true, separator: ',',
            prefix: '', postfix: ''
        }
    },
    

    
]
