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
        const tokens = lex(code);
        console.log(parse(tokens));
        runPrompt();
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
            let literal = source.slice(start, current + 1);
            if (type === "STRING") {
                literal = source.slice(start + 1, current);
            } else if (type === "NUMBER") {
                literal = Number(source.slice(start, current + 1));
            }

            const nextToken = new Token(
                type,
                source.slice(start, current + 1),
                literal,
                line
            );

            tokens.push(nextToken);
        }

        current++;

        start = current;
    }

    return tokens;
};

main();

class Expr {}

class Binary extends Expr {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class Grouping extends Expr {
    constructor(expression) {
        super();
        this.expression = expression;
    }
}

class Literal extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
}

class Unary extends Expr {
    constructor(operator, right) {
        super();
        this.operator = operator;
        this.right = right;
    }
}

const parse = tokens => {
    let current = 0;

    const peek = () => {
        if (current + 1 === tokens.length) {
            return false;
        }

        return tokens[current + 1];
    };

    const match = tokenTypes => {
        if (tokens[current] && tokenTypes.includes(tokens[current].type)) {
            current++;
            return true;
        }

        return false;
    };

    const expression = () => equality();

    const equality = () => {
        let expr = comparison();

        while (match(["!=", "=="])) {
            const op = tokens[current - 1];
            const right = comparison();
            expr = new Binary(expr, op, right);
        }

        // console.log("eq", expr);

        return expr;
    };

    const comparison = () => {
        let expr = addition();

        while (match([">", ">=", "<", "<="])) {
            const op = tokens[current - 1];
            const right = addition();
            expr = new Binary(expr, op, right);
        }

        // console.log("comp", expr);

        return expr;
    };

    const addition = () => {
        let expr = multiplication();

        while (match(["MINUS", "PLUS"])) {
            const op = tokens[current - 1];
            const right = multiplication();
            expr = new Binary(expr, op, right);
        }

        // console.log("add", expr);

        return expr;
    };

    const multiplication = () => {
        let expr = unary();

        while (match(["SLASH", "STAR"])) {
            const op = tokens[current - 1];
            const right = unary();
            expr = new Binary(expr, op, right);
        }

        //console.log("mult", expr);

        return expr;
    };

    const unary = () => {
        while (match(["BANG", "MINUS"])) {
            const op = tokens[current - 1];
            const operand = unary();
            return new Unary(op, operand);
        }

        return primary();
    };

    const primary = () => {
        const consume = (tokenType, errorMessage) => {
            while (tokens[current] !== tokenType) {
                current++;
                if (current === tokens.length) {
                    throw Error(errorMessage);
                }
            }
        };

        if (match(["FALSE"])) return new Literal(false);
        if (match(["TRUE"])) return new Literal(true);
        if (match(["NIL"])) return new Literal(null);

        if (match(["NUMBER", "STRING"])) {
            return new Literal(tokens[current - 1].lexeme);
        }

        if (match("LEFT_PAREN")) {
            const expr = expression();
            consume("RIGHT_PAREN", "Expect ')' after expression.");
            return new Grouping(expr);
        }
    };

    return expression();
};
