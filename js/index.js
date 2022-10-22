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
    document.getElementById("unit-shower").classList.remove("hidden")
    document.getElementById("unit-selector").classList.add("selector-left-aligned")
    API_getUnit(unitNumber, (result) => {
        createUnitNotes(result.notes)
        createUnitGames(result.games)
    })
}

function createUnitNotes(notes) {
    var e = document.getElementById("unit-notes")
    var child = e.children[0].lastElementChild; 
    while (child) {
        e.children[0].removeChild(child);
        child = e.children[0].lastElementChild;
    }

    var keys = Object.keys(notes).sort((a,b) =>{return b-a})

    keys.forEach((key) => {
        var note = notes[key]
        var template = e.children[1]

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

        e.children[0].appendChild(newNote)
    })
}

function createUnitGames(games) {
    var e = document.getElementById("unit-games")
    var child = e.children[0].lastElementChild; 
    while (child) {
        e.children[0].removeChild(child);
        child = e.children[0].lastElementChild;
    }
    var keys = Object.keys(games).sort((a,b) =>{return b-a})

    keys.forEach((key) => {
        var game = games[key]
        var template = e.children[1]

        var newNote = template.cloneNode(true)

        var createdby = newNote.children[0]
        var link_child = newNote.children[1]
        link_child.innerText = game.data

        createdby.innerText = game.createdby

        newNote.classList.remove("hidden")

        e.children[0].appendChild(newNote)
    })
}

function createUnitSelectorButtons() {
    var e = document.getElementById("unit-selector")
    var child = e.children[1].lastElementChild; 
    while (child) {
        e.children[1].removeChild(child);
        child = e.children[1].lastElementChild;
    }

    var i = 1
    var yOffset = 5

    API_getActiveUnits((active) => {
        active.forEach((num) => {
            API_getUnitName(num, (name) => {
                var template = e.children[2]

                var newBtn = template.cloneNode(true)

                console.log(newBtn)

                newBtn.innerText = `Unit ${num} - ${name}`

                newBtn.setAttribute("onclick", `loadUnit(${num})`)
                newBtn.classList.remove("hidden")
                newBtn.setAttribute("style", `margin-top: calc(${yOffset * i}vw + 1vh);`)
                i++
                e.children[1].append(newBtn)
            })
        })
    })
}