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

        LexerClearing(inputMass);
    }
});

// Очищает входной файл от пробелов, табов, и других спецсимволов
function LexerClearing(inputMass) {
    print(inputMass)

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

    print(inputMass)

    return inputMass;
}