function generateID() {
    return Math.floor(Math.random() * 1000000).toString();
}

/* Sets up the text editor */
// import { pdfExporter } from "/Users/maxwellhe/node_modules/quill-to-pdf/src";
// import { PdfExporter } from "./quill-to-pdf";
// import { PdfExporter } from "./quill-to-pdf/dist/src/pdf-exporter";
// import { pdfExporter } from "quill-to-pdf";

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
var initial = "Write your story here...";
quill.setText(initial);
quill.formatText(0, initial.length, "italic", true);
quill.formatText(0, initial.length, "color", "gray");

/* Module Class */

var moduleTypes = [
    "Awards & Honors",
    "Activities",
    "Education",
    "Personal Qualities",
    "Research Experience",
    "Personal Question Responses",
    "Custom",
];

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
var fileDefault = 1;
var modal = document.getElementById("modal");
var moduleModal = document.getElementById("moduleModal");
var openButton = document.getElementById("open");
var confirmButton = document.getElementById("openConfirm");
var saveButton = document.getElementById("save");
var exportButton = document.getElementById("export");
var consoleButton = document.getElementById("console");
var loadModulesButton = document.getElementById("loadModules");
var openFileInput = document.getElementById("openFile");
var fileWarning = document.getElementById("fileWarning");
var fileNameInput = document.getElementById("fileName");
var draftVersionInput = document.getElementById("draftVersion");
var init = openFileInput.files;
var openFile = null;

var names = new Set();

fileNameInput.value = fileName;
draftVersionInput.value = draftVersion;
openButton.onclick = function () {
    openFile = null;
    fileWarning.style.display = "none";
    openFileInput.files = init;
    modal.style.display = "block";
};

loadModulesButton.onclick = function () {
    moduleModal.style.display = "block";
    var projectModules = JSON.parse(sessionStorage.getItem("projectModules"));
    var modules = [];
    for (let i = 0; i < moduleTypes.length; i++) {
        modules[i] = [];
    }
    for (const key in projectModules) {
        var item = JSON.parse(projectModules[key]);
        for (let i = 0; i < moduleTypes.length; i++) {
            if (item.type == moduleTypes[i]) {
                modules[i].push(item);
                break;
            }
        }
    }
    // REMEMBER TO FIX THIS PART
    var str = "<ul>";
    for (let i = 0; i < moduleTypes.length; i++) {
        var type = moduleTypes[i];
        str += "<li>" + type + "</li>";
        for (let item of modules[i]) {
            str += "<li>" + item + "</li>";
        }
    }
    str += "</ul>";
    document.getElementById("moduleModalContent").innerHTML = str;
};

consoleButton.onclick = function () {
    console.log(quill.getContents());
};

var close = document.getElementsByClassName("close")[0];
close.onclick = function () {
    modal.style.display = "none";
};

var moduleClose = document.getElementsByClassName("close")[1];
moduleClose.onclick = function () {
    moduleModal.style.display = "none";
};

window.onclick = function (e) {
    if (e.target == modal) {
        modal.style.display = "none";
    }
    if (e.target == moduleModal) {
        moduleModal.style.display = "none";
    }
};

function readFile(e) {
    if (openFile != null) {
        quill.setContents(openFile);
        modal.style.display = "none";
    } else {
        fileWarning.style.display = "block";
    }
}

confirmButton.addEventListener("click", readFile);

openFileInput.addEventListener("change", function (e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    // fileName = file.name;
    reader.readAsText(file);
    fileNameInput.value = fileName;
    fileDefault = false;
    reader.addEventListener("load", function (e2) {
        openFile = JSON.parse(e2.target.result);
        console.log(openFile);
        draftVersion = openFile["draftVersion"];
        fileName = openFile["fileName"];

        fileID = openFile["fileID"];
        // draftID = openFile["draftID"];
        fileNameInput.value = fileName;
        draftVersionInput.value = draftVersion;
        loadPage();
    });
});

function generateSaveName(fileName) {
    // makes sure that all file names are unique
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
    let delta = quill.getContents();
    delta["draftVersion"] = draftVersion;
    delta["fileName"] = fileName;
    delta["fileID"] = fileID;
    delta["draftID"] = draftID;
    let textToSave = JSON.stringify(delta);
    let blob = new Blob([textToSave], { type: "text/plain" });
    saveAs(blob, generateSaveName(fileName));
};

// import { saveAs } from "file-saver";
// import { pdfExporter } from "./quill-to-pdf";
// import "./quill-to-pdf";
// import { pdfExporter } from "../node_modules/quill-to-pdf/dist/main.js;

exportButton.onclick = async function () {
    let delta = quill.getContents();
    // let pdfBlob = await pdfExporter.generatePdf(delta);
    // saveAs(pdfBlob, "pdf-export.pdf");
};

fileNameInput.addEventListener("change", function (e) {
    fileName = e.target.value;
});

draftVersionInput.addEventListener("change", function (e) {
    draftVersion = e.target.value;
});

window.addEventListener("load", (e) => {
    // console.log("here");
    // var str = "";
    // let projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));

    // // console.log(projectResumes);
    // // console.log(fileDefault);
    // if (fileDefault) {
    // } else {
    //     for (const key in projectResumes) {
    //         var item = JSON.parse(projectResumes[key]);
    //         console.log(item.fileID, fileID);
    //         if (item.fileID == fileID) {
    //             // maybe change this part
    //             str += "<tr>";
    //             str += "<td><a>" + fileName + "</a></td>";
    //             // console.log("here2");
    //         }
    //     }
    // }

    // if (str == "") {
    //     str =
    //         "<tr><td><a> This file only has the current version. </a></td></tr>";
    // }
    // document.getElementById("tableContent").innerHTML = str;
    loadPage();
});

function loadPage() {
    var str = "";
    var projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));

    console.log(projectResumes);
    console.log(fileDefault);
    if (fileDefault) {
    }

    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        // console.log(item.fileName);
        names.add(item.fileName);
        if (item.fileID == fileID) {
            // maybe change this part
            str += "<tr>";
            // remember adding href
            str += "<td><a>" + fileName + "</a></td>";
            str += "<td><a>" + draftVersion + "</a></td>";
            str += "</tr>";
        }
    }

    if (str == "") {
        str =
            "<tr><td><a> This file only has the current version. </a></td></tr>";
    }
    document.getElementById("tableContent").innerHTML = str;
}
