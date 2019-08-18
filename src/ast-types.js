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

class Declaration {}

class Stmt {}

class Print extends Stmt {
    constructor(expr) {
        super();
        this.expr = expr;
    }
}

class Expression extends Stmt {
    constructor(expr) {
        super();
        this.expr = expr;
    }
}

class VarDecl extends Declaration {
    constructor(name, initializer) {
        super();
        this.name = name;
        this.initializer = initializer;
    }
}

module.exports = {
    Expr,
    Binary,
    Grouping,
    Literal,
    Unary,
    Stmt,
    Print,
    Expression,
    VarDecl
};
