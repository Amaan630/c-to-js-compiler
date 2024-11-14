function compileCtoJS(cCode) {
    const lines = cCode.split("\n");
    let jsCode = "";
    let indentLevel = 0;

    const increaseIndent = () => {
        indentLevel++;
    };
    const decreaseIndent = () => {
        if (indentLevel > 0) indentLevel--;
    };
    const getIndent = () => "    ".repeat(indentLevel);

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines and includes
        if (line === "" || line.startsWith("#include")) {
            continue;
        }

        // Handle main function
        if (/int\s+main\s*\(\s*(void)?\s*\)/.test(line)) {
            jsCode += getIndent() + "function main() {\n";
            increaseIndent();
            continue;
        }

        // Handle function declarations
        if (/^\w+\s+\w+\s*\(.*\)/.test(line)) {
            // Don't add the { here since it will be on the next line
            line = line.replace(
                /^(\w+)\s+(\w+)\s*\((.*)\)/,
                (match, returnType, funcName, params) => {
                    let cleanParams = params
                        .split(",")
                        .map((param) => param.trim())
                        .map((param) => param.split(" ").pop())
                        .join(", ");
                    return `function ${funcName}(${cleanParams})`;
                }
            );
            jsCode += getIndent() + line + "\n"; // Just add newline, no brace
            continue;
        }

        // Handle opening brace (as a separate case)
        if (line === "{") {
            jsCode += getIndent() + "{\n";
            increaseIndent();
            continue;
        }

        // Handle variable declarations with initialization
        if (/^(int|float|double|char)\s+\w+\s*=/.test(line)) {
            line = line.replace(
                /^(int|float|double|char)\s+(\w+\s*=.*)/,
                "let $2"
            );
            jsCode += getIndent() + line + "\n";
            continue;
        }

        // Handle variable declarations without initialization
        if (/^(int|float|double|char)\s+\w+;/.test(line)) {
            line = line.replace(/^(int|float|double|char)\s+(\w+);/, "let $2;");
            jsCode += getIndent() + line + "\n";
            continue;
        }

        // Handle printf statements
        if (/printf\s*\(/.test(line)) {
            let match = line.match(/printf\s*\("([^"]*)"\s*(,\s*(.+))?\)/);
            if (match) {
                let [_, formatStr, , args] = match;
                let argList = args
                    ? args.split(",").map((arg) => arg.trim())
                    : [];

                let count = 0;
                formatStr = formatStr.replace(
                    /%[dfcs]/g,
                    () => "${" + argList[count++] + "}"
                );
                formatStr = formatStr.replace(/\\n$/, "");

                line = `console.log(\`${formatStr}\`);`;
            }
            jsCode += getIndent() + line + "\n";
            continue;
        }

        // Handle closing brace
        if (line === "}") {
            decreaseIndent();
            jsCode += getIndent() + "}\n";
            continue;
        }

        // Handle other statements
        if (line.endsWith(";")) {
            jsCode += getIndent() + line + "\n";
            continue;
        }

        // Copy remaining lines
        jsCode += getIndent() + line + "\n";
    }

    // Add main function call if not present
    if (!jsCode.includes("main();")) {
        jsCode += "\nmain();";
    }

    return jsCode;
}

module.exports = { compileCtoJS };
