var height = document.body.clientHeight;
var width = document.body.clientWidth;
console.log(width)
if (width <= 540) {
    console.log(document.getElementById("add-game-input"))
    document.getElementById("add-game-input").rows = 40
    document.getElementById("add-game-input").setAttribute("style", "white-space: initial;")

    document.getElementById("add-note-input").rows = 40
    document.getElementById("add-note-input").setAttribute("style", "white-space: initial;")
}

//Auth
createAuthUI()
function createAuthUI() {
    //do not create the sign-in with google button if we already are signed-in
    if (API_getCurrentUser() == null) {
        API_createAuthUI(signInSuccess, false, "")
    }else{
        document.getElementById("container").classList.remove("hidden")
        createUnitSelectorButtons()
    }
}

function signInSuccess(authResult) {
    console.log(authResult)

    localStorage.setItem("currentUser", JSON.stringify(authResult))

    document.getElementById("container").classList.remove("hidden")
    createUnitSelectorButtons()
}

var doneLoadingUnits = false
var doneLoadingFirstUnitStuff = false

function checkDoneLoader() {
    if (doneLoadingUnits == false || doneLoadingFirstUnitStuff == false) {
        return false
    }
    document.getElementById("loading-hider").classList.add("hidden");
}

var latestUnit = ""
//Selector
function createUnitSelectorButtons() {
    var e = document.getElementById("unit-selector")
    var child = e.children[1].lastElementChild; 
    while (child) {
        e.children[1].removeChild(child);
        child = e.children[1].lastElementChild;
    }

    var i = width<= 540? 0.5: 1
    var yOffset = width <= 540? 12: 5
    API_getActiveUnits((order, numbers, names) => {
        var sortedOrder = order.sort((a,b) => {return b-a})
        var firstButton = null
        var first = true
        sortedOrder.forEach((order) => {
            if (typeof(order) == typeof(true)) {
                if (order == false) {
                    document.getElementById("add-btn").classList.add("disabled")
                    document.getElementById("add-btn").setAttribute("onclick", "")
                    document.getElementById("please-post-notice").classList.add("hidden")
                    document.getElementById("reminder-arrow").classList.add("hidden")
                }
                return
            }
            let num = numbers[order]
            let name = names[order]

            // API_getUnitName(num, (name) => {
                var template = e.children[2]

                var newBtn = template.cloneNode(true)

                newBtn.children[0].innerText = `Unit ${num} - ${name}`
                console.log(name, typeof(name))
                if (name.includes("USAPII")) {
                    newBtn.classList.add("unit-selector-smallfont")
                }
                let unitName = num + name
                newBtn.setAttribute("onclick", `loadUnit(this, '${unitName}')`)
                newBtn.classList.remove("hidden")
                newBtn.setAttribute("style", `margin-top: calc(${yOffset * i}vw + 1vh);`)
                newBtn.setAttribute("id", `unit-selector-btn${unitName}`)
                i++
                e.children[1].append(newBtn)
                if (first) {
                    latestUnit = num + name
                    firstButton = newBtn
                    first = false
                    loadUnit(newBtn, num + name)
                }

                if (order == sortedOrder[sortedOrder.length - 2]) {
                    doneLoadingUnits = true
                    checkDoneLoader()
                }

            // })
        })
    })
}

var oldBtn = null
function loadUnit(btn, unitNumber) {
    latestUnit = unitNumber
    var e = btn.parentElement
    for(var i = 0; i < e.children.length; i++) {
        e.children[i].classList.remove("selected-unit-btn") 
    }
    btn.classList.add("selected-unit-btn")

    if (width <= 540) {
        if (oldBtn != null) {
            btn.classList.remove("ignoredMargin-top")
        }
        oldBtn = btn
        btn.classList.add("ignoredMargin-top")
    }


    document.getElementById("unit-shower").classList.remove("hidden")
    document.getElementById("unit-selector").classList.add("selector-left-aligned")
    API_getUnit(unitNumber, (result) => {
        createUnitNotes(result.notes)
        createUnitGames(result.games)
        doneLoadingFirstUnitStuff = true
        checkDoneLoader()
    })
}

//Shower content
function createUnitNotes(notes) {
    var e = document.getElementById("unit-notes")
    var child = e.children[0].lastElementChild; 
    while (child) {
        e.children[0].removeChild(child);
        child = e.children[0].lastElementChild;
    }

    var keys = Object.keys(notes).sort((a,b) =>{return b-a})

    if (keys.length == 0) {
        document.getElementById("notes-nothing-here").classList.remove("hidden")
    }else{
        document.getElementById("notes-nothing-here").classList.add("hidden");
    }

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
            link_child.setAttribute('href', note.data)
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

            var img_keys = Object.keys(imgs).sort((a,b) =>{return a-b})

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

    if (keys.length == 0) {
        document.getElementById("games-nothing-here").classList.remove("hidden")
    }else{
        document.getElementById("games-nothing-here").classList.add("hidden");
    }

    keys.forEach((key) => {
        var game = games[key]
        var template = e.children[1]

        var newNote = template.cloneNode(true)

        var createdby = newNote.children[0]
        var link_child = newNote.children[1]
        link_child.innerText = game.data
        link_child.setAttribute('href', game.data)

        createdby.innerText = game.createdby

        newNote.classList.remove("hidden")

        e.children[0].appendChild(newNote)
    })
}

//Image util
function focusImage(image) {
    var magnifier = document.getElementById("image-magnifier")
    defocusImage(magnifier)
    image.classList.add('focused');
    magnifier.setAttribute("src", image.getAttribute("src"))

        setTimeout(() => {
            magnifier.classList.remove("hidden")
            if (width > 540) {
                magnifier.style.marginTop = `calc(-1 * ${magnifier.clientHeight / 2}px)`
            }else{
                magnifier.style.marginTop = `calc(-1 * ${magnifier.clientHeight / 5}px)`
            }
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

function toggleAddDialog() {
    var b = document.getElementById("add-dialog")
    b.classList.toggle("hidden")
    if (b.classList.contains("hidden")) {
        fadeOut(b)
    }else {
        fadeIn(b)
    }
}

function fadeOut(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            element.style.display = 'none';
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= 0.1;
    }, 10);
}

function fadeIn(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += 0.1;
    }, 10);
}

function updateAddDialog(selectElement) {
    document.getElementById("add-dialog-game").classList.add('hidden')
    document.getElementById("add-dialog-note").classList.add('hidden')
    document.getElementById(`add-dialog-${selectElement.value}`).classList.remove('hidden')
}

function submitNewPost() {
    var type = document.getElementById("add-dialog-type").value;

    if (type == "game") {
        var link = document.getElementById("add-game-input").value;
        if (validateUrl(link)) {
            var data = {
                createdby: API_getCurrentUser().displayName,
                uid: API_getCurrentUser().uid,
                data: link
            }
            console.log(latestUnit, data);
            API_addGame(latestUnit, data, () => {
                location.reload()
            })
        }else{
            alert("Invalid URL, try putting the https:// before it if it isn't there")
        }
    }else{
        var noteType = document.getElementById("add-note-type").value;

        if(noteType == "link") {
            var link = document.getElementById("add-note-input").value
            if (validateUrl(link)) {
                var data = {
                    createdby: API_getCurrentUser().displayName,
                    uid: API_getCurrentUser().uid,
                    data: link,
                    type: "link"
                }
    
                API_addNote(latestUnit, data, () => {
                    location.reload()
                })
            }else{
                alert("Invalid URL, try putting the https:// before it if it isn't there")
            }

        }else{
            var imgHolder = document.getElementById("image-holder")
            var children = imgHolder.children;

            var fileNames = []

            var imageUploadingDone = false
            var noteUploadingDone = false
            for(var i = 0; i < children.length; i++) {
                var child = children[i];
                var img = child.children[1]

                var data = img.getAttribute("src")

                var fileName = Date.now().toString() + "IMG" + i + API_getCurrentUser().uid                
                fileNames.push(fileName)

                var currentIndex = i

                API_createImage(fileName, data, () =>{
                    console.log("Finished uploading image", currentIndex)
                    if (currentIndex == children.length - 1) {
                        imageUploadingDone = true
                        if (noteUploadingDone) {
                            location.reload()
                        }
                    }
                })
            }

            var fileJoined = fileNames.join("~~~")
            console.log(fileJoined)

            var data = {
                createdby: API_getCurrentUser().displayName,
                uid: API_getCurrentUser().uid,
                data: fileJoined,
                type: "image"
            }

            API_addNote(latestUnit, data, () => {
                if (imageUploadingDone == true) {
                    location.reload()
                }
                noteUploadingDone = true;
            })
        }
    }
}

function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
  }

function showNotes(btn) {
    if (btn.classList.contains("selected")) {
        return
    }

    btn.classList.add("selected")
    document.getElementById("unit-shower-gamesbtn").classList.remove('selected')

    document.getElementById("unit-notes").classList.remove('hidden')
    document.getElementById("unit-games").classList.add('hidden')
}

function showGames(btn) {
    if (btn.classList.contains("selected")) {
        return
    }

    btn.classList.add("selected")
    document.getElementById("unit-shower-notesbtn").classList.remove('selected')

    document.getElementById("unit-games").classList.remove('hidden')
    document.getElementById("unit-notes").classList.add('hidden')
}

function updateAddNote(selectElement){
    document.getElementById("add-note-picture").classList.add('hidden')
    document.getElementById("add-note-link").classList.add('hidden')
    document.getElementById(`add-note-${selectElement.value}`).classList.remove('hidden')
}

function showImageInput(input) {
    var imgHolder = input.parentElement.children[1]
    var imgElement = input.parentElement.children[2]
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const uploaded_image = reader.result;
      var newImg = imgElement.cloneNode(true)
      newImg.children[1].setAttribute("src", uploaded_image)
      newImg.classList.remove("hidden")
      imgHolder.append(newImg)
    });
    reader.readAsDataURL(input.files[0]);
}

function deleteImage(holder) {
    holder.remove();
}