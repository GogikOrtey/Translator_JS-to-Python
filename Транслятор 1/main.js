const fs = require('fs');

function print(value) {
    console.log(value);
}

/*
    Пишем транслятор с языка JavaScript на Python
    Входной код находится в файле Input.txt, в этой директории
*/

/// ---------- MAIN ---------- ///

Main();

function Main() {
    try {
        ReadInputFile();        // Загрузка входного файла & Лексер 

        

        //throw(1);
    } 
    catch (error) // Обработчик всех ошибок:
    {
        //print("error = " + error);
        print("\n"); 
        if(error == 1) {
            print("Ошибка, при открытии входного файла с кодом. Проверьте его доступность"); 
        } else {
            print("Трансляция программы завершилась с ошибкой"); // Общая, стандартная ошибка
        }

        process.exit(1); // Завершаем программу, если ошибка
    }
}

/// ---------- LEXER ---------- ///

// Массив, который будет хранить все строки входного файла
let inputMass; 

// Читаем входной файл
function ReadInputFile(wayToInputFile="") {    

    if(wayToInputFile == "") wayToInputFile = 'Транслятор 1/Input.txt'; // Путь по умолчанию

    fs.readFile(wayToInputFile, 'utf8', function(err, data) {
        if (err) {
            console.error("Не удалось открыть файл: ", err);   
            throw(1);
        } else {
            print("Входной файл:\n");
            print(data);
            print("----------------");

            // Подготовка к разбору лексем:
            inputMass = data.split('\n');             

            inputMass = LexerKommentCorrector(inputMass);   // Удаляет однострочные комметнатарии
            inputMass = LexerClearing(inputMass);           // Очищает входной файл от пробелов, табов, и других спецсимволов
            inputMass = OverspasingLexems(inputMass);       // Расставляет пробелы между нужными лексемами

            LexerErrorSymbolCorrector(inputMass);           // Если встретил некорректный символ - выходит из программы, с ошибкой

            // Разбор лексем:
            MainLexer(inputMass);

            // Вывод лексем в консоль:
            PrintAllLexerLexems();
        }
    });
}


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


let lexMassMain = [];   // Хранит все лексемы           Например: for
let lexMassAdd = [];    // Хранит все описания лексем   Например: FOR_LOOP
// Эти массивы будут публичными.

let isPrintToConsole = false; // Печатаем в консоль из MainLexer?

// Выводит в консоль все встреченные лексемы, по порядку
function MainLexer(inputMass) {
    for (let i = 0; i < inputMass.length; i++) {
        let line = inputMass[i];
        let lexemes = line.match(/"[^"]*"|\S+/g); // Используем регулярное выражение, чтобы сохранить строки как одну лексему
        for (let j = 0; j < lexemes.length; j++) {
            let lexeme = lexemes[j];

            if (lexeme.startsWith("\"") && lexeme.endsWith("\"")) {
                if(isPrintToConsole) console.log(lexeme + " - STRING");
                lexMassMain.push(lexeme);
                lexMassAdd.push("STRING");
            } 
            else if (mass_SpaseLexems.hasOwnProperty(lexeme)) {
                if(isPrintToConsole) console.log(lexeme + " - " + mass_SpaseLexems[lexeme]);
                lexMassMain.push(lexeme);
                lexMassAdd.push(mass_SpaseLexems[lexeme]);
            } 
            else if (keywords.hasOwnProperty(lexeme)) {
                if(isPrintToConsole) console.log(lexeme + " - " + keywords[lexeme]);
                lexMassMain.push(lexeme);
                lexMassAdd.push(keywords[lexeme]);
            } 
            else if (!isNaN(lexeme)) {
                if(isPrintToConsole) console.log(lexeme + " - NUM_INT");
                lexMassMain.push(lexeme);
                lexMassAdd.push("NUM_INT");
            } 
            else {
                if(isPrintToConsole) console.log(lexeme + " - ID");
                lexMassMain.push(lexeme);
                lexMassAdd.push("ID");
            }
        }
    }
}

function PrintAllLexerLexems() {
    print("\nВсе разобранные лексемы:\n");
    for (let i = 0; i < lexMassMain.length; i++) {
        print(lexMassMain[i] + "				-   " + lexMassAdd[i]);
    }
    print("\n----------------\n");
}

/// ---------- PARSER ---------- ///




// Нужно добавить в лексер все арифметические операции, и большую часть ключевых слов языка JS

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
    Единая область объявления имён переменных и функций
        Если переменная или функция не используется в коде - в код она не выводится (проверка уже в кодогенераторе)

    При любой ошибке - кидать строку или лексему, в которой она произошла
*/

