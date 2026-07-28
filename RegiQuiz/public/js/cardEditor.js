const LANGUAGE_HELP = {
    java: 'Must be a complete Java program with a class named Main.',
    python: 'Must be a runnable Python script — no special function or class required.',
    javascript: 'Must be a runnable JavaScript (Node.js) script — no special function or class required.',
    c: 'Must be a complete C program with a main() function.',
    cpp: 'Must be a complete C++ program with a main() function.',
    csharp: 'Must be a complete C# program with a class containing a Main method.',
    html: 'Plain HTML markup — no boilerplate needed. Not compiled or run; checked by comparing text directly.'
};

function cardRowTemplate() {
    return `
      <div class="card-row card p-3 mb-3">
        <div class="mb-2">
            <label class="form-label">Card Type</label>
            <select class="form-select cardType">
                <option value="term_definition">Term &amp; Definition</option>
                <option value="math">Math</option>
                <option value="code">Code</option>
            </select>
        </div>

        <div class="fields-termdef">
            <div class="mb-2">
                <label class="form-label">Term</label>
                <input type="text" class="form-control termInput">
            </div>
            <div class="mb-2">
                <label class="form-label">Definition</label>
                <input type="text" class="form-control definitionInput">
            </div>
        </div>

        <div class="fields-math d-none">
            <div class="mb-2">
                <label class="form-label">Question</label>
                <input type="text" class="form-control mathQuestion" placeholder="e.g. 5 + 7 * 2 = ___">
            </div>
            <div class="mb-2">
                <label class="form-label">Correct Answer (expressions allowed, e.g. 3 * (4 + 2))</label>
                <input type="text" class="form-control mathAnswer">
            </div>
        </div>

        <div class="fields-code d-none">
            <div class="mb-2">
                <label class="form-label">Question / Prompt</label>
                <textarea class="form-control codeQuestion"></textarea>
            </div>
            <div class="mb-2">
                <label class="form-label">Language</label>
                <select class="form-select codeLanguage">
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Code Template</label>
                <div class="form-text codeLanguageHelp"></div>
                <div class="form-text">Must contain the blank marker <code>___BLANK___</code> at least once.</div>
                <textarea class="form-control codeTemplate font-monospace" rows="8"></textarea>
            </div>
            <div class="mb-2">
                <label class="form-label">Correct Fill-In</label>
                <input type="text" class="form-control codeFill">
            </div>
        </div>

        <button type="button" class="btn btn-outline-danger btn-sm removeCardBtn">
            Remove Card
        </button>
      </div>
    `;
}

function wireCardRow(row) {
    let typeSelect = row.querySelector(".cardType");
    let termdefFields = row.querySelector(".fields-termdef");
    let mathFields = row.querySelector(".fields-math");
    let codeFields = row.querySelector(".fields-code");

    typeSelect.addEventListener("change", function() {
        termdefFields.classList.add("d-none");
        mathFields.classList.add("d-none");
        codeFields.classList.add("d-none");

        if (typeSelect.value === "term_definition") termdefFields.classList.remove("d-none");
        if (typeSelect.value === "math") mathFields.classList.remove("d-none");
        if (typeSelect.value === "code") codeFields.classList.remove("d-none");
    });

    let languageSelect = row.querySelector(".codeLanguage");
    let languageHelp = row.querySelector(".codeLanguageHelp");
    function updateLanguageHelp() {
        languageHelp.textContent = LANGUAGE_HELP[languageSelect.value] || LANGUAGE_HELP.java;
    }
    languageSelect.addEventListener("change", updateLanguageHelp);
    updateLanguageHelp();

    row.querySelector(".removeCardBtn").addEventListener("click", function() {
        row.remove();
    });
}

// Appends a new card row to container. If existingCard is given, pre-fills
// the row's fields from it (used by editset.html to load a set's cards).
function addCardRow(container, existingCard) {
    container.insertAdjacentHTML("beforeend", cardRowTemplate());
    let row = container.lastElementChild;
    wireCardRow(row);

    if (existingCard) {
        let typeSelect = row.querySelector(".cardType");
        typeSelect.value = existingCard.type;
        typeSelect.dispatchEvent(new Event("change"));

        if (existingCard.type === "term_definition") {
            row.querySelector(".termInput").value = existingCard.term || "";
            row.querySelector(".definitionInput").value = existingCard.definition || "";
        } else if (existingCard.type === "math") {
            row.querySelector(".mathQuestion").value = existingCard.question || "";
            row.querySelector(".mathAnswer").value = existingCard.correctAnswerExpr || "";
        } else if (existingCard.type === "code") {
            row.querySelector(".codeQuestion").value = existingCard.question || "";
            row.querySelector(".codeTemplate").value = existingCard.codeTemplate || "";
            row.querySelector(".codeFill").value = existingCard.correctFill || "";
            row.querySelector(".codeLanguage").value = existingCard.language || "java";
            row.querySelector(".codeLanguage").dispatchEvent(new Event("change"));
        }
    }

    return row;
}

// Reads every .card-row inside container back into a plain-object cards array.
function collectCards(container) {
    return [...container.querySelectorAll(".card-row")].map(function(row) {
        let type = row.querySelector(".cardType").value;

        if (type === "term_definition") {
            return {
                type,
                term: row.querySelector(".termInput").value,
                definition: row.querySelector(".definitionInput").value
            };
        }

        if (type === "math") {
            return {
                type,
                question: row.querySelector(".mathQuestion").value,
                correctAnswerExpr: row.querySelector(".mathAnswer").value
            };
        }

        return {
            type,
            question: row.querySelector(".codeQuestion").value,
            codeTemplate: row.querySelector(".codeTemplate").value,
            correctFill: row.querySelector(".codeFill").value,
            language: row.querySelector(".codeLanguage").value
        };
    });
}
