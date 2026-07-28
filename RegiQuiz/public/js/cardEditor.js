const LANGUAGE_HELP = {
    java: 'Must be a complete Java program with a class named Main.',
    python: 'Must be a runnable Python script — no special function or class required.',
    javascript: 'Must be a runnable JavaScript (Node.js) script — no special function or class required.',
    c: 'Must be a complete C program with a main() function.',
    cpp: 'Must be a complete C++ program with a main() function.',
    csharp: 'Must be a complete C# program with a class containing a Main method.',
    html: 'Plain HTML markup — no boilerplate needed. Not compiled or run; checked by comparing text directly.'
};

// Current { name, mode } list for the set being edited, kept in sync by
// initGroupUi. Card rows read this to populate their own Group dropdown.
let knownGroups = [];

// Rebuilds a single card row's Group dropdown from knownGroups, keeping
// selectedName selected if it's still a real group (falls back to "No Group").
function populateGroupSelect(select, selectedName) {
    let stillValid = knownGroups.some(function(g) { return g.name === selectedName; });
    select.innerHTML = '<option value="">No Group</option>' + knownGroups.map(function(g) {
        return `<option value="${g.name}">${g.name}</option>`;
    }).join('');
    select.value = stillValid ? selectedName : "";
}

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

        <div class="mb-2">
            <label class="form-label">Group (optional)</label>
            <select class="form-select groupSelect">
                <option value="">No Group</option>
            </select>
        </div>

        <div class="fields-termdef">
            <div class="mb-2">
                <label class="form-label">Term</label>
                <input type="text" class="form-control termInput">
                <input type="hidden" class="termImageUrl">
                <img class="termImagePreview img-thumbnail mt-2 d-none" style="max-height:120px" alt="Term image">
                <div class="d-flex align-items-center gap-2 mt-1">
                    <input type="file" accept="image/*" class="form-control form-control-sm termImageInput" style="max-width:220px">
                    <button type="button" class="btn btn-outline-danger btn-sm termRemoveImageBtn d-none">Remove Image</button>
                </div>
                <div class="form-text termImageStatus"></div>
            </div>
            <div class="mb-2">
                <label class="form-label">Definition</label>
                <input type="text" class="form-control definitionInput">
                <input type="hidden" class="definitionImageUrl">
                <img class="definitionImagePreview img-thumbnail mt-2 d-none" style="max-height:120px" alt="Definition image">
                <div class="d-flex align-items-center gap-2 mt-1">
                    <input type="file" accept="image/*" class="form-control form-control-sm definitionImageInput" style="max-width:220px">
                    <button type="button" class="btn btn-outline-danger btn-sm definitionRemoveImageBtn d-none">Remove Image</button>
                </div>
                <div class="form-text definitionImageStatus"></div>
            </div>
            <div class="mb-2">
                <label class="form-label">Show first in Study Mode</label>
                <select class="form-select frontSideSelect">
                    <option value="term" selected>Term</option>
                    <option value="definition">Definition</option>
                </select>
            </div>
            <div class="mb-2">
                <button type="button" class="btn btn-outline-secondary btn-sm swapTermDefBtn">Swap Term &harr; Definition</button>
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

// Wires a term or definition image slot (prefix "term" or "definition"):
// uploads the picked file immediately via /upload/card-image, shows a
// thumbnail preview, and supports clearing it. Returns the hidden url input
// and a showPreview helper so callers (prefill, swap) can drive it directly.
function wireImageUpload(row, prefix) {
    let fileInput = row.querySelector("." + prefix + "ImageInput");
    let urlInput = row.querySelector("." + prefix + "ImageUrl");
    let preview = row.querySelector("." + prefix + "ImagePreview");
    let removeBtn = row.querySelector("." + prefix + "RemoveImageBtn");
    let status = row.querySelector("." + prefix + "ImageStatus");

    function showPreview(url) {
        if (url) {
            preview.src = url;
            preview.classList.remove("d-none");
            removeBtn.classList.remove("d-none");
        } else {
            preview.src = "";
            preview.classList.add("d-none");
            removeBtn.classList.add("d-none");
        }
    }

    fileInput.addEventListener("change", async function() {
        let file = fileInput.files[0];
        if (!file) return;

        status.textContent = "Uploading...";

        let formData = new FormData();
        formData.append("image", file);

        let response = await fetch("/upload/card-image", { method: "POST", body: formData });
        let data = await response.json();

        if (response.ok) {
            urlInput.value = data.url;
            showPreview(data.url);
            status.textContent = "";
        } else {
            status.textContent = data.msg || "Upload failed.";
        }
        fileInput.value = "";
    });

    removeBtn.addEventListener("click", function() {
        urlInput.value = "";
        showPreview(null);
    });

    return { urlInput, showPreview };
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

    populateGroupSelect(row.querySelector(".groupSelect"), "");

    let termImageCtl = wireImageUpload(row, "term");
    let definitionImageCtl = wireImageUpload(row, "definition");

    // Swaps term <-> definition text and images together, so an image never
    // gets separated from the text it belongs with. Independent of the
    // "Show first in Study Mode" setting, which only affects display order.
    row.querySelector(".swapTermDefBtn").addEventListener("click", function() {
        let termInput = row.querySelector(".termInput");
        let definitionInput = row.querySelector(".definitionInput");
        let termText = termInput.value;
        termInput.value = definitionInput.value;
        definitionInput.value = termText;

        let termImageUrl = termImageCtl.urlInput.value;
        let definitionImageUrl = definitionImageCtl.urlInput.value;
        termImageCtl.urlInput.value = definitionImageUrl;
        termImageCtl.showPreview(definitionImageUrl);
        definitionImageCtl.urlInput.value = termImageUrl;
        definitionImageCtl.showPreview(termImageUrl);
    });

    row.querySelector(".removeCardBtn").addEventListener("click", function() {
        row.remove();
    });

    return { termImageCtl, definitionImageCtl };
}

// Appends a new card row to container. If existingCard is given, pre-fills
// the row's fields from it (used by editset.html to load a set's cards).
function addCardRow(container, existingCard) {
    container.insertAdjacentHTML("beforeend", cardRowTemplate());
    let row = container.lastElementChild;
    let imageCtls = wireCardRow(row);

    if (existingCard) {
        let typeSelect = row.querySelector(".cardType");
        typeSelect.value = existingCard.type;
        typeSelect.dispatchEvent(new Event("change"));

        populateGroupSelect(row.querySelector(".groupSelect"), existingCard.group || "");

        if (existingCard.type === "term_definition") {
            row.querySelector(".termInput").value = existingCard.term || "";
            row.querySelector(".definitionInput").value = existingCard.definition || "";
            row.querySelector(".frontSideSelect").value = existingCard.frontSide || "term";
            imageCtls.termImageCtl.urlInput.value = existingCard.termImage || "";
            imageCtls.termImageCtl.showPreview(existingCard.termImage || null);
            imageCtls.definitionImageCtl.urlInput.value = existingCard.definitionImage || "";
            imageCtls.definitionImageCtl.showPreview(existingCard.definitionImage || null);
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
        let group = row.querySelector(".groupSelect").value;

        if (type === "term_definition") {
            return {
                type,
                group,
                term: row.querySelector(".termInput").value,
                definition: row.querySelector(".definitionInput").value,
                frontSide: row.querySelector(".frontSideSelect").value,
                termImage: row.querySelector(".termImageUrl").value,
                definitionImage: row.querySelector(".definitionImageUrl").value
            };
        }

        if (type === "math") {
            return {
                type,
                group,
                question: row.querySelector(".mathQuestion").value,
                correctAnswerExpr: row.querySelector(".mathAnswer").value
            };
        }

        return {
            type,
            group,
            question: row.querySelector(".codeQuestion").value,
            codeTemplate: row.querySelector(".codeTemplate").value,
            correctFill: row.querySelector(".codeFill").value,
            language: row.querySelector(".codeLanguage").value
        };
    });
}

// ---- Import Cards from Text ----
// Lets the user paste a block of term/definition pairs (e.g. a Quizlet
// export) instead of adding cards one at a time. Defaults match Quizlet's
// own "Export" format: a tab between term and definition, a new line
// between cards.

const IMPORT_SEP_PRESETS = {
    tab: "\t",
    newline: "\n"
};

function resolveImportSeparator(select, customInput) {
    if (select.value === "custom") return customInput.value;
    return IMPORT_SEP_PRESETS[select.value] !== undefined ? IMPORT_SEP_PRESETS[select.value] : select.value;
}

function importUiTemplate() {
    return `
      <div class="card p-3 mb-3 bg-body-tertiary">
        <h6 class="mb-2">Import Cards from Text</h6>
        <p class="form-text mt-0 mb-2">
            Paste term/definition pairs below to add several Term &amp; Definition cards at once.
            Works great with Quizlet's own export (open a set &rarr; &#8942; menu &rarr; Export &rarr; Copy text &rarr; paste here) &mdash; the defaults below already match it.
        </p>
        <div class="row g-2 mb-2">
            <div class="col-6 col-sm-4">
                <label class="form-label small mb-1">Between term &amp; definition</label>
                <select class="form-select form-select-sm" id="importTermDefSep">
                    <option value="tab" selected>Tab</option>
                    <option value=",">Comma (,)</option>
                    <option value="-">Dash (-)</option>
                    <option value=":">Colon (:)</option>
                    <option value="custom">Custom...</option>
                </select>
                <input type="text" class="form-control form-control-sm mt-1 d-none" id="importTermDefCustom" placeholder="custom separator">
            </div>
            <div class="col-6 col-sm-4">
                <label class="form-label small mb-1">Between cards</label>
                <select class="form-select form-select-sm" id="importCardSep">
                    <option value="newline" selected>New line</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="custom">Custom...</option>
                </select>
                <input type="text" class="form-control form-control-sm mt-1 d-none" id="importCardCustom" placeholder="custom separator">
            </div>
        </div>
        <textarea class="form-control mb-2" id="importTextarea" rows="6" placeholder="term[TAB]definition, one pair per line"></textarea>
        <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-outline-primary btn-sm" id="importTextBtn">Import Cards</button>
            <span class="form-text mb-0" id="importStatus"></span>
        </div>
      </div>
    `;
}

// Splits raw import text into {term, definition} pairs. Cards are separated
// by cardSep, and within each card the first occurrence of termDefSep splits
// term from definition. Blank or unparseable chunks are skipped.
function parseImportText(text, termDefSep, cardSep) {
    let chunks = cardSep ? text.split(cardSep) : [text];

    return chunks
        .map(function(chunk) { return chunk.trim(); })
        .filter(function(chunk) { return chunk.length > 0; })
        .map(function(chunk) {
            let idx = chunk.indexOf(termDefSep);
            if (idx === -1) return null;
            return {
                term: chunk.slice(0, idx).trim(),
                definition: chunk.slice(idx + termDefSep.length).trim()
            };
        })
        .filter(function(pair) { return pair && pair.term && pair.definition; });
}

// Injects the import panel into importContainer and wires its Import button
// to append parsed term_definition cards onto cardsContainer via addCardRow.
function initImportUi(importContainer, cardsContainer) {
    importContainer.insertAdjacentHTML("beforeend", importUiTemplate());

    let termDefSelect = document.getElementById("importTermDefSep");
    let termDefCustom = document.getElementById("importTermDefCustom");
    let cardSelect = document.getElementById("importCardSep");
    let cardCustom = document.getElementById("importCardCustom");
    let textarea = document.getElementById("importTextarea");
    let status = document.getElementById("importStatus");

    termDefSelect.addEventListener("change", function() {
        termDefCustom.classList.toggle("d-none", termDefSelect.value !== "custom");
    });
    cardSelect.addEventListener("change", function() {
        cardCustom.classList.toggle("d-none", cardSelect.value !== "custom");
    });

    document.getElementById("importTextBtn").addEventListener("click", function() {
        let termDefSep = resolveImportSeparator(termDefSelect, termDefCustom);
        let cardSep = resolveImportSeparator(cardSelect, cardCustom);

        if (!termDefSep) {
            status.textContent = "Enter a term/definition separator first.";
            return;
        }

        let pairs = parseImportText(textarea.value, termDefSep, cardSep);

        if (pairs.length === 0) {
            status.textContent = "No cards found — check your separators.";
            return;
        }

        pairs.forEach(function(pair) {
            addCardRow(cardsContainer, { type: "term_definition", term: pair.term, definition: pair.definition });
        });

        status.textContent = "Imported " + pairs.length + " card" + (pairs.length === 1 ? "" : "s") + ".";
        textarea.value = "";
    });
}

// ---- Groups ----
// Lets the set owner group cards (of any type) into named sections. In Study
// Mode, Shuffle keeps a group's cards in order relative to one another, and
// a group can be set to "Force finish" so the student can't move past it
// until every card in it is answered correctly (see studyset.html).

function groupUiTemplate() {
    return `
      <div class="card p-3 mb-3 bg-body-tertiary">
        <h6 class="mb-2">Groups</h6>
        <p class="form-text mt-0 mb-2">
            Group cards of any type into named sections. Shuffle keeps a group's cards in order
            relative to one another. A group can also force the student to finish it before moving on.
        </p>
        <div class="row g-2 mb-3">
            <div class="col-12 col-sm-6">
                <label class="form-label small mb-1">New groups default to</label>
                <select class="form-select form-select-sm" id="defaultGroupMode">
                    <option value="immediate" selected>Flag correct answers as done immediately</option>
                    <option value="forced">Force finish before continuing</option>
                </select>
            </div>
            <div class="col-12 col-sm-6">
                <label class="form-label small mb-1">"Force finish" behavior</label>
                <select class="form-select form-select-sm" id="groupForceMode">
                    <option value="locked" selected>Locked navigation (right answers still count individually)</option>
                    <option value="allornothing">All-or-nothing (any wrong answer resets the group's progress)</option>
                </select>
            </div>
        </div>
        <div id="groupList" class="mb-2"></div>
        <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control form-control-sm" id="newGroupName" placeholder="New group name" style="max-width:220px">
            <button type="button" class="btn btn-outline-primary btn-sm" id="addGroupBtn">+ Add Group</button>
        </div>
        <div class="form-text" id="groupStatus"></div>
      </div>
    `;
}

function groupRowTemplate(group) {
    return `
      <div class="d-flex align-items-center gap-2 mb-2 group-row" data-group-name="${group.name}">
          <span class="fw-semibold" style="min-width:140px">${group.name}</span>
          <select class="form-select form-select-sm groupModeSelect" style="max-width:280px">
              <option value="immediate">Flag correct answers as done immediately</option>
              <option value="forced">Force finish before continuing</option>
          </select>
          <button type="button" class="btn btn-outline-danger btn-sm removeGroupBtn">Remove</button>
      </div>
    `;
}

// Injects the Groups panel into groupContainer. Returns a small controller
// used by the page to hydrate existing data (editset.html) and to read the
// final groups/settings back out at submit time.
function initGroupUi(groupContainer, cardsContainer) {
    groupContainer.insertAdjacentHTML("beforeend", groupUiTemplate());

    let groups = []; // { name, mode }
    let groupList = document.getElementById("groupList");
    let defaultModeSelect = document.getElementById("defaultGroupMode");
    let forceModeSelect = document.getElementById("groupForceMode");
    let newNameInput = document.getElementById("newGroupName");
    let status = document.getElementById("groupStatus");

    function refreshCardGroupDropdowns() {
        knownGroups = groups;
        cardsContainer.querySelectorAll(".groupSelect").forEach(function(select) {
            populateGroupSelect(select, select.value);
        });
    }

    function renderGroupList() {
        groupList.innerHTML = groups.map(groupRowTemplate).join("");

        groupList.querySelectorAll(".group-row").forEach(function(row) {
            let name = row.dataset.groupName;
            let group = groups.find(function(g) { return g.name === name; });

            let modeSelect = row.querySelector(".groupModeSelect");
            modeSelect.value = group.mode;
            modeSelect.addEventListener("change", function() {
                group.mode = modeSelect.value;
            });

            row.querySelector(".removeGroupBtn").addEventListener("click", function() {
                groups = groups.filter(function(g) { return g.name !== name; });
                renderGroupList();
                refreshCardGroupDropdowns();
            });
        });
    }

    document.getElementById("addGroupBtn").addEventListener("click", function() {
        let name = newNameInput.value.trim();

        if (!name) {
            status.textContent = "Enter a group name first.";
            return;
        }
        if (groups.some(function(g) { return g.name === name; })) {
            status.textContent = "A group with that name already exists.";
            return;
        }

        groups.push({ name, mode: defaultModeSelect.value });
        newNameInput.value = "";
        status.textContent = "";
        renderGroupList();
        refreshCardGroupDropdowns();
    });

    refreshCardGroupDropdowns();

    return {
        // Replaces the current groups/settings wholesale (used to load an existing set).
        setGroups: function(existingGroups, settings) {
            groups = (existingGroups || []).map(function(g) {
                return { name: g.name, mode: g.mode || "immediate" };
            });
            defaultModeSelect.value = (settings && settings.defaultGroupMode) || "immediate";
            forceModeSelect.value = (settings && settings.groupForceMode) || "locked";
            renderGroupList();
            refreshCardGroupDropdowns();
        },
        getGroups: function() {
            return groups;
        },
        getSettings: function() {
            return {
                defaultGroupMode: defaultModeSelect.value,
                groupForceMode: forceModeSelect.value
            };
        }
    };
}
