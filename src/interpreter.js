const fs = require("fs");
const prompt = require("prompt");

const lex = require("./lexer");
const parse = require("./parser");
const evaluate = require("./evaluator");

const runFile = filePath => {
    fs.readFile(filePath, (err, data) => {
        run(data.toString());
    });
};

const runPrompt = () => {
    prompt.start();
    prompt.get(["code"], function(err, { code }) {
        const tokens = lex(code);
        const statements = parse(tokens);

        //console.log(statements);

        evaluate(statements);
        runPrompt();
    });
};

const run = source => {
    const tokens = lex(source);
    const statements = parse(tokens);

    //console.log(statements);

    evaluate(statements);
};

const main = filePath => {
    if (filePath) {
        runFile(filePath);
    } else {
        runPrompt();
    }
};

main(process.argv[2]);
