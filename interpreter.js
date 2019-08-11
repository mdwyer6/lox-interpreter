const fs = require("fs");
const prompt = require("prompt");

const main = filePath => {
    if (filePath) {
        runFile(filePath);
    } else {
        runPrompt();
    }
};

const runFile = filePath => {
    fs.read(filePath, (err, data) => {
        run(data);
    });
};

const runPrompt = () => {
    prompt.start();
    prompt.get(["code"], function(err, { code }) {
        console.log(lex(code));
    });
};

const run = source => {};

const generateError = () => {};

class Token {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return type + " " + lexeme + " " + literal;
    }
}

const reservedWords = new Set([
    "and",
    "class",
    "else",
    "false",
    "for",
    "fun",
    "if",
    "nil",
    "or",
    "print",
    "return",
    "super",
    "this",
    "true",
    "var",
    "while"
]);

const lex = source => {
    const tokens = [];

    let start = 0;
    let current = 0;
    let line = 0;

    const match = expected => {
        if (source.length === current + 1) return false;
        if (source[current + 1] != expected) return false;

        current++;
        return true;
    };

    const peek = () => {
        if (source.length === current + 1) {
            return "\0";
        }
        return source[current + 1];
    };

    const peakNext = () => {
        if (source.length >= current + 2) {
            return "\0";
        }
        return source[current + 2];
    };

    const string = () => {
        while (peek() !== '"') {
            if (current === source.length) {
                generateError("unterminating string");
                return;
            }

            current++;
        }

        current++;

        return "STRING";
    };

    const isDigit = c => c >= "0" && c <= "9";

    const isAlpha = c => {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
    };

    const isAlphaNumeric = c => isDigit(c) || isAlpha(c);

    const number = () => {
        while (isDigit(peek())) current++;

        if (current === "." && isDigit(peekNext())) {
            current++;
            while (isDigit(peek())) current++;
        }

        return "NUMBER";
    };

    const identifier = () => {
        while (isAlphaNumeric(peek())) current++;

        const currentToken = source.slice(start, current + 1);
        if (reservedWords.has(currentToken)) {
            return currentToken;
        }

        return "IDENTIFIER";
    };

    const scanToken = c => {
        switch (c) {
            case "(":
                return "LEFT_PAREN";
            case ")":
                return "RIGHT_PAREN";
            case "{":
                return "LEFT_BRACE";
            case "}":
                return "RIGHT_BRACE";
            case ",":
                return "COMMA";
            case ".":
                return "DOT";
            case "-":
                return "MINUS";
            case "+":
                return "PLUS";
            case ";":
                return "SEMICOLON";
            case "*":
                return "STAR";
            case "!":
                return match("=") ? "BANG_EQUAL" : "BANG";
            case "=":
                return match("=") ? "EQUAL_EQUAL" : "EQUAL";
            case "<":
                return match("=") ? "LESS_EQUAL" : "LESS";
            case ">":
                return match("=") ? "GREATER_EQUAL" : "GREATER";
            case "/":
                if (match("/")) {
                    while (peek() != "\n" && !(current + 1 === source.length))
                        current++;
                } else {
                    return "SLASH";
                }
                break;
            case " ":
            case "\r":
            case "\t":
                break;
            case "\n":
                line++;
                break;
            case '"':
                return string();
            default:
                if (isDigit(c)) {
                    return number();
                } else if (isAlpha(c)) {
                    return identifier();
                } else {
                    generateError("Unrecognized token");
                }
        }
    };

    while (current < source.length) {
        const currentChar = source[current];

        const type = scanToken(currentChar);
        if (type) {
            let text = "";
            if (type === "STRING") {
                text = source.slice(start + 1, current);
            } else if (type === "NUMBER") {
                text = Number(source.slice(start, current + 1));
            } else {
                text = source.slice(start, current + 1);
            }

            const nextToken = new Token(type, text, null, line);

            tokens.push(nextToken);
        }

        current++;

        start = current;
    }

    return tokens;
};
