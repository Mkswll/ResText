const extensions = new Set(["json"]);
const types = ["resume", "module"];

function getFileExtension(filename) {
    return filename.toString().split(".").pop();
}

function getFileType(filename) {
    var temp = filename.toString().split(".");
    temp.pop();
    if (temp.length == 0) return "";
    return temp.pop();
}

document.getElementById("projectPicker").addEventListener("change", (e) => {
    var projectResumes = {},
        projectModules = {};
    sessionStorage.setItem("projectResumes", JSON.stringify(projectResumes));
    sessionStorage.setItem("projectModules", JSON.stringify(projectModules));
    for (const file of e.target.files) {
        if (extensions.has(getFileExtension(file.name))) {
            let reader = new FileReader();
            var content = "";
            if (getFileType(file.name) == types[0]) {
                reader.addEventListener("load", (e2) => {
                    content = reader.result;
                    projectResumes[file.name] = content;
                    sessionStorage.setItem(
                        "projectResumes",
                        JSON.stringify(projectResumes)
                    );
                });
                reader.readAsText(file);
            } else if (getFileType(file.name) == types[1]) {
                reader.addEventListener("load", (e2) => {
                    content = reader.result;
                    projectModules[file.name] = content;
                    sessionStorage.setItem(
                        "projectModules",
                        JSON.stringify(projectModules)
                    );
                });
                reader.readAsText(file);
            }
        }
    }
});

document.getElementById("confirmButton").addEventListener("click", (e) => {});
