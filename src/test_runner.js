const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const compiler = require("./compiler.js"); // Make sure to export compileCtoJS in compiler.js

// ANSI color codes for prettier console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

// Expected outputs for each test case
const expectedOutputs = {
    "hello.c": "Sum of 10 and 20 is 30\n",
    "if_else.c": "Number is positive\n",
    "while_loop.c": "i = 0\ni = 1\ni = 2\ni = 3\ni = 4\n",
    "for_loop.c": "i = 0\ni = 1\ni = 2\ni = 3\ni = 4\n",
    "functions.c": "Result is 12\n",
    "logical.c": "Both conditions are true\n",
    "comments.c": "Comments should be preserved in the output\n",
};

// Helper function to show string with visible whitespace
function visualizeString(str) {
    return str.replace(/\n/g, "↵\n").replace(/\s/g, "·");
}

async function runTests() {
    console.log(
        `${colors.bright}C to JavaScript Compiler Test Runner${colors.reset}\n`
    );

    const testDir = path.join(__dirname, "..", "test_cases");
    const outputDir = path.join(__dirname, "..", "output");

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Get all .c files from test directory
    const testFiles = fs
        .readdirSync(testDir)
        .filter((file) => file.endsWith(".c"));

    let passedTests = 0;
    let totalTests = testFiles.length;

    for (const testFile of testFiles) {
        console.log(`${colors.bright}Testing ${testFile}:${colors.reset}`);

        try {
            // Read C source file
            const cCode = fs.readFileSync(path.join(testDir, testFile), "utf8");

            // Compile to JavaScript
            const jsCode = compiler.compileCtoJS(cCode);

            // Write JavaScript output
            const jsFile = path.join(outputDir, testFile.replace(".c", ".js"));
            fs.writeFileSync(jsFile, jsCode);

            console.log(`${colors.blue}⚙ Compiled${colors.reset} ${testFile}`);

            // Run the JavaScript file and capture output
            let output;
            try {
                output = execSync(`node "${jsFile}"`, { encoding: "utf8" });

                // Compare with expected output
                if (output === expectedOutputs[testFile]) {
                    console.log(
                        `${colors.green}✅ Output matches expected${colors.reset}`
                    );
                    passedTests++;
                } else {
                    console.log(
                        `${colors.red}❌ Output mismatch${colors.reset}`
                    );
                    console.log(
                        `${colors.yellow}Expected (${expectedOutputs[testFile].length} chars):${colors.reset}`
                    );
                    console.log(visualizeString(expectedOutputs[testFile]));
                    console.log(
                        `${colors.yellow}Got (${output.length} chars):${colors.reset}`
                    );
                    console.log(visualizeString(output));

                    // Show exact character codes for debugging
                    console.log("\nCharacter codes:");
                    console.log(
                        "Expected:",
                        [...expectedOutputs[testFile]].map((c) =>
                            c.charCodeAt(0)
                        )
                    );
                    console.log(
                        "Got:     ",
                        [...output].map((c) => c.charCodeAt(0))
                    );
                }
            } catch (runError) {
                console.log(
                    `${colors.red}❌ Runtime error:${colors.reset}`,
                    runError.message
                );
            }
        } catch (error) {
            console.log(
                `${colors.red}❌ Compilation error:${colors.reset}`,
                error.message
            );
        }

        console.log(); // Empty line between tests
    }

    // Print summary
    console.log(`${colors.bright}Test Summary:${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
    console.log(
        `${colors.red}❌ Failed: ${totalTests - passedTests}${colors.reset}`
    );
    console.log(`${colors.blue}📊 Total: ${totalTests}${colors.reset}`);
}

// Run the tests
runTests().catch(console.error);
