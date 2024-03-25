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
var initial = "Write your story here...";
quill.setText(initial);
quill.formatText(0, initial.length, "italic", true);
quill.formatText(0, initial.length, "color", "gray");

var fileName = "File Name";
var fileID = generateID();
var draftID = generateID();
var draftVersion = 1;
var fileDefault = 1;
var openButton = document.getElementById("open");
var confirmButton = document.getElementById("openConfirm");
var saveButton = document.getElementById("save");
var exportButton = document.getElementById("export");

var fileNameInput = document.getElementById("fileName");
var draftVersionInput = document.getElementById("draftVersion");

fileNameInput.value = fileName;
draftVersionInput.value = draftVersion;

fileNameInput.addEventListener("change", function (e) {
    fileName = e.target.value;
});

draftVersionInput.addEventListener("change", function (e) {
    draftVersion = e.target.value;
});

saveButton.onclick = async function () {
    let delta = quill.getContents();
    delta["draftVersion"] = draftVersion;
    delta["fileName"] = fileName;
    delta["fileID"] = fileID;
    delta["draftID"] = draftID;
    let textToSave = JSON.stringify(delta);
    let blob = new Blob([textToSave], { type: "text/plain" });
    saveAs(blob, fileName + ".module.json");
};
