function loadVersions() {
    curVersions = new Set();
    resumesBST.clear();
    versionsTree.clear();
    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
        resumesBST.insert(item.draftID, key);
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

    /* more code omitted */
}

function loadPage() {
    projectResumes = JSON.parse(sessionStorage.getItem("projectResumes"));
    loadVersions();
}

openButton.onclick = function () {
    fileSelectedName = "";
    fileSelectedID = -1;
    document.getElementById("openFileChosen").innerHTML = "None";
    fileWarning.style.display = "none";
    modal.style.display = "block";

    files = [];
    fileCardContainer.textContent = "";

    for (const key in projectResumes) {
        var item = JSON.parse(projectResumes[key]);
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
            var previewID =
                e.currentTarget.parentElement.children[2].textContent;
            loadPreview(previewID, true);
        };

        fileCardContainer.append(card);
        files.push({
            fileName: item.fileName,
            draftVersion: item.draftVersion,
            draftID: item.draftID,
            element: card,
        });
    }
};
