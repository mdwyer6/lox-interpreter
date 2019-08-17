const {
    Expr,
    Binary,
    Grouping,
    Literal,
    Unary,
    Print,
    Expression
} = require("./ast-types");

const execute = ast => {
    if (ast instanceof Print) {
        console.log(execute(ast.expr));
        return null;
    }

    if (ast instanceof Expression) {
        execute(ast.expr);
        return null;
    }

    if (ast instanceof Literal) {
        return ast.value;
    }

    if (ast instanceof Unary) {
        const operatorMap = {
            MINUS: a => -1 * a,
            BANG: a => !Boolean(a)
        };

        return operatorMap[ast.operator.type](execute(ast.right));
    }

    if (ast instanceof Binary) {
        const operatorMap = {
            PLUS: (a, b) => a + b,
            MINUS: (a, b) => a - b,
            STAR: (a, b) => a * b,
            SLASH: (a, b) => a / b,
            AND: (a, b) => Boolean(a) && Boolean(b),
            OR: (a, b) => Boolean(a) || Boolean(b)
        };

        return operatorMap[ast.operator.type](
            execute(ast.left),
            execute(ast.right)
        );
    }
};

const evaluate = statements => statements.forEach(execute);

module.exports = evaluate;
