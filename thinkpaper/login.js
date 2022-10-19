(function () {

  const auth = firebase.auth()
  const db = firebase.database()

  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Declare user variable
        var user = auth.currentUser

        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.

        var databaseRef = db.ref()
        var userProfile = authResult.additionalUserInfo.profile
        var userEmail = userProfile.email
        var userName = userProfile.name

        var isNewUser = authResult.additionalUserInfo.isNewUser

        if (isNewUser) {
          console.log("O")

          // Add this user to Firebase Database
          // Create User data
          var initialData = {
            user: {
              uid: user.uid,
              email: userEmail,
              name: userName,
              lastLogin: Date.now()
            },
            bigPicture: {
              children: ""
            }          
          }

          // Push to Firebase Database
          databaseRef.child('users/' + user.uid)
            .set(initialData, (e) => {
              window.location.replace("index.html")
            })

          console.log("initialData = ", initialData)

          return false;

        } else {
          console.log("X")

          return true;

        }


      },
      uiShown: function () {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'index.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
      //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //   firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: 'main.html',
    // Privacy policy url.
    privacyPolicyUrl: 'main.html'
  };

  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);

})()