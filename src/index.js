const prompts = require('prompts');
const colog = require('colog');

let resp = null;
let boat = [];
let ValidPilots = ["police", "mother", "father"]
let rightSide = ["thief", "police", "boy_1", "boy_2", "girl_1", "girl_2", "mother", "father"]
let LeftSide = []
let FirstTime = true
let Victory = false

function question(option) {
    return prompts([option]);
}

function isValidPilot(pilot) {
    let IsPilot = false
    if (Array.isArray(pilot)) {
        pilot.forEach(element => {
            if (ValidPilots.find(one => one === element)) {
                IsPilot = true;
                return IsPilot
            }
        });
    } else {
        if (ValidPilots.find(one => one === pilot)) {
            IsPilot = true;
            return IsPilot
        }
    }
    return IsPilot
}

function remove(item, arr) {
    for (var i = arr.length; i--;) {
        if (Array.isArray(item)) {
            if (arr[i] === item[0] || arr[i] === item[1]) arr.splice(i, 1);
        } else {
            if (arr[i] === item) arr.splice(i, 1);
        }
    }
}

function movePersons(boatPersons, thisSide) {
    switch (thisSide) {
        case rightSide:
            LeftSide = LeftSide.concat(boatPersons);
            remove(boatPersons, rightSide)
            break;
        case LeftSide:
            rightSide = rightSide.concat(boatPersons);
            remove(boatPersons, LeftSide)
            break;

        default:
            break;
    }
}

function thiefValidation(side) {
    if (side.includes('thief')) {
        if (side.length === 1) {
            return 0;
        } else {
            if (side.includes('police')) {
                return 0;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

function fatherValidation(side) {
    if (side.includes('father')) {
        if (side.length === 1) {
            return 0;
        } else if (side.length <= 3) {
            if (side.includes('girl_1' || 'girl_2')) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

}

function motherValidation(side) {
    if (side.includes('mother')) {
        if (side.length === 1) {
            return 0;
        } else if (side.length <= 3) {
            if (side.includes('boy_2' && 'boy_1')) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
}

function isValidCombinations(side) {
    let errors = 0
    errors = errors + thiefValidation(side)
    errors = errors + fatherValidation(side)
    erros = errors + motherValidation(side)

    if (side == rightSide && side.length == 0 && isValidCombinations(LeftSide)) {
        colog.log(colog.colorGreen("parabéns você venceu! :D"));
        Victory = true
        return true
    }
    if (errors > 0) {
        return false
    } else {
        return true
    }
}


async function validations(response, side) {
    let boatPersons = null
    if (response.length > 1) {
        boatPersons = [side[response[0]], side[response[1]]]
    } else {
        boatPersons = side[response]
    }

    let validPilot = isValidPilot(boatPersons);

    if (validPilot == true) {
        movePersons(boatPersons, side)
        if (isValidCombinations(rightSide) &&
            isValidCombinations(LeftSide)) {
            await main(rightSide, LeftSide)

        } else {
            colog.log(colog.colorRed(colog.backgroundBlack("Combinação inválida, Tente novamente!\n\n")));
            rightSide = rightSide.concat(LeftSide)
            LeftSide = []
            main(rightSide, LeftSide)


        }

    } else {

        colog.log(colog.colorYellow(colog.backgroundBlack("\n\nO barco não possui nenhum piloto válido, tente novamente\n")))
        await main(rightSide, LeftSide)
    }



}

async function main(rightSide, LeftSide) {
    colog.log(colog.color('Regras:\n', 'red') + colog.color('O barco pode carregar apenas 2 pessoas por vez. \nApenas a mãe, o pai e o policial podem operar o bote. \nA mãe não pode ser deixada sozinha com os filhos. \nO pai não pode ser deixado sozinho com as filhas. \nO ladrão não pode ser deixado sozinho com ninguém sem o policial.', 'magenta'))

    let side = null
    if (Victory) {
        return
    }
    if (FirstTime) {
        choices = ['direita']
    } else {
        choices = ['direita', 'esquerda']
    }
    colog.log(colog.color('\nDireita: ' + rightSide, 'red') + colog.color('\t\t\t\t\tEsquerda: ' + LeftSide, 'green'));
    FirstTime = false
    side = await question({
        type: 'multiselect',
        instructions: false,
        name: 'answer',
        message: 'Selecione o lado que deseja Mover',
        choices: choices,
        min: 1,
        max: 1,
    })
    let selectedSide = parseInt(side.answer)
    switch (selectedSide) {
        case 0:
            resp = await question({
                type: 'multiselect',
                instructions: false,
                name: 'answer',
                message: 'Selecione 2 pessoas para Mover',
                choices: rightSide,
                min: 1,
                max: 2,
            })
            boat = validations(resp.answer, rightSide)
            break;
        case 1:
            resp = await question({
                type: 'multiselect',
                instructions: false,
                name: 'answer',
                message: 'Selecione 2 pessoas para Mover',
                choices: LeftSide,
                min: 1,
                max: 2,
            })
            boat = validations(resp.answer, LeftSide)
            break;
        default:
            break;
    }
}

main(rightSide, LeftSide)