const fs = require('fs');

function print(value) {
    console.log(value);
}

/*
    Пишем транслятор с языка JavaScript на Python
    Входной код находится в файле Input.txt, в этой директории
*/

/// ---------- LEXER ---------- ///

// Массив, который будет хранить все строки входного файла
let inputMass; 

// Читаем входной файл
fs.readFile('Транслятор 1/Input.txt', 'utf8', function(err, data) {
    // Помним, что чтение файла - операция асинхронная
    if (err) {
        console.error("Не удалось открыть файл: ", err);
        process.exit(1); // Завершаем программу, если ошибка
    } else {
        // Подготовка к разбору лексем:
        inputMass = data.split('\n');             

        inputMass = LexerKommentCorrector(inputMass);   // Удаляет однострочные комметнатарии
        inputMass = LexerClearing(inputMass);           // Очищает входной файл от пробелов, табов, и других спецсимволов
        inputMass = OverspasingLexems(inputMass);       // Расставляет пробелы между нужными лексемами

        LexerErrorSymbolCorrector(inputMass);           // Если встретил некорректный символ - выходит из программы, с ошибкой

        // Разбор лексем:
        MainLexer(inputMass);
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

// Удаляет однострочные комметнатарии
function LexerKommentCorrector(inputMass) {
    for (let i = 0; i < inputMass.length; i++) {
        for (let j = 0; j < inputMass[i].length - 1; j++) {
            if(inputMass[i][j] == '/' && inputMass[i][j+1] == '/') { // Если нашли начало комментария
                inputMass[i] = inputMass[i].substring(0, j);
                break; // Выходим из цикла, так как мы уже нашли комментарий
            }
        }
    }

    return(inputMass);
}

function LexerErrorSymbolCorrector(inputMass) {
    for (let i = 0; i < inputMass.length; i++) {
        for (let j = 0; j < inputMass[i].length; j++) {
            let ascii = inputMass[i].charCodeAt(j);
            if (!((ascii >= 32 && ascii <= 126) || (ascii >= 1040 && ascii <= 1105))) {
                print("Встречен недопустимый символ! Разбор программы был остановлен: " 
                    + inputMass[i][j]); // + " : " + inputMass[i].charCodeAt(j));
                process.exit(2);
            }
        }
    }
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


// Лексер готов ~

// Нужно добавить все арифметические операции, и большую часть ключевых слов языка JS
// Добавить:
/*
    Удаление комментариев (однострочных)
*/

// Дальше пишем парсер. Под основные конструкции кода (любезно представленные в примере):
/*
    Инициализация переменной
    Функция -> Переход на уровень выше, пока не встретим }
        Оператор return
        Аргументы у функции
        Вызов функции
            Единая область имён функций
    Вывод в консоль (print)
    Цикл for
        Со счётчиком i
        С перечислением (ч/з массив)
    Инициализация массива
*/

// Добавить в семантическом анализаторе:
/*
    Если встречен недопустимый символ - разбор прекращается (в Лексере)

    Единая область объявления имён переменных и функций
        Если переменная или функция не используется в коде - в код она не выводится (проверка уже в кодогенераторе)

    При любой ошибке - кидать строку или лексему, в которой она произошла
*/

/// ---------- PARSER ---------- ///