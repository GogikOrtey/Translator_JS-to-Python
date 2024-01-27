class help:
    ACCESS_MODIFIERS = {
        "public": "PUBLIC",
        "private": "PRIVATE",
        "protected": "PROTECTED",
    }

    KEY_WORDS = {
        "class": "CLASS",
        "else": "ELSE",
        "for": "FOR",
        "if": "IF",
        "return": "RETURN",
        "while": "WHILE",
        "elseif": "ELSEIF",
        "foreach": "FOREACH",
        "function": "FUNCTION",
        "var": "VAR",
        "let": "LET",
        "const": "CONST",
        "console": "CONSOLE",
        "log": "LOG",
        "console.log": "CONSOLE.LOG",
        "EOF": "EOF",
    }

    DATA_TYPES = {
        "int": "INT",
        "float": "FLOAT",
        "char": "CHAR",
        "string": "STRING",
        "boolean": "BOOLEAN",
        "undefined": "UNDEFINED",
    }

    OPERATORS = {
        "=": "ASSIGN",
        "==": "IS_EQUAL",
        "===": "STRICT_EQUAL",
        "!=": "INEQUALITY",
        "!==": "STRICT_INEQUALITY",
        "<": "LESS",
        ">": "MORE",
        ">=": "GRATER_THAN_OR_EQUAL",
        "<=": "LESS_THAN_OR_EQUAL",
        "+": "PLUS",
        "-": "MINUS",
        "*": "MULTIPLY",
        "/": "DIVIDE",
        "%": "MOD",
        "+=": "ADDITION_ASSIGN",
        "-=": "SUBTRACTION_ASSIGN",
        "*=": "MULTIPLICATION_ASSIGN",
        "/=": "DIVISION_ASSIGN",
        "++": "INCREMENT",
        "--": "DECREMENT",
        "&&": "AND",
        "||": "OR",
        "!": "NOT",
    }

    SPEC = {
        "(": "LEFT_PARENTHESIS",
        ")": "RIGHT_PARENTHESIS",
        "[": "LEFT_SQUARE_BRACKET",
        "]": "RIGHT_SQUARE_BRACKET",
        "{": "LEFT_CURLY_BRACKET",
        "}": "RIGHT_CURLY_BRACKET",
        ".": "DOT",
        ",": "COMMA",
        ";": "SEMICOLON",
        ":": "COLON",
        "$": "DOLLAR",
        "#": "HASH"
    }

    IGNORE = ["\n", " ", "\t", "\r"]


class Token:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __repr__(self):
        return f"{self.name}\t:{self.value}"


class Lexer:
    text = ""
    flow_lexem = []
    START, COMMENT, EOF, STRING, FLOAT, CHAR, OPERATOR, ID, INT, BOOLEAN = range(10)
    STATES = {
        START: "START",
        COMMENT: "COMMENT",
        EOF: "EOF",
        STRING: "string",
        CHAR: "char",
        OPERATOR: "OPERATOR",
        ID: "ID",
        INT: "int",
        BOOLEAN: "boolean",
        FLOAT: "float"
    }

    def __init__(self, source):
        if self.text == "":
            with open(source, "r") as file:
                self.text = file.read()
        self.state = None
        self.source = source
        self.pos = -1
        self.position = -1
        self.lineno = 0
        self.len = len(self.text)

    def get_char(self):
        self.pos += 1
        self.position += 1
        if self.pos < self.len:
            return self.text[self.pos]
        else:
            self.state = Lexer.START
            return ""

    def get_next_token(self):
        accum = ""
        self.state = Lexer.START
        ch = self.get_char()

        while self.state is not None and self.state != Lexer.EOF:
            while ch in help.IGNORE:
                if ch == "\n":
                    self.lineno += 1
                    self.position = -1
                ch = self.get_char()

            if ch == '':
                return Token(Lexer.EOF, "EOF")

            if ch == '"':
                self.state = Lexer.STRING
                ch = self.get_char()
                while self.state == Lexer.STRING:
                    accum += ch
                    ch = self.get_char()
                    if ch == '"':
                        self.state = None
                return Token(accum, help.DATA_TYPES[Lexer.STATES[Lexer.STRING]])

            if ch == "'":
                self.state = Lexer.CHAR
                ch = self.get_char()
                accum += ch
                ch = self.get_char()
                if ch != "'":
                    raise SyntaxError.SyntaxError("char", self.lineno, self.position)
                else:
                    return Token(accum, help.DATA_TYPES[Lexer.STATES[Lexer.CHAR]])

            if ch in help.SPEC:
                accum += ch
                return Token(accum, help.SPEC[ch])

            if ch in help.OPERATORS:
                self.state = Lexer.OPERATOR
                accum += ch
                next_ch = self.get_char()

                # Проверяем, является ли следующий символ частью оператора
                while accum + next_ch in help.OPERATORS:
                    accum += next_ch
                    next_ch = self.get_char()

                self.pos -= 1
                if accum == "#":
                    accum = ""
                    self.state = Lexer.COMMENT
                elif accum in help.OPERATORS:
                    return Token(accum, help.OPERATORS[accum])
                else:
                    raise SyntaxError.SyntaxError("operator", self.lineno, self.position)

            if ch.isalpha():
                while ch.isalnum():
                    self.state = Lexer.ID
                    accum += ch

                    if accum in help.ACCESS_MODIFIERS:
                        return Token(accum, help.ACCESS_MODIFIERS[accum])
                    elif accum in help.KEY_WORDS:
                        return Token(accum, help.KEY_WORDS[accum])
                    elif accum in help.DATA_TYPES:
                        return Token(accum, help.DATA_TYPES[accum])
                    ch = self.get_char()
                    if accum in {"console", "System", "System.out"} and ch == ".":
                        accum += ch
                        ch = self.get_char()

                self.pos -= 1
                if accum == "false" or accum == "true":
                    return Token(accum, help.DATA_TYPES[Lexer.STATES[Lexer.BOOLEAN]])
                else:
                    return Token(accum, Lexer.STATES[Lexer.ID])

            if ch.isnumeric():
                self.state = Lexer.INT
                while self.state is not None:
                    accum += ch
                    ch = self.get_char()
                    if ch == ".":
                        if self.state == Lexer.FLOAT:
                            raise SyntaxError.SyntaxError("float", self.lineno, self.position)
                        self.state = Lexer.FLOAT
                        accum += ch
                        ch = self.get_char()

                    if ch in help.SPEC:
                        self.state = None
                    elif ch in help.OPERATORS:
                        self.state = None
                    elif not ch.isnumeric():
                        if self.state == Lexer.FLOAT:
                            raise SyntaxError.SyntaxError("float", self.lineno, self.position)
                        else:
                            raise SyntaxError.SyntaxError("integer", self.lineno, self.position)

                if accum[len(accum) - 1] == ".":
                    raise SyntaxError.SyntaxError("real number", self.lineno, self.position)

                self.pos -= 1
                if "." in accum:
                    return Token(accum, help.DATA_TYPES[Lexer.STATES[Lexer.FLOAT]])
                else:
                    return Token(accum, help.DATA_TYPES[Lexer.STATES[Lexer.INT]])

            if self.state == Lexer.START:
                self.state = Lexer.EOF
                return Token("EOF", Lexer.STATES[Lexer.EOF])

    def parse(self):
        if len(self.text) == 0:
            return

        self.len = len(self.text)
        if self.state == Lexer.EOF:
            return
        return self.get_next_token()


class SyntaxError(BaseException):
    @staticmethod
    def SyntaxError(text, line, pos):
        return f"Syntax error: {text} in line {line} position {pos}"
