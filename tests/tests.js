const assert = require("assert");

const lex = require("../src/lexer");
const parse = require("../src/parser");

describe("Lexer", function() {
  it("sanity check", function() {
    const tokens = lex('var hey = "hello"');
    console.log(tokens);
  });
});

describe("Parser", function() {
  it("this kinda works", function() {
    const ast = parse();
  });
});
