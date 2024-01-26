const fs = require('fs'); // Для работы с текстовыми файлами

function print(value) {
    console.log(value);
}

/*
    Пишем транслятор с языка JavaScript на Python
    Входной код находится в файле Input.txt, в этой директории
*/





/// ---------- MAIN ---------- ///


function Main() {
    try {
        // В принципе, программа маленькая. Она вся умещается вот в эти 3 строчки кода:

        ReadInputFile();        // Загрузка входного файла & Лексер 
        MainParser();           // Парсер & Семантический анализатор

        //throw(1);
    } 
    catch (error) // Обработчик ВСЕХ ошибок:
    {
        print("error = " + error);
        print("\n"); 

        // Ошибки, которые выбрасывает Лексер
        if(error == 1) {
            print("Ошибка, при открытии входного файла с кодом. Проверьте его доступность"); 
        } 
        if(error == 2) {
            print("Встречен недопустимый символ"); 
        } 

        // Ошибки, которые выбрасывает Парсер

        // Все остальные ошибки (включая незадекларированные):
        else {
            print("Трансляция программы завершилась с ошибкой"); // Общая, стандартная ошибка
        }

        process.exit(1); // Завершаем программу
    }
}





/// ---------- LEXER ---------- ///


// Массив, который будет хранить все строки входного файла
let inputMass; 

let lexMassMain = [];   // Хранит все лексемы           Например: for
let lexMassAdd = [];    // Хранит все описания лексем   Например: FOR_LOOP

// Читаем входной файл
function ReadInputFile(wayToInputFile="") {    

    print("Читаем файл");

    if(wayToInputFile == "") wayToInputFile = 'Транслятор 1/Input.txt'; // Путь по умолчанию

    try {
        let data = fs.readFileSync(wayToInputFile, 'utf8');
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
    } catch (err) {
        console.error("Не удалось открыть файл: ", err);   
        throw(1);
    }
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

// Проверяет, нет ли в программе недопустимых символов
function LexerErrorSymbolCorrector(inputMass) {
    for (let i = 0; i < inputMass.length; i++) {
        for (let j = 0; j < inputMass[i].length; j++) {
            let ascii = inputMass[i].charCodeAt(j);
            if (!((ascii >= 32 && ascii <= 126) || (ascii >= 1040 && ascii <= 1105))) {
                print("Встречен недопустимый символ! Разбор программы был остановлен: " 
                    + inputMass[i][j]); // + " : " + inputMass[i].charCodeAt(j));
                //process.exit(2);
                throw(2);
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


let allFuncInit = []; // Будет хранить все инициализированные названия функций

// Для печати с нужным количеством табов
let lvl = 0;

function printLvl(str) {
    str1 = "";
    if(lvl < 0) lvl = 0;

    for (let i = 0; i < lvl; i++) {
        str1 += "	";
    }

    print(str1 + str);
}


function MainParser() {
    // Используем массивы lexMassMain и lexMassAdd - в них харнятся все распознанные лексемы
    // Идём по ним, и когда встречаем лексему, с которой начинается какой-то блок, в программе,
    // например FOR или IF - переходим в другую функцию, и обрабатываем этот блок.
    // Но затем - снова возвращаем управление, в эту основную функцию

    print("Дерево разбора парсера:\n");

    lvl = 0;

    for (let i = 0; i < lexMassMain.length; i++) {

        if(lexMassAdd[i] == "SEMICOLON") {
            continue;
        }

        if(lexMassAdd[i] == "VARIABLE_DECLARATION") {

            i++;

            if(lexMassAdd[i] == "ID") {
                printLvl("INIT_VAR:");
                lvl++;
                printLvl("NAME : " + lexMassMain[i]);
                i++;

                if(lexMassAdd[i] == "EQUAL") {
                    i++;

                    if(lexMassAdd[i] == "NUM_INT") {
                        printLvl("VALUE : " + lexMassMain[i]);
                        lvl--;

                        continue;
                    } else if(lexMassAdd[i] == "OPEN_BRACKET") {
                        printLvl("MASS_VALUES:");
                        lvl++;
                        i++;
        
                        while(lexMassAdd[i] != "CLOSE_BRACKET") {
                            if(lexMassAdd[i] == "STRING") {
                                printLvl("VALUE : " + lexMassMain[i]);
                            }
                            i++;
                        }
        
                        lvl--;
                        lvl--;
                    }
                }
            }
        }        

        if(lexMassAdd[i] == "FUNCTION_DECLARATION") {
            i++;
    
            if(lexMassAdd[i] == "ID") {
                printLvl("INIT_FUNC:");
                lvl++;
                printLvl("NAME : " + lexMassMain[i]);
                allFuncInit.push(lexMassMain[i]);
                i++;
    
                if(lexMassAdd[i] == "OPEN_PARENTHESIS") {
                    printLvl("PARAMS:");
                    lvl++;
                    i++;
    
                    while(lexMassAdd[i] != "CLOSE_PARENTHESIS") {
                        if(lexMassAdd[i] == "ID") {
                            printLvl("PARAM : " + lexMassMain[i]);
                        }
                        i++;
                    }
    
                    lvl--;
                }
                printLvl("BODY: ");
                continue;
            }
        }

        if(lexMassAdd[i] == "RETURN_STATEMENT") {
            printLvl("RETURN:");
            lvl++;
            i++;
        
            while(lexMassAdd[i] != "SEMICOLON") {
                if(lexMassAdd[i] == "ID" || lexMassAdd[i] == "NUM_INT") {
                    printLvl("VALUE : " + lexMassMain[i]);
                } else if(lexMassAdd[i] == "ADDITION_OPERATOR") {
                    printLvl("OPERATOR : " + lexMassMain[i]);
                }
                i++;
            }
        
            lvl--;
            continue;
        }

        if(lexMassAdd[i] == "IF_STATEMENT") {
            printLvl("IF:");
            lvl++;
            i++;
        
            if(lexMassAdd[i] == "OPEN_PARENTHESIS") {
                i++;
        
                while(lexMassAdd[i] != "CLOSE_PARENTHESIS") {
                    if(lexMassAdd[i] == "ID" || lexMassAdd[i] == "NUM_INT") {
                        printLvl("VALUE : " + lexMassMain[i]);
                    } else if(lexMassAdd[i] == "GREATER_THAN") {
                        printLvl("OPERATOR : " + lexMassMain[i]);
                    }
                    i++;
                }
        
                //lvl--;
                printLvl("BODY: ");
                continue;
            }
        }
        
        if(lexMassAdd[i] == "CONSOLE_LOG") {
            printLvl("CONSOLE_LOG:");
            lvl++;
            i++;
        
            if(lexMassAdd[i] == "OPEN_PARENTHESIS") {
                i++;
        
                while(lexMassAdd[i] != "CLOSE_PARENTHESIS") {
                    if(lexMassAdd[i] == "STRING" || lexMassAdd[i] == "ID") {
                        printLvl("VALUE : " + lexMassMain[i]);
                    } else if(lexMassAdd[i] == "ADDITION_OPERATOR") {
                        printLvl("OPERATOR : " + lexMassMain[i]);
                    }
                    i++;
                }
        
                lvl--;
                continue;
            }
        }

        if(lexMassAdd[i] == "ELSE_STATEMENT") {
            printLvl("ELSE:");
            lvl++;
            printLvl("BODY: ");
            continue;
        }

        if(lexMassAdd[i] == "FOR_LOOP") {
            printLvl("FOR:");
            lvl++;
            i++;
        
            if(lexMassAdd[i] == "OPEN_PARENTHESIS") {
                i++;
        
                if(lexMassAdd[i] == "VARIABLE_DECLARATION") {
                    i++;
        
                    if(lexMassAdd[i] == "ID") {
                        printLvl("COUNTER_VAR : " + lexMassMain[i]);
                        i++;
        
                        if(lexMassAdd[i] == "EQUAL") {
                            i++;
        
                            if(lexMassAdd[i] == "NUM_INT") {
                                printLvl("INIT_VALUE : " + lexMassMain[i]);
                                i++;
        
                                if(lexMassAdd[i] == "SEMICOLON") {
                                    i++;
        
                                    while(lexMassAdd[i] != "SEMICOLON") {
                                        i++;
                                    }
        
                                    if(lexMassAdd[i] == "SEMICOLON") {
                                        i--;
        
                                        if(lexMassAdd[i] == "NUM_INT") {
                                            printLvl("END_VALUE : " + lexMassMain[i]);
                                            i++;
        
                                            if(lexMassAdd[i] == "SEMICOLON") {
                                                i++;
        
                                                if(lexMassAdd[i] == "ID") {
                                                    i++;
        
                                                    if(lexMassAdd[i] == "ADDITION_OPERATOR" 
                                                        && lexMassAdd[i+1] == "ADDITION_OPERATOR") {
                                                        printLvl("INCREMENT : ++");
                                                        i++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if(lexMassAdd[i] == "OF_KEYWORD") {
                            printLvl("OF");
                            i++;

                            if(lexMassAdd[i] == "ID") {
                                printLvl("VAR_COUNTS : " + lexMassMain[i]);
                                i++;
                            }
                        }
                    }
                }
        
                //lvl--;
                printLvl("BODY: ");
                continue;
            }
        }
        
        if(lexMassAdd[i] == "ID") {
            if(allFuncInit.includes(lexMassMain[i])) {
                printLvl("CALL_FUNC:");
                lvl++;
                printLvl("NAME : " + lexMassMain[i]);
                i++;
        
                if(lexMassAdd[i] == "OPEN_PARENTHESIS") {
                    printLvl("ARGS:");
                    lvl++;
                    i++;
        
                    while(lexMassAdd[i] != "CLOSE_PARENTHESIS") {
                        if(lexMassAdd[i] == "STRING") {
                            printLvl("ARG : " + lexMassMain[i]);
                        }
                        i++;
                    }
        
                    lvl--;
                    lvl--;
                    continue;
                }
            }
        }        

        if(lexMassAdd[i] == "") {
            
        }

        if(lexMassAdd[i] == "CLOSE_BRACE") {
            if(lvl > 0) lvl--;
        }
    }  
}



































Main(); 

// Он сидит тут, ̶п̶о̶т̶о̶м̶у̶ ̶ч̶т̶о̶ ̶н̶а̶к̶а̶з̶а̶н
// Он здесь, потому что нужно сначала инициализировать все переменные и функции, что бы не было ошибок




// Нужно добавить в лексер все арифметические операции, и большую часть ключевых слов языка JS


