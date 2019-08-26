const {
    Expr,
    Binary,
    Grouping,
    Literal,
    Unary,
    Print,
    Expression,
    VarDecl,
    VarExpr,
    Block,
    Assign,
    If,
    For,
    While
} = require("./ast-types");

class Env {
    constructor(initEnvChain = [{}]) {
        this.envChain = initEnvChain;
    }

    nextEnv() {
        return new Env(this.envChain.concat({}));
    }

    get(key) {
        for (let i = this.envChain.length - 1; i >= 0; i--) {
            const val = this.envChain[i][key];
            if (val !== undefined) {
                return val;
            }
        }

        return;
    }

    set(key, val) {
        this.envChain[this.envChain.length - 1][key] = val;
    }
}

const execute = (ast, env) => {
    if (ast instanceof Print) {
        console.log(execute(ast.expr, env));
        return null;
    }

    if (ast instanceof Expression) {
        return execute(ast.expr, env);
    }

    if (ast instanceof Literal) {
        return ast.value;
    }

    if (ast instanceof Unary) {
        const operatorMap = {
            MINUS: a => -1 * a,
            BANG: a => !Boolean(a)
        };

        return operatorMap[ast.operator.type](execute(ast.right, env));
    }

    if (ast instanceof Binary) {
        const operatorMap = {
            PLUS: (a, b) => a + b,
            MINUS: (a, b) => a - b,
            STAR: (a, b) => a * b,
            SLASH: (a, b) => a / b,
            AND: (a, b) => Boolean(a) && Boolean(b),
            OR: (a, b) => Boolean(a) || Boolean(b),
            LESS: (a, b) => a < b,
            LESS_EQUAL: (a, b) => a <= b,
            GREATER: (a, b) => a > b,
            GREATER_EQUAL: (a, b) => a >= b
        };

        return operatorMap[ast.operator.type](
            execute(ast.left, env),
            execute(ast.right, env)
        );
    }

    if (ast instanceof VarDecl) {
        if (ast.initializer) {
            env.set(ast.name.lexeme, execute(ast.initializer, env));
        } else {
            env.set(ast.name.lexeme, "nil");
        }

        return null;
    }

    if (ast instanceof VarExpr) {
        const value = env.get(ast.identifier.lexeme);
        if (value !== undefined) {
            return value;
        }

        throw new Error("Accessed undeclared variable");
    }

    if (ast instanceof Assign) {
        const lexeme = ast.name.lexeme;

        if (env.get(lexeme) !== undefined) {
            env.set(lexeme, execute(ast.value, env));
            return;
        }

        throw new Error(`Tried to assign to undeclared variable ${lexeme}`);
    }

    if (ast instanceof Block) {
        const subEnv = env.nextEnv();

        ast.declarations.forEach(d => execute(d, subEnv));
    }

    if (ast instanceof If) {
        if (execute(ast.condition, env)) {
            execute(ast.thenBranch, env);
        } else {
            execute(ast.elseBranch, env);
        }
    }

    if (ast instanceof For) {
        execute(ast.initializer, env);

        while (execute(ast.conditional, env)) {
            execute(ast.block, env);
            execute(ast.iterator, env);
        }
    }

    if (ast instanceof While) {
        const bodyScope = env.nextEnv();
        while (execute(ast.conditional, bodyScope)) {
            ast.declarations.forEach(d => execute(d, bodyScope));
        }
    }
};

const globalEnv = new Env();
const evaluate = statements => statements.forEach(s => execute(s, globalEnv));

module.exports = evaluate;
