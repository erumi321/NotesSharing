createAuthUI()

function createAuthUI() {
    //do not create the sign-in with google button if we already are signed-in
    if (API_getCurrentUser() == null) {
        API_createAuthUI(signInSuccess, false, "")
    }
}

function signInSuccess(authResult) {
    console.log(authResult)

    localStorage.setItem("currentUser", JSON.stringiofy(authResult))
}

function loadUnit(unitNumber) {
    API_getUnit(unitNumber, (result) => {
        createUnitNotes(result.notes)
        createUnitGames(result.games)
    })
}

function createUnitNotes(notes) {
    var keys = Object.keys(notes).sort((a,b) =>{return b-a})

    keys.forEach((key) => {
        var note = notes[key]
        var template = document.getElementById("unit-notes").children[0]

        var newNote = template.cloneNode(true)

        var createdby = newNote.children[0]
        var link_child = newNote.children[1]
        var img_child = newNote.children[2]

        if (note.type == "link") {
            link_child.classList.remove("hidden")
            link_child.innerText = note.data
        }else if (note.type == "image"){
            img_child.classList.remove("hidden")
            img_child.setAttribute("src", "data:image/jpg;base64," + note.data)
        }

        createdby.innerText = note.createdby

        newNote.classList.remove("hidden")

        document.getElementById("unit-notes").appendChild(newNote)
    })
}

function createUnitGames(games) {
    var keys = Object.keys(games).sort((a,b) =>{return b-a})

    keys.forEach((key) => {
        var game = games[key]
        var template = document.getElementById("unit-games").children[0]

        var newNote = template.cloneNode(true)

        var createdby = newNote.children[0]
        var link_child = newNote.children[1]
        link_child.innerText = game.data

        createdby.innerText = game.createdby

        newNote.classList.remove("hidden")

        document.getElementById("unit-games").appendChild(newNote)
    })
}