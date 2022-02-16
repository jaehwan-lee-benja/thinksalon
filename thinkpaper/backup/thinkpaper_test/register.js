// // Your web app's Firebase configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyBmGlVK1P-fTw_RvFaA9tV1pEv8-Rk_-z4",
//     authDomain: "thinksalon-2021.firebaseapp.com",
//     databaseURL: "https://thinksalon-2021-default-rtdb.firebaseio.com",
//     projectId: "thinksalon-2021",
//     storageBucket: "thinksalon-2021.appspot.com",
//     messagingSenderId: "892004428811",
//     appId: "1:892004428811:web:805e7e85048e791af6eb0e",
//     measurementId: "G-YE9WY5Z6ZS"
//   };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);

  // Initialize variables
  const auth = firebase.auth()
  const database = firebase.database()
  
  // Set up our register function
  function register () {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    userName = document.getElementById('userName').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('이메일 또는 패스워드가 양식에 맞지 않습니다.')
      return
      // Don't continue running the code
    }
    if (validate_field(userName) == false) {
      alert('이름을 입력해주시기 바랍니다.')
      return
    }
   
    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
      // Declare user variable
      var user = auth.currentUser
  
      // Add this user to Firebase Database
      var database_ref = database.ref()
  
      // Create User data
      var user_data = {
        email : email,
        userName : userName,
        last_login : Date.now()
      }
  
      // Push to Firebase Database
      database_ref.child('users/' + user.uid).set(user_data)
  
      // Done
      alert('회원가입이 완료되었습니다.🎉🎉🎉')

      setTimeout(function() {
      window.location.replace("index.html")
      }, 2000);

    })
    .catch(function(error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code
      var error_message = error.message
  
      alert(error_message)
    })
  }
  
  // Set up our login function
  function login () {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value
  
    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('이메일 또는 패스워드가 양식에 맞지 않습니다.')
      return
      // Don't continue running the code
    }
  
    auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      // Declare user variable
      var user = auth.currentUser
  
      // Add this user to Firebase Database
      var database_ref = database.ref()
  
      // Create User data
      var user_data = {
        last_login : Date.now()
      }
  
      // Push to Firebase Database
      database_ref.child('users/' + user.uid).update(user_data)
  
      // Done
      //alert('User Logged In!!')
      window.location.replace("index.html")
  
    })
    .catch(function(error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code
      var error_message = error.message
  
      alert(error_message)
    })
  }
  
  
  
  
  // Validate Functions
  function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
      // Email is good
      return true
    } else {
      // Email is not good
      return false
    }
  }
  
  function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    if (password < 6) {
      return false
    } else {
      return true
    }
  }
  
  function validate_field(field) {
    if (field == null) {
      return false
    }
  
    if (field.length <= 0) {
      return false
    } else {
      return true
    }
  }