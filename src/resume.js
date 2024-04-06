import { BST, Tree } from "./dsa.js";
const { jsPDF } = globalThis.jspdf;

/* sets up the text editor */

/* chooses which text options and design options are to be displayed */
var toolbarOptions = [
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, false] }],
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ direction: "rtl" }],
    ["link", "image"],
];

/* quill is set to be a global variable so that all functions can access the editor */
var quill = new Quill("#editor", {
    modules: {
        toolbar: toolbarOptions,
    },
    theme: "snow",
});

/* initializes the editor’s placeholder text */
var initial = "Write your story here...";
quill.setText(initial);
quill.formatText(0, initial.length, "color", "gray");

var cursor = quill.getSelection();

/* constant arrays */

/* moduleTypes lists the readable words that are to be displayed on the UI to the user */
const moduleTypes = [
    "Awards & Honors",
    "Activities",
    "Education",
    "Personal Qualities",
    "Research Experience",
    "Personal Question Responses",
    "Custom",
];

/* moduleTypeValues lists the HTML values of the corresponding module types; facilitates the generation of dynamic interface */
const moduleTypeValues = [
    "awards",
    "activities",
    "education",
    "qualities",
    "research",
    "responses",
    "custom",
];

/* maps HTML values to their respective module type names */
const moduleTypeConvert = {
    awards: "Awards & Honors",
    activities: "Activities",
    education: "Education",
    qualities: "Personal Qualities",
    research: "Research Experience",
    responses: "Personal Question Responses",
    custom: "Custom",
};

/* Parsed data */

var saveNames = new Set();
var fileIDs = new Set();
var draftIDs = new Set();
var curVersions = new Set();
var projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));
var projectModules = JSON.parse(sessionStorage.getItem("projectModules"));
var resumesBST = new BST();
var modulesBST = new BST();

/* generates a unique file ID or draft ID */
function generateID(isFileID) {
    let ret = Math.floor(Math.random() * 1000000).toString(); // generates an integer from 0 to 999999 and converts it to string
    if (isFileID) {
        while (fileIDs.has(ret)) {
            ret = Math.floor(Math.random() * 1000000).toString();
        }
    } else {
        while (draftIDs.has(ret)) {
            ret = Math.floor(Math.random() * 1000000).toString();
        }
    }
    return ret;
}

/* file attributes and options */

var fileName = "File Name";
var fileID = generateID(1);
var draftID = generateID(0);
var draftVersion = 1;
var parentDraftID = "";
var modal = document.getElementById("modal");
var moduleModal = document.getElementById("moduleModal");
var previewModal = document.getElementById("previewModal");
var openButton = document.getElementById("open");
var fileConfirmButton = document.getElementById("openFileConfirm");
var moduleConfirmButton = document.getElementById("openModuleConfirm");
var saveButton = document.getElementById("save");
var exportButton = document.getElementById("export");
var loadModulesButton = document.getElementById("loadModules");
var fileWarning = document.getElementById("fileWarning");
var saveWarning = document.getElementById("saveWarning");
var fileNameInput = document.getElementById("fileName");
var draftVersionInput = document.getElementById("draftVersion");
var openFile = null;
var fileCardTemplate = document.querySelector("[data-file-template]");
var fileCardContainer = document.querySelector("[data-file-cards-container]");
var fileSearchInput = document.querySelector("[data-file-search]");
var moduleCardTemplate = document.querySelector("[data-module-template]");
var moduleSearchInput = document.querySelector("[data-module-search]");
var moduleCardContainer = document.querySelector(
    "[data-module-cards-container]"
);
var fileSelectedName = "";
var fileSelectedID = -1;
var moduleSelectedName = "";
var moduleSelectedID = -1;
var moduleTypeInput = document.getElementById("typeSelect");
var moduleTypeSelected = "all";
var moduleNameSelected = "";

var files = [];
var modules = [];

fileNameInput.value = fileName;
draftVersionInput.value = draftVersion;

fileSearchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    for (const file of files) {
        const isVisible = file.fileName.toLowerCase().includes(value);
        file.element.classList.toggle("hide", !isVisible);
    }
});

function loadPreview(previewID, isResume) {
    previewModal.style.display = "block"; // displays the modal window for preview
    var previewQuill = new Quill("#previewEditor", {
        modules: {
            toolbar: false, // disabling the toolbar since this Quill editor is read-only
        },
        theme: "snow",
        readOnly: true,
    });
    /* parses the Delta content of the requested preview content */
    var delta;
    if (isResume) {
        delta = {
            ops: JSON.parse(projectResumes[resumesBST.search(previewID)]).ops,
        };
    } else {
        delta = {
            ops: JSON.parse(projectModules[modulesBST.search(previewID)]).ops,
        };
    }

    previewQuill.setContents(delta);
}

openButton.onclick = function () {
    fileSelectedName = "";
    fileSelectedID = -1;
    document.getElementById("openFileChosen").innerHTML = "None";
    fileWarning.style.display = "none";
    modal.style.display = "block";

    files = [];
    fileCardContainer.textContent = "";

    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        const card = fileCardTemplate.content.cloneNode(true).children[0];
        const header = card.querySelector("[data-header]");
        const body = card.querySelector("[data-body]");
        const id = card.querySelector("[data-id]");
        const preview = card.querySelector("[data-preview]");

        header.textContent = item.fileName;
        body.textContent = "Version " + item.draftVersion;
        id.textContent = item.draftID;
        card.onclick = (e) => {
            fileSelectedName = e.currentTarget.children[0].textContent;
            document.getElementById("openFileChosen").innerHTML =
                fileSelectedName;
            fileSelectedID = e.currentTarget.children[2].textContent;
        };

        preview.onclick = (e) => {
            var previewID =
                e.currentTarget.parentElement.children[2].textContent;
            loadPreview(previewID, true);
        };

        fileCardContainer.append(card);
        files.push({
            fileName: item.fileName,
            draftVersion: item.draftVersion,
            draftID: item.draftID,
            element: card,
        });
    }
};

function loadTypeSelect() {
    var str = '<option value="all"> All Module Types </option>'; // the first, default option
    for (let i = 0; i < moduleTypes.length; i++) {
        str +=
            '<option value="' +
            moduleTypeValues[i] +
            '">' +
            moduleTypes[i] +
            "</option>"; // creates HTML code for the select element
    }
    document.getElementById("typeSelect").innerHTML = str;
}

function listModules() {
    for (const module of modules) {
        /* makes sure that only modules whose names contain the keyword and whose types correspond to the requested type are displayed */
        const isVisible =
            (moduleTypeSelected == "all" ||
                moduleTypeSelected == module.moduleType) &&
            module.fileName.toLowerCase().includes(moduleNameSelected);
        module.element.classList.toggle("hide", !isVisible);
    }
}

/* function to adjust the displayed module cards when the search input field is changed */
moduleTypeInput.addEventListener("change", (e) => {
    moduleTypeSelected = e.target.value;
    listModules();
});

/* function to adjust the displayed module cards when the type select field is changed */
moduleSearchInput.addEventListener("input", (e) => {
    moduleNameSelected = e.target.value.toLowerCase();
    listModules();
});

loadModulesButton.onclick = function () {
    cursor = quill.getSelection(); // gets the position of the selection in the editor
    moduleModal.style.display = "block"; // displays the modal window for searching modules
    projectModules = JSON.parse(sessionStorage.getItem("projectModules")); // retrieves the modules stored in the session storage
    modules = [];
    moduleCardContainer.textContent = "";
    moduleSelectedID = -1; // used when inserting the selected module to the editor
    modulesBST.clear();
    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        modulesBST.insert(item.draftID, key);
        const card = moduleCardTemplate.content.cloneNode(true).children[0]; // creating a card as a clone of the card template
        const header = card.querySelector("[data-header]");
        const body = card.querySelector("[data-body]");
        const type = card.querySelector("[data-type]");
        const id = card.querySelector("[data-id]");
        const preview = card.querySelector("[data-preview]");

        header.textContent = item.fileName;
        body.textContent = "Version " + item.draftVersion;
        type.textContent = moduleTypeConvert[item.moduleType];
        id.textContent = item.draftID;
        /* clicking on the card changes the information of the currently selected module */
        card.onclick = (e) => {
            moduleSelectedName = e.currentTarget.children[0].textContent;
            document.getElementById("openModuleChosen").innerHTML =
                moduleSelectedName;
            moduleSelectedID = e.currentTarget.children[3].textContent;
        };
        /* clicking on the "preview" loads the modal window for previewing the module */
        preview.onclick = (e) => {
            var previewID =
                e.currentTarget.parentElement.children[3].textContent;
            loadPreview(previewID, false);
        };

        moduleCardContainer.append(card);

        modules.push({
            fileName: item.fileName,
            draftVersion: item.draftVersion,
            draftID: item.draftID,
            moduleType: item.moduleType,
            element: card,
        }); // modules is a list containing all module cards
    }
};

moduleConfirmButton.addEventListener("click", (e) => {
    if (moduleSelectedID == -1) {
        document.getElementById("moduleWarning").style.display = "block";
    } else {
        var openModule = JSON.parse(
            projectModules[modulesBST.search(moduleSelectedID)]
        );
        var delta = { ops: openModule.ops };
        if (cursor != null) {
            delta.ops.unshift({ retain: cursor.index });
        } else {
            delta.ops.unshift({ retain: quill.getContents().length });
        }
        quill.updateContents(delta);
        moduleModal.style.display = "none";
    }
});

var openClose = document.getElementById("openClose");
openClose.onclick = function () {
    modal.style.display = "none";
};

var moduleClose = document.getElementById("moduleClose");
moduleClose.onclick = function () {
    moduleModal.style.display = "none";
};

var previewClose = document.getElementById("previewClose");
previewClose.onclick = function () {
    previewModal.style.display = "none";
};

window.onclick = function (e) {
    if (e.target == modal) {
        modal.style.display = "none";
    }
    if (e.target == moduleModal) {
        moduleModal.style.display = "none";
    }
    if (e.target == previewModal) {
        previewModal.style.display = "none";
    }
};

function readFile(e) {
    if (fileSelectedID == -1) {
        fileWarning.style.display = "block";
    } else {
        openFile = JSON.parse(
            projectResumes[resumesBST.search(fileSelectedID)]
        );
        quill.setContents(openFile.ops);
        modal.style.display = "none";
        draftVersion = openFile["draftVersion"];
        fileName = openFile["fileName"];
        fileID = openFile["fileID"];
        parentDraftID = openFile["draftID"];
        fileNameInput.value = fileName;
        draftVersionInput.value = draftVersion;
        loadPage();
    }
}

fileConfirmButton.addEventListener("click", readFile);

/* generates a unique save name */
function generateSaveName(fileName) {
    let extension = ".resume.json";
    if (!saveNames.has(fileName)) {
        return fileName + extension;
    }
    let cnt = 1;
    while (true) {
        let temp = " (" + cnt + ")";
        if (!saveNames.has(fileName + temp)) {
            return fileName + temp + extension;
        }
    }
}

saveButton.onclick = async function () {
    if (curVersions.has(draftVersion)) {
        // sees if the current draft version is valid (unused)
        saveWarning.style.display = "block";
    } else {
        saveWarning.style.display = "none";
        let delta = quill.getContents(); // retrieves the content of the editor as Delta
        let saveName = generateSaveName(fileName); // self-defined function to generate a unique save name

        /* adds additional attributes to the object to be saved */
        delta["draftVersion"] = draftVersion;
        delta["fileName"] = fileName;
        delta["saveName"] = saveName;
        delta["fileID"] = fileID;
        delta["draftID"] = draftID;
        delta["parentDraftID"] = parentDraftID;
        let textToSave = JSON.stringify(delta);
        let blob = new Blob([textToSave], { type: "text/plain" });
        saveAs(blob, saveName); // saveAs is a function in FileSaver.js
        draftID = generateID(0); // re-generates the current draft ID
    }
};

exportButton.onclick = function () {
    var wrapper = document.createElement("div"); // wrapper to wrap the Quill HTML content
    var html = quill.container.firstChild.innerHTML; // retrieves the HTML of the Quill content
    wrapper.innerHTML = html;
    html = wrapper;
    html.style = "width: 350pt";
    var pdf = new jsPDF("p", "pt", "a4"); // sets the orientation, unit, and page format

    pdf.html(html, {
        callback: function (pdf) {
            pdf.save(fileName + ".pdf");
        },
        margin: [72, 72, 72, 72],
        autoPaging: "text",
    });
};

fileNameInput.addEventListener("change", function (e) {
    fileName = e.target.value;
});

draftVersionInput.addEventListener("change", function (e) {
    draftVersion = e.target.value;
});

window.addEventListener("load", (e) => {
    loadTypeSelect();
    loadPage();
});

var versionsTree = new Tree();
var versionsHTML = "";

function printTree(curNode) {
    versionsHTML += "<li class='triggerPreview' id='" + curNode.value + "'>"; // setting the class as “triggerPreview” to link to the onclick function defined in loadVersions
    var item = JSON.parse(projectResumes[resumesBST.search(curNode.value)]); // retrieves the file corresponding to curNode
    versionsHTML += item.fileName + " (Version " + item.draftVersion + ")";
    versionsHTML += "<ul>";
    for (const node of curNode.children) {
        if (node == null || node.value == "") continue;
        printTree(node); // recursively traverse the version tree
    }
    versionsHTML += "</ul>";
    versionsHTML += "</li>";
}

function loadVersions() {
    curVersions = new Set(); // a set containing all versions related to the current draft; will be used to detect whether the version number the user enters is existing
    resumesBST.clear();
    versionsTree.clear();
    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        resumesBST.insert(item.draftID, key);
        saveNames.add(item.saveName); // saveNames is a set containing all files' save names
        fileIDs.add(item.fileID); // fileIDs is a set containing all files' file IDs
        draftIDs.add(item.draftID); // draftIDs is a set containing all drafts' draft IDs
        if (item.fileID == fileID) {
            /* adds item to the version tree if it shares the same file ID as the open file */
            if (item.parentDraftID == "") {
                versionsTree.setRootbyValue(item.draftID);
            } else {
                versionsTree.addEdgebyValues(item.parentDraftID, item.draftID);
            }
            curVersions.add(item.draftVersion);
        }
    }
    versionsTree.build();
    if (versionsTree.size == 0) {
        versionsHTML = "This file only has the current version.";
    } else {
        versionsHTML = "<ul>";
        printTree(versionsTree.root);
        versionsHTML += "</ul>";
    }

    document.getElementById("versionList").innerHTML = versionsHTML;
    /* sets the onclick function for file previewing for each item in the version tree */
    const elements = document.getElementsByClassName("triggerPreview");
    [...elements].forEach((item) => {
        item.onclick = (e) => {
            loadPreview(e.target.id, true);
        };
    });
}

function loadPage() {
    projectResumes = JSON.parse(sessionStorage.getItem("projectResumes")); // retrieves the resumes stored in the session storage
    loadVersions();
}
