import { BST } from "./dsa.js";

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
    // [{"direction": "rtl"}],

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
// quill.formatText(0, initial.length, "italic", true);
quill.formatText(0, initial.length, "color", "gray");

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

var fileName = "File Name";
var fileID = generateID();
var draftID = generateID();
var draftVersion = 1;
var moduleType = "";
var fileDefault = 1;
var openButton = document.getElementById("open");
var confirmButton = document.getElementById("openConfirm");
var saveButton = document.getElementById("save");
var exportButton = document.getElementById("export");
var modal = document.getElementById("modal");

var fileNameInput = document.getElementById("fileName");
var draftVersionInput = document.getElementById("draftVersion");
var moduleTypeInput = document.getElementById("typeSelect");

var fileCardTemplate = document.querySelector("[data-file-template]");
var fileCardContainer = document.querySelector("[data-file-cards-container]");
var fileSearchInput = document.querySelector("[data-file-search]");

var fileSelectedName = "";
var fileSelectedID = -1;

var projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));
var projectModules = JSON.parse(sessionStorage.getItem("projectModules"));

var modulesBST = new BST();

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
    // openFile = null;
    fileSelectedName = "";
    fileSelectedID = -1;
    document.getElementById("openFileChosen").innerHTML = "None";
    fileWarning.style.display = "none";
    // openFileInput.files = init;
    modal.style.display = "block";

    files = [];
    fileCardContainer.textContent = "";

    modulesBST.clear();

    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        // console.log(key);
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
            // console.log(fileSelectedID);
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
    let textToSave = JSON.stringify(delta);
    let blob = new Blob([textToSave], { type: "text/plain" });
    saveAs(blob, fileName + ".module.json");
    draftID = generateID();
};

window.addEventListener("load", loadPage);

function loadPage() {
    var str = '<option value=""> -- Please choose a module type -- </option>';
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
