const { Expr, Binary, Grouping, Literal, Unary } = require("./ast-types");

const evaluate = ast => {
  if (ast instanceof Literal) {
    return ast.value;
  }

  if (ast instanceof Unary) {
    const operatorMap = {
      MINUS: a => -1 * a,
      BANG: a => !Boolean(a)
    };

    return operatorMap[ast.operator.type](evaluate(ast.right));
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
      evaluate(ast.left),
      evaluate(ast.right)
    );
  }
};

module.exports = evaluate;
