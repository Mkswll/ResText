const editor = document.getElementById("editor");
const boldButton = document.getElementById("boldButton");
const italicButton = document.getElementById("italicButton");
const underlineButton = document.getElementById("underlineButton");

function performAction(command) {
    document.execCommand(command, false, null);
    editor.focus();
}

boldButton.addEventListener("click", function () {
    performAction("bold");
});

italicButton.addEventListener("click", function () {
    performAction("italic");
});

underlineButton.addEventListener("click", function () {
    performAction("underline");
});
