import { BST, Tree } from "./dsa.js";

function generateID() {
    return Math.floor(Math.random() * 1000000).toString();
}

/* sets up the text editor */

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

var quill = new Quill("#editor", {
    modules: {
        toolbar: toolbarOptions,
    },
    theme: "snow",
});
var initial = "Complete your module here...";
quill.setText(initial);
quill.formatText(0, initial.length, "color", "gray");

const moduleTypes = [
    "Awards & Honors",
    "Activities",
    "Education",
    "Personal Qualities",
    "Research Experience",
    "Personal Question Responses",
    "Custom",
];

const moduleTypeValues = [
    "awards",
    "activities",
    "education",
    "qualities",
    "research",
    "responses",
    "custom",
];

var fileName = "File Name";
var fileID = generateID();
var draftID = generateID();
var parentDraftID = "";
var draftVersion = 1;
var moduleType = "";
var openButton = document.getElementById("open");
var fileConfirmButton = document.getElementById("openFileConfirm");
var saveButton = document.getElementById("save");
var modal = document.getElementById("modal");

var fileNameInput = document.getElementById("fileName");
var draftVersionInput = document.getElementById("draftVersion");
var moduleTypeInput = document.getElementById("typeSelect");

var fileCardTemplate = document.querySelector("[data-file-template]");
var fileCardContainer = document.querySelector("[data-file-cards-container]");
var fileSearchInput = document.querySelector("[data-file-search]");

var fileSelectedName = "";
var fileSelectedID = -1;

var projectModules = JSON.parse(sessionStorage.getItem("projectModules"));

var modulesBST = new BST();

var versionsTree = new Tree();
var versionsHTML = "";

var saveNames = new Set();
var fileIDs = new Set();
var draftIDs = new Set();
var curVersions = new Set();

var files = [];

fileNameInput.value = fileName;
draftVersionInput.value = draftVersion;

fileNameInput.addEventListener("change", (e) => {
    fileName = e.target.value;
});

draftVersionInput.addEventListener("change", (e) => {
    draftVersion = e.target.value;
});

moduleTypeInput.addEventListener("change", (e) => {
    moduleType = e.target.value;
});

window.onclick = function (e) {
    if (e.target == modal) {
        modal.style.display = "none";
    }
};

var openClose = document.getElementById("openClose");
openClose.onclick = function () {
    modal.style.display = "none";
};

fileSearchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    for (const file of files) {
        const isVisible = file.fileName.toLowerCase().includes(value);
        file.element.classList.toggle("hide", !isVisible);
    }
});

openButton.onclick = function () {
    fileSelectedName = "";
    fileSelectedID = -1;
    document.getElementById("openFileChosen").innerHTML = "None";
    fileWarning.style.display = "none";
    modal.style.display = "block";

    files = [];
    fileCardContainer.textContent = "";

    modulesBST.clear();

    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        modulesBST.insert(item.draftID, key);
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
            previewModal.style.display = "block";
            var previewQuill = new Quill("#previewEditor", {
                modules: {
                    toolbar: false,
                },
                theme: "snow",
                readOnly: true,
            });
            var previewID =
                e.currentTarget.parentElement.children[2].textContent;
            var delta = {
                ops: JSON.parse(projectModules[modulesBST.search(previewID)])
                    .ops,
            };
            previewQuill.setContents(delta);
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

saveButton.onclick = async function () {
    let delta = quill.getContents();
    delta["draftVersion"] = draftVersion;
    delta["fileName"] = fileName;
    delta["fileID"] = fileID;
    delta["draftID"] = draftID;
    delta["moduleType"] = moduleType;
    delta["parentDraftID"] = parentDraftID;
    let textToSave = JSON.stringify(delta);
    let blob = new Blob([textToSave], { type: "text/plain" });
    saveAs(blob, fileName + ".module.json");
    draftID = generateID();
};

window.addEventListener("load", loadPage);

function printTree(curNode) {
    versionsHTML += "<li class='triggerPreview' id='" + curNode.value + "'>";
    var item = JSON.parse(projectModules[modulesBST.search(curNode.value)]);
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
    curVersions = new Set();
    modulesBST.clear();
    versionsTree.clear();
    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        modulesBST.insert(item.draftID, key);
        saveNames.add(item.saveName);
        fileIDs.add(item.fileID);
        draftIDs.add(item.draftID);
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
}

function loadPage() {
    var str = '<option value=""> -- Please choose a module type -- </option>';
    for (let i = 0; i < moduleTypes.length; i++) {
        str +=
            '<option value="' +
            moduleTypeValues[i] +
            '" id="' +
            moduleTypeValues[i] +
            '">' +
            moduleTypes[i] +
            "</option>";
    }
    document.getElementById("typeSelect").innerHTML = str;
    loadVersions();
}

function readFile(e) {
    if (fileSelectedID == -1) {
        fileWarning.style.display = "block";
    } else {
        let openFile = JSON.parse(
            projectModules[modulesBST.search(fileSelectedID)]
        );
        quill.setContents(openFile.ops);
        modal.style.display = "none";
        draftVersion = openFile["draftVersion"];
        fileName = openFile["fileName"];
        fileID = openFile["fileID"];
        parentDraftID = openFile["draftID"];
        moduleType = openFile["moduleType"];
        fileNameInput.value = fileName;
        draftVersionInput.value = draftVersion;

        document.getElementById(moduleType).selected = true;
        loadPage();
    }
}

fileConfirmButton.addEventListener("click", readFile);
