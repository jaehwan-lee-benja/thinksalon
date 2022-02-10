//220211 - login 예제 연습시 작성했던 파일
//참고링크: https://www.youtube.com/watch?v=CvkCjfHts9A&list=PLxCXGTk-TOK9NieH8hhON952KPmIfNSqk&index=16

var mainApp = {};

(function(){
    var firebase = app_fireBase;
    var uid = null;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            uid = user.uid;

            var user = firebase.auth().currentUser;

            if(user !=null) {

                var email_id = user.email;
                document.getElementById("user_para").innerHTML = "환영합니다. " + email_id + " 님";            
            }
            
        }else{
            // redirect to login page.
            uid = null;
            window.location.replace("login.html")
            //window.location
        }
    });

    function logOut(){
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;
})()