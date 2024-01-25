const fs = require('fs');

function print(value) {
    console.log(value);
}

/*
    Пишем транслятор с языка JavaScript на Python
    Входной код находится в файле Input.txt, в этой директории
*/

/// ---------- LEXER ---------- ///

let inputMass; // Массив, который будет хранить все строки входного файла

// Читаем входной файл
fs.readFile('Транслятор 1/Input.txt', 'utf8', function(err, data) {
    // Помним, что чтение файла - операция асинхронная
    if (err) {
        console.error("Не удалось открыть файл: ", err);
        process.exit(1); // Завершаем программу, если ошибка
    } else {
        //console.log(data);
        inputMass = data.split('\n');             

        inputMass = LexerClearing(inputMass);
        //print(inputMass);
        inputMass = OverspasingLexems(inputMass);

        MainLexer(inputMass);

        //print(inputMass);
    }
});

// Очищает входной файл от пробелов, табов, и других спецсимволов
function LexerClearing(inputMass) {  
    // Удаляем пустые строки
    inputMass = inputMass.filter(line => line.trim() !== '');

    // Обрабатываем каждую строку
    inputMass = inputMass.map(line => {
        // Удаляем символы конца строки
        line = line.replace(/\r/g, '');

        // Заменяем все табы на 1 пробел
        line = line.replace(/\t/g, ' ');

        // Оставляем только один пробел, если встречено больше 1 пробела подряд
        line = line.replace(/ +/g, ' ');

        // Удаляем пробелы в начале и в конце строки
        line = line.trim();

        return line;
    });

    

    return inputMass;
}

// Ключевые слова (лексемы), между которыми мы ставим пробелы
let mass_SpaseLexems = {
    "=" : "EQUAL",
    ";" : "SEMICOLON",
    "(" : "OPEN_PARENTHESIS",
    ")" : "CLOSE_PARENTHESIS",
    "," : "COMMA",
    "{" : "OPEN_BRACE",
    "}" : "CLOSE_BRACE",
    "<" : "LESS_THAN",
    "[" : "OPEN_BRACKET",
    "]" : "CLOSE_BRACKET",
    ">" : "GREATER_THAN",
    "+" : "ADDITION_OPERATOR"  
};

// Расставляет пробелы между нужными лексемами
function OverspasingLexems(inputMass) {
    let outputMass = [];
    for (let i = 0; i < inputMass.length; i++) {
        let line = inputMass[i];
        for (let lexeme in mass_SpaseLexems) {
            let regex = new RegExp("\\" + lexeme, "g");
            line = line.replace(regex, " " + lexeme + " ");
        }
        line = line.replace(/\s+/g, ' ').trim(); // Удаляем лишние пробелы
        outputMass.push(line);
    }
    return outputMass;
}

// Все остальные ключевые слова
let keywords = {
    "var" : "VARIABLE_DECLARATION",
    "function" : "FUNCTION_DECLARATION",
    "return" : "RETURN_STATEMENT",
    "if" : "IF_STATEMENT",
    "else" : "ELSE_STATEMENT",
    "for" : "FOR_LOOP",
    "of" : "OF_KEYWORD",
    "console.log" : "CONSOLE_LOG"      
};

// Выводит в консоль все встреченные лексемы, по порядку
function MainLexer(inputMass) {
    for (let i = 0; i < inputMass.length; i++) {
        let line = inputMass[i];
        let lexemes = line.match(/"[^"]*"|\S+/g); // Используем регулярное выражение, чтобы сохранить строки как одну лексему
        for (let j = 0; j < lexemes.length; j++) {
            let lexeme = lexemes[j];
            if (lexeme.startsWith("\"") && lexeme.endsWith("\"")) {
                console.log(lexeme + " - STRING");
            } else if (mass_SpaseLexems.hasOwnProperty(lexeme)) {
                console.log(lexeme + " - " + mass_SpaseLexems[lexeme]);
            } else if (keywords.hasOwnProperty(lexeme)) {
                console.log(lexeme + " - " + keywords[lexeme]);
            } else if (!isNaN(lexeme)) {
                console.log(lexeme + " - NUM_INT");
            } else {
                console.log(lexeme + " - ID");
            }
        }
    }
}