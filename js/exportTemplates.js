//  #size#
//  #max#

const exportTemplates = [
    {
        name:'Mad-Pascal table',
        block: {
            prefix: "var data = array [0..#max#] of byte = (\n", postfix: ");"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
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
            hex: true, separator: ',',
            prefix: '', postfix: ''
        }
    },
    

    
]
