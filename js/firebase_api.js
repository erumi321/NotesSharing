const firebaseConfig = {
apiKey: "AIzaSyA3I8gsfJAqgIUZsz8c25KNM0oqDKu-kes",
authDomain: "apushnotes-733e9.firebaseapp.com",
projectId: "apushnotes-733e9",
storageBucket: "apushnotes-733e9.appspot.com",
messagingSenderId: "509692012521",
appId: "1:509692012521:web:7a3d7fbe83da776df6cd78"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Initialize firestore
const db = firebase.firestore();

//user 
function API_getCurrentUser() {
    var stored = localStorage.getItem("currentUser")

    if (stored == null){
        return null
    }else{
        return JSON.parse(stored)
    }
}

//Auth
function API_createAuthUI(signInSuccessWithAuthResultFunc, redirect, redirectURL) {
    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            signInSuccessWithAuthResultFunc(authResult.user)
            return redirect
          },
          uiShown: function() {
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: redirectURL,
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            customParameters: {
                // Forces account selection even when one account
                // is available.
                hd: 'students.mpsd.org',
                prompt: "select_account"
              }
          }
        ]
      };
    
    // Initialize the FirebaseUI Widget using Firebase.
    var firebase_UI = new firebaseui.auth.AuthUI(firebase.auth());
    
    firebase_UI.start('#firebaseui-auth-container',uiConfig);
}

//getting data
function API_getActiveUnits(callback) {
    db.collection("unitDirectory").doc("active").get().then((doc) => {
        callback(doc.data().active)
    });
}

function API_getUnit(unitNumber, callback) {
    db.collection(`unit${unitNumber}-notes`).get().then((notesSnapshot) => {
        var returnDict = {
            "notes": {},
            "games": {}
        }
        notesSnapshot.forEach((note) => {
            returnDict.notes[note.id] = note.data()
        });

        db.collection(`unit${unitNumber}-games`).get().then((gamesSnapshot) => {
            gamesSnapshot.forEach((game) => {
                returnDict.games[game.id] = game.data()
            });

            callback(returnDict)
        });
    })
}

function API_getUnitName(unitNumber, callback) {
    console.log(unitNumber)
    db.collection("unitDirectory").doc(`${unitNumber}`).get().then((doc) => {
        console.log(doc.data())
        callback(doc.data().name)
    })
}

//Creating data
function API_addNote(unitNumber, data, callback) {
    db.collection(`unit${unitNumber}-notes`).add(data).then((result) => {
        callback(result)
      })
}

//Creating data
function API_addGame(unitNumber, data, callback) {
    db.collection(`unit${unitNumber}-games`).add(data).then((result) => {
        callback(result)
      })
}