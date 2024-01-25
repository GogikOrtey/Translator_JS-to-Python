const fs = require('fs');

function print(value) {
    console.log(value);
}

/*
    Пишем транслятор с языка JavaScript на Python
    Входной код находится в файле Input.txt, в этой директории
*/

// Читаем входной файл
fs.readFile('Транслятор 1/Input.txt', 'utf8', function(err, data) {
    if (err) {
        console.error("Не удалось открыть файл: ", err);
    } else {
        console.log(data);
    }
});
