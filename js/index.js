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
        console.log(result.notes)
    })
}