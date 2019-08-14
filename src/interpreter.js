const fs = require("fs");
const prompt = require("prompt");

const lex = require("./lexer");
const parse = require("./parser");

const runFile = filePath => {
    fs.read(filePath, (err, data) => {
        run(data);
    });
};

const runPrompt = () => {
    prompt.start();
    prompt.get(["code"], function(err, { code }) {
        const tokens = lex(code);
        console.log(parse(tokens));
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
