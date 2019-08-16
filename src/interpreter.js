const fs = require("fs");
const prompt = require("prompt");

const lex = require("./lexer");
const parse = require("./parser");
const evaluate = require("./evaluator");

const runFile = filePath => {
    fs.read(filePath, (err, data) => {
        run(data);
    });
};

const runPrompt = () => {
    prompt.start();
    prompt.get(["code"], function(err, { code }) {
        const tokens = lex(code);
        const ast = parse(tokens);

        console.log(evaluate(ast));
        runPrompt();
    });
};

const run = source => {};

const main = filePath => {
    if (filePath) {
        runFile(filePath);
    } else {
        runPrompt();
    }
};

main();
