// function f1() {
// 	//function to make the text bold using DOM method
// 	document.getElementById("textarea1").style.fontWeight = "bold";
// }

// function f2() {
// 	//function to make the text italic using DOM method
// 	document.getElementById("textarea1").style.fontStyle = "italic";
// }

// function f3() {
// 	//function to make the text alignment left using DOM method
// 	document.getElementById("textarea1").style.textAlign = "left";
// }

// function f4() {
// 	//function to make the text alignment center using DOM method
// 	document.getElementById("textarea1").style.textAlign = "center";
// }

// function f5() {
// 	//function to make the text alignment right using DOM method
// 	document.getElementById("textarea1").style.textAlign = "right";
// }

// function f6() {
// 	//function to make the text in Uppercase using DOM method
// 	document.getElementById("textarea1").style.textTransform = "uppercase";
// }

// function f7() {
// 	//function to make the text in Lowercase using DOM method
// 	document.getElementById("textarea1").style.textTransform = "lowercase";
// }

// function f8() {
// 	//function to make the text capitalize using DOM method
// 	document.getElementById("textarea1").style.textTransform = "capitalize";
// }

// function f9() {
// 	//function to make the text back to normal by removing all the methods applied
// 	//using DOM method
// 	document.getElementById("textarea1").style.fontWeight = "normal";
// 	document.getElementById("textarea1").style.textAlign = "left";
// 	document.getElementById("textarea1").style.fontStyle = "normal";
// 	document.getElementById("textarea1").style.textTransform = "capitalize";
// 	document.getElementById("textarea1").value = " ";
// }

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
    // console.log("cnt: ", test);
    // sessionStorage.setItem("project", JSON.stringify(project));
    // console.log(project);
    // console.log(JSON.stringify(project));
    // console.log(JSON.parse(sessionStorage.getItem("project")));
    // console.log(sessionStorage.getItem("project"));
});
