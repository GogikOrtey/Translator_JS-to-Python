var x = 5;
var y = 10;

function addNumbers(x, y) {
    return x + y;
}

// Комментарий
// Запрещённые символы: ♥♦♠♣

if (x > y) {
    console.log("x is greater than y");
} else {
    console.log("x is less than or equal to y");
}

for (var i = 0; i < 5; i++) {
    console.log("Iteration " + i);
}

var fruits = ["apple", "orange", "banana"];

for (var fruit of fruits) {
    console.log(fruit);
}

function greet(name) {
    console.log("Hello, " + name + "!");
}

greet("John");
