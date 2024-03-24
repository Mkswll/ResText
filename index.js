var chooseDirectory = document.getElementById("chooseDirectory");

chooseDirectory.onclick = async function (e) {
    let dirHandle = await window.showDirectoryPicker();
    // console.log(dirHandle);
    process.chdir(dirHandle);
};
