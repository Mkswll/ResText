var fileCount = 0;

window.addEventListener("load", (e) => {
    {
        var obj = JSON.parse(sessionStorage.getItem("projectResumes"));
        if (obj != null) {
            fileCount += Object.keys(obj).length;
        }
    }
    {
        var obj = JSON.parse(sessionStorage.getItem("projectModules"));
        if (obj != null) {
            fileCount += Object.keys(obj).length;
        }
    }
    document.getElementById("fileCount").innerHTML = fileCount;
});
