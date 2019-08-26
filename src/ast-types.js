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

class VarExpr extends Expr {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }
}

class Assign extends Expr {
    constructor(name, value) {
        super();
        this.name = name;
        this.value = value;
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

class Block extends Stmt {
    constructor(declarations) {
        super();
        this.declarations = declarations;
    }
}

class If extends Stmt {
    constructor(condition, thenBranch, elseBranch) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

class For extends Stmt {
    constructor(initializer, conditional, iterator, block) {
        super();
        this.initializer = initializer;
        this.conditional = conditional;
        this.iterator = iterator;
        this.block = block;
    }
}

class While extends Stmt {
    constructor(conditional, declarations) {
        super();
        this.conditional = conditional;
        this.declarations = declarations;
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
    VarDecl,
    VarExpr,
    Block,
    Assign,
    If,
    For,
    While
};
