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

        console.log(authResult.user);
        console.log(authResult.credential);
        console.log(authResult.additionalUserInfo);
        // {user: Zr, credential: ze, operationType: 'signIn', additionalUserInfo: Dt}
        console.log(JSON.stringify(authResult.additionalUserInfo.profile));
        console.log(authResult.additionalUserInfo.profile.email);

        //Dt {isNewUser: false, providerId: 'google.com', profile: {…}}
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.

        var databaseRef = db.ref()
        var userProfile = authResult.additionalUserInfo.profile
        var userEmail = userProfile.email
        var userName = userProfile.name
        //var userId = userEmail.substring(0, userEmail.indexOf('@'));

        var isNewUser = authResult.additionalUserInfo.isNewUser
        console.log("isNewUser = ", isNewUser)

        //console.log("isNewUser = ", isNewUser)
        if (isNewUser) {
          console.log("O")

          // Add this user to Firebase Database

          //console.log(userId)

          // Create User data
          var userData = {
            uid: user.uid,
            email: userEmail,
            userName: userName,
            lastLogin: Date.now()
            // growth: {},
            // organizing: {
            //   action: {
            //     id: "",
            //     createdDate: "",
            //     editedDate: "",
            //     contents: {}
            //   },
            //   bigPicture: {
            //     id: "",
            //     createdDate: "",
            //     editedDate: "",
            //     contents: {
            //       direction: {
            //         id: "",
            //         createdDate: "",
            //         editedDate: "",
            //         contents: {}
            //       },
            //       navi: {
            //         id: "",
            //         createdDate: "",
            //         editedDate: "",
            //         contents: {},
            //         scale: "",
            //         area: "",
            //         subArea: ""
            //       },
            //       actionPlan: {
            //         id: "",
            //         createdDate: "",
            //         editedDate: "",
            //         contents: {},
            //         term: ""
            //       }
            //     }
            //   },
            //   cycle: {
            //     time: {
            //       id: "",
            //       createdDate: "",
            //       editedDate: "",
            //       contents: {}
            //     },
            //     money: {
            //       id: "",
            //       createdDate: "",
            //       editedDate: "",
            //       contents: {}
            //     },
            //     routine: {
            //       id: "",
            //       createdDate: "",
            //       editedDate: "",
            //       contents: {}
            //     }
            //   }
            // },
            // discussing: {}
          }

          // Push to Firebase Database
          databaseRef.child('users/' + user.uid)
            .set(userData, (e) => {
              window.location.replace("index.html")
            })

          console.log("userData = ", userData)

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

