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
