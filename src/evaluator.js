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
    Assign
} = require("./ast-types");

class Env {
    constructor(initEnvChain = [{}]) {
        this.envChain = initEnvChain;
    }

    nextEnv() {
        return new Env(this.envChain.concat({}));
    }

    get(key) {
        for (let i = this.envChain.length; i >= 0; i--) {
            const val = this.envChain[key];
            if (val) {
                return val;
            }
        }

        return;
    }
}

const execute = (ast, env) => {
    if (ast instanceof Print) {
        console.log(execute(ast.expr, env));
        return null;
    }

    if (ast instanceof Expression) {
        execute(ast.expr, env);
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

        return operatorMap[ast.operator.type](execute(ast.right, env));
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
            execute(ast.left, env),
            execute(ast.right, env)
        );
    }

    if (ast instanceof VarDecl) {
        if (ast.initializer) {
            env[ast.name.lexeme] = execute(ast.initializer, env);
        } else {
            env[ast.name.lexeme] = "nil";
        }

        return null;
    }

    if (ast instanceof VarExpr) {
        const value = env[ast.identifier.lexeme];
        if (value !== undefined) {
            return value;
        }
        throw new Error("Accessed undeclared variable");
    }

    if (ast instanceof Assign) {
        const lexeme = ast.name.lexeme;
        if (env[lexeme]) {
            env[lexeme] = execute(ast.value, env);
            return;
        }

        throw new Error(`Tried to assign to undeclared variable ${lexeme}`);
    }

    if (ast instanceof Block) {
        const subEnv = env.nextEnv();

        ast.declarations.forEach(d => execute(d, subEnv));
    }
};

const globalEnv = new Env();
const evaluate = statements => statements.forEach(s => execute(s, globalEnv));

module.exports = evaluate;
