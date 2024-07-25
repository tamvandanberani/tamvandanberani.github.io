// script.js
const boxes = document.querySelectorAll('.number-box');
const shuffleButton = document.getElementById('shuffle-button');
const checkButton = document.getElementById('check-button');
const proveButton = document.getElementById('prove-button');
const solutionContainer = document.getElementById('solution-container');
const proofContainer = document.getElementById('proof-container');
const userInput = document.getElementById('user-input');

function shuffleNumbers() {
    // Add shake class to start animation
    boxes.forEach(box => box.classList.add('shake'));

    // After animation ends, remove shake class and update numbers
    setTimeout(() => {
        let numbers = generateNumbers();
        boxes.forEach((box, index) => {
            box.textContent = numbers[index];
        });

        // Remove shake class to reset
        boxes.forEach(box => box.classList.remove('shake'));

        // Clear previous solutions
        solutionContainer.textContent = '';
        proofContainer.textContent = '';
    }, 1000); // Duration should match CSS animation duration
}

function generateNumbers() {
    const min = 1;
    const max = 9;
    const numbers = [];
    for (let i = 0; i < 4; i++) {
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.push(num);
    }
    return numbers;
}

function checkSolution() {
    const numbers = Array.from(boxes).map(box => parseInt(box.textContent));
    const solutions = findSolutions(numbers, 24);

    if (solutions.length === 0) {
        solutionContainer.innerHTML = 'Tidak ada solusi yang ditemukan.';
    } else {
        // Limit solutions to maximum of 5
        const limitedSolutions = solutions.slice(0, 5);
        solutionContainer.innerHTML = limitedSolutions
            .map(sol => `<div>${sol.expression}</div>`)
            .join('<br>');
    }
}

function findSolutions(numbers, target) {
    const results = [];
    const operators = ['+', '-', '*', '/'];

    function helper(current, remaining) {
        if (remaining.length === 0) {
            try {
                if (Math.abs(eval(current) - target) < 1e-6) {
                    results.push({ expression: current, usedOperators: getOperators(current) });
                }
            } catch (e) {
                // Ignore invalid expressions
            }
            return;
        }

        for (let i = 0; i < remaining.length; i++) {
            const next = remaining.slice();
            next.splice(i, 1);
            for (const op of operators) {
                helper(`${current}${op}${remaining[i]}`, next);
                helper(`(${current})${op}${remaining[i]}`, next);
            }
        }
    }

    function getOperators(expression) {
        const operatorCount = { '+': 0, '-': 0, '*': 0, '/': 0 };
        for (const char of expression) {
            if (operatorCount[char] !== undefined) {
                operatorCount[char]++;
            }
        }
        return operatorCount;
    }

    for (let i = 0; i < numbers.length; i++) {
        const remaining = numbers.slice();
        remaining.splice(i, 1);
        helper(`${numbers[i]}`, remaining);
    }

    results.sort((a, b) => {
        const aOps = Object.values(a.usedOperators).reduce((sum, count) => sum + count, 0);
        const bOps = Object.values(b.usedOperators).reduce((sum, count) => sum + count, 0);
        return aOps - bOps;
    });

    return results;
}

function proveSolution() {
    const numbers = Array.from(boxes).map(box => parseInt(box.textContent));
    const expression = userInput.value.trim();
    
    try {
        // Check if the expression evaluates to 24
        if (Math.abs(eval(expression) - 24) < 1e-6) {
            // Check if the expression uses only the numbers displayed
            const usedNumbers = expression.match(/\d+/g).map(Number);
            const numbersCopy = [...numbers];
            let valid = true;

            for (const num of usedNumbers) {
                const index = numbersCopy.indexOf(num);
                if (index === -1) {
                    valid = false;
                    break;
                } else {
                    numbersCopy.splice(index, 1);
                }
            }

            if (valid && numbersCopy.length === 0) {
                proofContainer.textContent = 'Solusi benar!';
            } else {
                proofContainer.textContent = 'Solusi salah atau menggunakan angka yang tidak ditampilkan.';
            }
        } else {
            proofContainer.textContent = 'Solusi salah, hasil evaluasi bukan 24.';
        }
    } catch (e) {
        proofContainer.textContent = 'Ekspresi tidak valid.';
    }
}

shuffleButton.addEventListener('click', shuffleNumbers);
checkButton.addEventListener('click', checkSolution);
proveButton.addEventListener('click', proveSolution);

// Initial shuffle
shuffleNumbers();
