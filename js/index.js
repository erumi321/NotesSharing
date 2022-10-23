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
        var img_container = newNote.children[2]
        var img_child = newNote.children[3]

        if (note.type == "link") {
            link_child.classList.remove("hidden")
            link_child.innerText = note.data
        }else if (note.type == "image"){
            img_container.classList.remove("hidden")
            index = 1
            var imgs = note.data.split("~~~")

            imgs.forEach((i) => {
                var new_img = img_child.cloneNode(true);    
    
                new_img.classList.remove("hidden")
                img_container.append(new_img)

                if (index % 2 == 0) {
                    var new_break = document.createElement("br")

                    img_container.append(new_break)
                    new_img.setAttribute("style", "margin-left: 0.1vw;")
                }else{
                    new_img.setAttribute("style", "margin-right: 0.1vw;")
                }
                index++;
            })

            var img_keys = Object.keys(imgs).sort((a,b) =>{return b-a})

            img_keys.forEach((imgKey, i) => {
                var imgName = imgs[imgKey]
                var index = i + Math.floor(i / 2)
                console.log(index)
                API_getImage(imgName, (url) => {
                    
                    img_container.children[index].setAttribute("src", url)
                })
            })
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

function focusImage(image) {
    var magnifier = document.getElementById("image-magnifier")
    defocusImage(magnifier)
    image.classList.add('focused');
    magnifier.setAttribute("src", image.getAttribute("src"))
    setTimeout(() => {
        magnifier.classList.remove("hidden")
        magnifier.style.marginTop = `calc(-1 * ${magnifier.clientHeight / 2}px)`
    }, 0.1)
}
var scrollMult = 1

function defocusImage(magnifier) {
    magnifier.setAttribute("src", "")
    magnifier.classList.add("hidden")

    document.querySelectorAll(".focused").forEach((e) => {
        e.classList.remove("focused")
    })
    scrollMult = 1
    magnifier.style.transform = `scale(${scrollMult})`
}

window.addEventListener('wheel',(event) => {
    console.log('Wheeling...', event);

    var magnifier = document.getElementById("image-magnifier")
    console.log(magnifier.classList.contains("hidden"))
    if (!magnifier.classList.contains("hidden")) {
        scrollMult -= 0.1 * (event.deltaY / Math.abs(event.deltaY))
        if (scrollMult < 1) {
            scrollMult = 1
        }

        magnifier.style.transform = `scale(${scrollMult})`
    }
});