const {
    Expr,
    Binary,
    Grouping,
    Literal,
    Unary,
    Statement,
    Print,
    Expression,
    Declaration,
    VarDecl,
    VarExpr,
    Block,
    Assign,
    If,
    For,
    While
} = require("./ast-types");

const throwAfterN = n => {
    let calls = 0;
    return () => {
        calls++;
        if (calls === n) {
            process.exit(0);
            //throw new Error();
        }
    };
};

const throwAfter5 = throwAfterN(5);

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

    const consume = (tokenType, errorMessage) => {
        if (current === tokens.length) {
            throw Error(errorMessage);
        }

        while (!tokens[current - 1] || tokens[current - 1].type !== tokenType) {
            current++;
            if (current - 1 === tokens.length) {
                throw Error(errorMessage);
            }
        }
    };

    const declaration = () => {
        if (match("var")) {
            return varDecl();
        }

        return statement();
    };

    const varDecl = () => {
        const currentToken = tokens[current];
        if (match("IDENTIFIER")) {
            let expr = null;
            if (match("EQUAL")) {
                expr = expression();
            }

            consume("SEMICOLON", "Expected semicolon after declaration");
            return new VarDecl(currentToken, expr);
        }

        throw new Error("expected identifier after 'var'");
    };

    const statement = () => {
        if (match("print")) {
            return printStatement();
        }

        if (match("LEFT_BRACE")) {
            return blockStatement();
        }

        if (match("if")) {
            return ifStatement();
        }

        if (match("for")) {
            return forStatement();
        }

        if (match("while")) {
            return whileStatement();
        }

        return exprStatement();
    };

    const blockStatement = () => {
        let declarationsInBlock = [];

        while (!match("RIGHT_BRACE") && current < tokens.length) {
            let decl = declaration();
            declarationsInBlock.push(decl);
        }

        return new Block(declarationsInBlock);
    };

    const printStatement = () => {
        let expr = expression();
        consume("SEMICOLON", "Expect ';' after value.");
        return new Print(expr);
    };

    const ifStatement = () => {
        consume("LEFT_PAREN", "NO left paren found");

        const conditional = expression();
        consume("RIGHT_PAREN", "NO right paren found");
        consume("LEFT_BRACE", "expecting body of conditional");

        const thenBranch = blockStatement();

        let elseBranch = null;

        if (match("else")) {
            elseBranch = blockStatement();
        }

        return new If(conditional, thenBranch, elseBranch);
    };

    const forStatement = () => {
        consume("LEFT_PAREN", "NO left paren found");

        const initializer = declaration();
        const conditional = exprStatement();
        const iterator = expression();

        consume("LEFT_BRACE", "expected block after for loop construct");

        const block = blockStatement();

        return new For(initializer, conditional, iterator, block);
    };

    const whileStatement = () => {
        consume("LEFT_PAREN", "NO left paren found");

        const conditional = expression();

        consume("LEFT_BRACE", "expected block after for loop construct");
        const block = blockStatement();

        return new While(conditional, block);
    };

    const exprStatement = () => {
        let expr = expression();

        consume("SEMICOLON", "Expect ';' after value.");
        throwAfter5();
        return new Expression(expr);
    };

    const expression = () => assignment();

    const assignment = () => {
        const eq = equality();

        if (match("EQUAL")) {
            const right = assignment();

            if (eq instanceof VarExpr) {
                return new Assign(eq.identifier, right);
            }

            throw new Error("left side of assignment not valid");
        }

        return eq;
    };

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

        while (match(["LESS", "LESS_EQUAL", "GREATER", "GREATER_EQUAL"])) {
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
        if (match(["false"])) return new Literal(false);
        if (match(["true"])) return new Literal(true);
        if (match(["NIL"])) return new Literal(null);

        if (match(["NUMBER", "STRING"])) {
            return new Literal(tokens[current - 1].literal);
        }

        if (match("LEFT_PAREN")) {
            const expr = expression();
            consume("RIGHT_PAREN", "Expect ')' after expression.");
            return new Grouping(expr);
        }

        if (match("IDENTIFIER")) {
            return new VarExpr(tokens[current - 1]);
        }
    };

    const declarations = [];

    while (current < tokens.length) {
        declarations.push(declaration());
    }

    return declarations;
};

module.exports = parse;
