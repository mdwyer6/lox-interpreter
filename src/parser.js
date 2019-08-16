const { Expr, Binary, Grouping, Literal, Unary } = require("./ast-types");

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

        return expr;
    };

    const comparison = () => {
        let expr = addition();

        while (match([">", ">=", "<", "<="])) {
            const op = tokens[current - 1];
            const right = addition();
            expr = new Binary(expr, op, right);
        }

        return expr;
    };

    const addition = () => {
        let expr = multiplication();

        while (match(["MINUS", "PLUS"])) {
            const op = tokens[current - 1];
            const right = multiplication();
            expr = new Binary(expr, op, right);
        }

        return expr;
    };

    const multiplication = () => {
        let expr = unary();

        while (match(["SLASH", "STAR"])) {
            const op = tokens[current - 1];
            const right = unary();
            expr = new Binary(expr, op, right);
        }

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
            return new Literal(tokens[current - 1].literal);
        }

        if (match("LEFT_PAREN")) {
            const expr = expression();
            consume("RIGHT_PAREN", "Expect ')' after expression.");
            return new Grouping(expr);
        }
    };

    return expression();
};

module.exports = parse;
