import { BST, Tree } from "./dsa.js";
const { jsPDF } = globalThis.jspdf;

function generateID() {
    return Math.floor(Math.random() * 1000000).toString();
}

/* Sets up the text editor */

var toolbarOptions = [
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    // [{"header": [1, 2, 3, 4, 5, false]}],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ direction: "rtl" }],
    // [{"indent": "-1"}, {"indent": "+1"}],

    ["link", "image"],
];

var quill = new Quill("#editor", {
    modules: {
        toolbar: toolbarOptions,
    },
    theme: "snow",
});
var initial = "Write your story here...";
quill.setText(initial);
// quill.formatText(0, initial.length, "italic", true);
quill.formatText(0, initial.length, "color", "gray");

var cursor = quill.getSelection();

var moduleTypes = [
    "Awards & Honors",
    "Activities",
    "Education",
    "Personal Qualities",
    "Research Experience",
    "Personal Question Responses",
    "Custom",
];

var moduleTypeValues = [
    "awards",
    "activities",
    "education",
    "qualities",
    "research",
    "responses",
    "custom",
];

var moduleTypeConvert = {
    awards: "Awards & Honors",
    activities: "Activities",
    education: "Education",
    qualities: "Personal Qualities",
    research: "Research Experience",
    responses: "Personal Question Responses",
    custom: "Custom",
};

class Module {
    // type can be "awards", "activities", "education", "qualities", "research", "responses", or "custom"
    constructor(type) {
        this.type = type;
    }
}

/* File options */

var fileName = "File Name";
var fileID = generateID();
var draftID = generateID();
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
// var consoleButton = document.getElementById("console");
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

var projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));
var projectModules = JSON.parse(sessionStorage.getItem("projectModules"));
var resumesBST = new BST();
var modulesBST = new BST();

var moduleTypeInput = document.getElementById("typeSelect");
var moduleTypeSelected = "all";
var moduleNameSelected = "";

var names = new Set();
var curVersions = new Set();

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
    previewModal.style.display = "block";
    var previewQuill = new Quill("#previewEditor", {
        modules: {
            toolbar: false,
        },
        theme: "snow",
        readOnly: true,
    });
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
    // openFile = null;
    fileSelectedName = "";
    fileSelectedID = -1;
    document.getElementById("openFileChosen").innerHTML = "None";
    fileWarning.style.display = "none";
    // openFileInput.files = init;
    modal.style.display = "block";

    files = [];
    fileCardContainer.textContent = "";

    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        // console.log(key);
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
            // console.log(fileSelectedID);
        };

        preview.onclick = (e) => {
            var previewID =
                e.currentTarget.parentElement.children[2].textContent;
            loadPreview(previewID, true);
        };

        fileCardContainer.append(card);
        // console.log(item);
        files.push({
            fileName: item.fileName,
            draftVersion: item.draftVersion,
            draftID: item.draftID,
            element: card,
        });
    }
};

function loadTypeSelect() {
    var str = '<option value="all"> All Module Types </option>';
    for (let i = 0; i < moduleTypes.length; i++) {
        str +=
            '<option value="' +
            moduleTypeValues[i] +
            '">' +
            moduleTypes[i] +
            "</option>";
    }
    document.getElementById("typeSelect").innerHTML = str;
}

function listModules() {
    for (const module of modules) {
        const isVisible =
            (moduleTypeSelected == "all" ||
                moduleTypeSelected == module.moduleType) &&
            module.fileName.toLowerCase().includes(moduleNameSelected);
        module.element.classList.toggle("hide", !isVisible);
    }
}

moduleTypeInput.addEventListener("change", (e) => {
    moduleTypeSelected = e.target.value;
    listModules();
});

moduleSearchInput.addEventListener("input", (e) => {
    moduleNameSelected = e.target.value.toLowerCase();
    listModules();
});

loadModulesButton.onclick = function () {
    cursor = quill.getSelection();
    moduleModal.style.display = "block";
    projectModules = JSON.parse(sessionStorage.getItem("projectModules"));
    modules = [];
    moduleCardContainer.textContent = "";
    moduleSelectedID = -1;
    modulesBST.clear();
    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        modulesBST.insert(item.draftID, key);
        const card = moduleCardTemplate.content.cloneNode(true).children[0];
        const header = card.querySelector("[data-header]");
        const body = card.querySelector("[data-body]");
        const type = card.querySelector("[data-type]");
        const id = card.querySelector("[data-id]");
        const preview = card.querySelector("[data-preview]");

        header.textContent = item.fileName;
        body.textContent = "Version " + item.draftVersion;
        type.textContent = moduleTypeConvert[item.moduleType];
        id.textContent = item.draftID;
        card.onclick = (e) => {
            moduleSelectedName = e.currentTarget.children[0].textContent;
            document.getElementById("openModuleChosen").innerHTML =
                moduleSelectedName;
            moduleSelectedID = e.currentTarget.children[3].textContent;
        };

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
        });
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

// consoleButton.onclick = function () {
//     console.log(quill.getContents());
// };

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

function generateSaveName(fileName) {
    // makes sure that all save names are unique
    let extension = ".resume.json";
    if (!names.has(fileName)) {
        return fileName + extension;
    }
    let cnt = 1;
    while (true) {
        let temp = " (" + cnt + ")";
        if (!names.has(fileName + temp)) {
            return fileName + temp + extension;
        }
    }
}

saveButton.onclick = async function () {
    if (curVersions.has(draftVersion)) {
        saveWarning.style.display = "block";
    } else {
        saveWarning.style.display = "none";
        let delta = quill.getContents();
        delta["draftVersion"] = draftVersion;
        delta["fileName"] = fileName;
        delta["fileID"] = fileID;
        delta["draftID"] = draftID;
        delta["parentDraftID"] = parentDraftID;
        let textToSave = JSON.stringify(delta);
        let blob = new Blob([textToSave], { type: "text/plain" });
        let saveName = generateSaveName(fileName);
        saveAs(blob, saveName);
        // console.log(saveName);
        // projectResumes[saveName] = textToSave;
        // sessionStorage.setItem(
        //     "projectResumes",
        //     JSON.stringify(projectResumes)
        // );
        // loadPage();
        draftID = generateID();
    }
};

// import { saveAs } from "file-saver";
// import { pdfExporter } from "./quill-to-pdf";
// import "./quill-to-pdf";
// import { pdfExporter } from "../node_modules/quill-to-pdf/dist/main.js;

exportButton.onclick = async function () {
    // let delta = quill.getContents();
    // let pdfBlob = await pdfExporter.generatePdf(delta);
    // saveAs(pdfBlob, "pdf-export.pdf");
    // const html = quill.getSemanticHTML(0);
    var wrapper = document.createElement("div");

    var html = quill.container.firstChild.innerHTML;
    wrapper.innerHTML = html;
    html = wrapper;
    html.style = "width: 350pt";
    var pdf = new jsPDF("p", "pt", "a4");

    var specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector
        "#bypassme": function (element, renderer) {
            // true = "handled elsewhere, bypass text extraction"
            return true;
        },
    };
    var margins = {
        top: 20,
        bottom: 20,
        left: 20,
        width: 20,
    };
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

var root = -1;
var versionsTree = new Tree();

var versionsHTML = "";

function printTree(curNode) {
    versionsHTML += "<li class='triggerPreview' id='" + curNode.value + "'>";
    // console.log(curNode);
    var item = JSON.parse(projectResumes[resumesBST.search(curNode.value)]);
    versionsHTML += item.fileName + " (Version " + item.draftVersion + ")";
    versionsHTML += "<ul>";
    for (const node of curNode.children) {
        if (node == null || node.value == "") continue;
        printTree(node);
    }
    versionsHTML += "</ul>";
    versionsHTML += "</li>";
}

function loadVersions() {
    // var str = "";
    curVersions = new Set();

    root = -1;
    resumesBST.clear();
    versionsTree.clear();
    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        resumesBST.insert(item.draftID, key);
        names.add(item.fileName);
        // console.log(item.fileID, fileID);
        if (item.fileID == fileID) {
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
    const elements = document.getElementsByClassName("triggerPreview");
    [...elements].forEach((item) => {
        item.onclick = (e) => {
            loadPreview(e.target.id, true);
        };
    });

    // if (str == "") {
    //     str =
    //         "<tr><td><a> This file only has the current version. </a></td></tr>";
    // }
    // document.getElementById("tableContent").innerHTML = str;
}

function loadPage() {
    projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));
    loadVersions();
}

// document.getElementById("quillTest").addEventListener("click", (e) => {
//     var cursor = quill.getSelection();
//     var text = "new text to be inserted";
//     var delta = {
//         ops: [
//             { retain: cursor.index },
//             { insert: "Gandalf", attributes: { bold: true } },
//             { insert: " the " },
//             { insert: "Grey", attributes: { color: "#cccccc" } },
//         ],
//     };
//     // quill.insertText(cursor.index, delta, "bold", true);
//     quill.updateContents(delta);
//     console.log(cursor.index);
// });
