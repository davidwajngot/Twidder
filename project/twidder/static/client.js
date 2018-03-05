displayView = function(view){
 document.getElementById("clientviewer").innerHTML = view;
};
window.onload = function(){
	//localStorage.removeItem('token');
  welcomeview  = document.getElementById('welcomeview').innerHTML;
  profileview  = document.getElementById('profileview').innerHTML;
	if(localStorage.getItem('token')){
		displayView(profileview);
    showHomePanel();
		console.log("profile, token: " + localStorage.getItem('token'));
    getUserInfo();
    updateWall();
    twidderData();
    socket();
	}
	else{
  	displayView(welcomeview);
    //displayView(profileview);
  	console.log("welcome, token: " + localStorage.getItem('token'));
	}
};

function socket(){
  ws = new WebSocket('ws://localhost:4000/echo');

   ws.onopen = function () {
     var token = localStorage.getItem('token');
     console.log("Socket open: " + token)
     ws.send(token);
   };

   //force logout previous login
  ws.onmessage = function (message) {
    //console.log("msgdata: " + message.data)
    if (message.data == "signout"){
      console.log("Logged out, logged in somewhere else");
      localStorage.removeItem("token");
      displayView(welcomeview);
    }
    else{
      //Update live data representation
      twidderData();
    }
  };
}

function signIn(){
	var userName = document.getElementById("userName").value;
	var passwordIn = document.getElementById("passwordIn").value;
  var login = {
    'email': userName,
    'password': passwordIn,
  }
	if(passwordIn.length < 6){
		document.getElementById('signInMessage').style.color = 'red';
		document.getElementById("signInMessage").innerHTML = "Password must be at least 6 letters";
		return false;
	}
	else{
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/signin", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       var parsedJson = JSON.parse(xhttp.responseText)
       var message = parsedJson.message;
       var success = parsedJson.success;
       if(success){
         localStorage.setItem('token', parsedJson.token);
         console.log("token: " + localStorage.getItem('token'));
         console.log(parsedJson.message);
         displayView(profileview);
         showHomePanel();
         getUserInfo();
         updateWall();
         twidderData();
         socket();
       }
       else{
         document.getElementById('signInMessage').style.color = 'red';
         document.getElementById("signInMessage").innerHTML = "Invalid login";
       }
       return success;
     }
    };

    xhttp.send(JSON.stringify(login));
	}
};

 function signUp(){
	var passwordUp = document.getElementById("passwordUp").value;
	var repeat = document.getElementById("repeat").value;

	if (passwordUp != repeat){
		document.getElementById("signUpMessage").innerHTML = "Passwords does not match";
		return false;
	}
	else if(passwordUp.length < 6){
		document.getElementById("signUpMessage").innerHTML = "Password must be at least 6 letters";
		return false;
	}
	else{
		var user = {
			'email': document.getElementById("email").value,
			'password': document.getElementById("passwordUp").value,
			'firstname': document.getElementById("firstName").value,
			'familyname': document.getElementById("lastName").value,
			'gender': document.getElementById("gender").value,
			'city': document.getElementById("city").value,
			'country': document.getElementById("country").value,
		}
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/signup", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function() {
       var parsedJson = JSON.parse(xhttp.responseText)
       var message = parsedJson.message;
       console.log("message: " + message)
       var success = parsedJson.success;
       if (success){
          document.getElementById('signUpMessage').style.color = 'green';
       }
       else{
         document.getElementById('signUpMessage').style.color = 'red';
       }
       document.getElementById("signUpMessage").innerHTML = message;
       return success;
    }
  };
    xhttp.send(JSON.stringify(user));
};

/*FUNCTIONS FOR ACCOUNT PANEL*/
function changePassword(){

  var oldPassword = document.getElementById('oldPassword').value;
  var newPassword = document.getElementById('newPassword').value;
  var newPasswordRpt = document.getElementById('newPasswordRpt').value;
  var token = localStorage.getItem('token');
  document.getElementById('changeMessage').style.color = 'red';
  if(newPassword.length < 6){
    document.getElementById('changeMessage').innerHTML = "New password too short";
  }
  else if(newPassword != newPasswordRpt){
    document.getElementById('changeMessage').innerHTML = "New passwords does not match";
  }
  else {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/changepassword", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function() {
       var parsedJson = JSON.parse(xhttp.responseText)
       var message = parsedJson.message;
       var success = parsedJson.success;
       if(success){
         document.getElementById('changeMessage').style.color = 'green';
       }
       document.getElementById('changeMessage').innerHTML = message;
    };
    //hash salt
    var hashSalt = token + oldPassword + newPassword;
    //console.log("hashSalt: " + hashSalt);
    var hashToken = md5(hashSalt);
    //console.log("hashT: " + hashToken);
    //console.log("logpublkey: " + publicKey);
    var publicKey = document.getElementById('uEmail').innerHTML;

    xhttp.send(JSON.stringify({"hashToken": hashToken,"old": oldPassword, "new": newPassword, "key": publicKey}));
  }
};


function signOut(){
  var token = localStorage.getItem('token');

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/signout", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.onload = function() {
     var parsedJson = JSON.parse(xhttp.responseText)
     var message = parsedJson.message;
     var success = parsedJson.success;
     if (success){
       localStorage.removeItem('token');
       displayView(welcomeview);
     }
  };
  var salt = "POST/signout";
  var hashSalt = token + salt;
  var hashToken = md5(hashSalt);
  var publicKey = document.getElementById('uEmail').innerHTML;

  xhttp.send(JSON.stringify({"hashToken": hashToken, "key": publicKey, "salt": salt}));
};

/*FUNCTIONS FOR HOME PANEL*/
function getUserInfo(){
  var token = localStorage.getItem('token');
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/findself", true);
  xhttp.setRequestHeader("Authorization", token);
  xhttp.onload = function() {
     var parsedJson = JSON.parse(xhttp.responseText)
     var message = parsedJson.message;
     console.log("message: " + message);
     var success = parsedJson.success;
     if (success){
       var data = parsedJson.data;
       document.getElementById('uName').innerHTML = data.firstname;
       document.getElementById('uLastname').innerHTML = data.familyname;
       document.getElementById('uGender').innerHTML = data.gender;
       document.getElementById('uCity').innerHTML = data.city;
       document.getElementById('uCountry').innerHTML = data.country;
       document.getElementById('uEmail').innerHTML = data.email;

     }
  };
  xhttp.send();
};

function twidderData(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/live", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     var parsedJson = JSON.parse(xhttp.responseText)
     var message = parsedJson.message;
     var success = parsedJson.success;
     if(success){
       var data = parsedJson.data;
       var ctx = document.getElementById('myChart').getContext('2d');
       var chart = new Chart(ctx, {

        // The type of chart we want to create
         type: 'bar',
        // The data for our dataset
        data: {
            labels: ["Male users", "Female users", "Online users"],
            datasets: [{
              label: "Live statistics from Twidder",
                backgroundColor: 'rgb(0, 51, 204)',
                data: [data.males, data.females, data.online],
            }]
        },

      // Configuration options go here
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  steps: 5,
                  stepValue: 1,
                  max: 5,
                  fontColor: 'black'
                }
              }],
              xAxes: [{
                ticks: {
                  fontColor: 'black'
                }
              }]
            },
            legend: {
              labels: {
                fontColor : 'black'
              }
            }
          }
        });
      }
    }
  }
  xhttp.send();
}



function updateWall(){
  var token = localStorage.getItem('token');
  var home;
  if(document.getElementById('homePanel').style.display == 'flex'){
    home = true;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/messagestoken", true);
  }
  else{
    var email = document.getElementById('uEmail2').innerHTML;
    home = false;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/messagesemail/" + email, true);
  }
    xhttp.setRequestHeader("Authorization", token);
    xhttp.onload = function() {
       var parsedJson = JSON.parse(xhttp.responseText)
       var message = parsedJson.message;
       console.log("message: " + message);
       var success = parsedJson.success;
       if (success){
         var data = parsedJson.data;
         if (home){
           document.getElementById('homeWall').innerHTML = "";
           //var counter = 0;
           for(var i = 0; i < data.length; i++){

             /*var newDiv = document.createElement("div");
             document.getElementById('newDiv').innerHTML = "";
             var newId = "msg" + counter;

             document.getElementById('homeWall').appendChild(div);
             newDiv.id = newId;*/

             if(i % 2 == 0){
               document.getElementById('homeWall').innerHTML += data[i] += ": ";
             }
             else{
               document.getElementById('homeWall').innerHTML += data[i] += "</br>";
             }
             //counter++;
           }
         }
         else{
           document.getElementById('browseWall').innerHTML = "";
           for(var i = 0; i < data.length; i++){
             if(i % 2 == 0){
               document.getElementById('browseWall').innerHTML += data[i] += ": ";
             }
             else{
               document.getElementById('browseWall').innerHTML += data[i] += "</br>";
             }
           }
         }
       }
    };
    xhttp.send();
}

function postToWall(){
  var token = localStorage.getItem('token');
  if(document.getElementById('homePanel').style.display == 'flex'){
    var email =  document.getElementById('uEmail').innerHTML;
    var message = document.getElementById("homeTextArea").value;
  }
  else{
    var email = document.getElementById('uEmail2').innerHTML;
    var message = document.getElementById("browseTextArea").value;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/post", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.onload = function() {
     var parsedJson = JSON.parse(xhttp.responseText)
     var message = parsedJson.message;
     console.log("message: " + message);
     var success = parsedJson.success;
     if (success){
       updateWall();
     }
  };

  //flask_bcrypt ???

  var salt = message + email;
  var hashSalt = token + salt;
  var hashToken = md5(hashSalt);
  var publicKey = document.getElementById('uEmail').innerHTML;

  xhttp.send(JSON.stringify({"hashToken": hashToken, "message": message, "receiver": email, "key": publicKey}));
};

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    var nodeCopy = document.getElementById(data).cloneNode(true);
    nodeCopy.id = "copyId";
    ev.target.appendChild(nodeCopy);
    postToWall();
}


/*FUNCTIONS FOR BROWSE PANEL*/
function searchUser(){
  var token = localStorage.getItem('token');
  var searchEmail = document.getElementById('findEmail').value;

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/findother/" + searchEmail, true);
  xhttp.setRequestHeader("Authorization", token);
  xhttp.onload = function() {
     var parsedJson = JSON.parse(xhttp.responseText)
     var message = parsedJson.message;
     console.log("message: " + message);
     var success = parsedJson.success;
     if (success){
       var data = parsedJson.data;
       document.getElementById('uName2').innerHTML = data.firstname;
       document.getElementById('uLastname2').innerHTML = data.familyname;
       document.getElementById('uGender2').innerHTML = data.gender;
       document.getElementById('uCity2').innerHTML = data.city;
       document.getElementById('uCountry2').innerHTML = data.country;
       document.getElementById('uEmail2').innerHTML = data.email;
       document.getElementById('displayUser').style.display = 'flex';
       document.getElementById('displayWall').style.display = 'flex';
       document.getElementById('displayText').style.display = 'flex';
       document.getElementById('searchMessage').style.color = 'green';
       updateWall();
     }
     else{
       document.getElementById('searchMessage').style.color = 'red'
     }
     document.getElementById('searchMessage').innerHTML = message;
     setTimeout(function(){document.getElementById('searchMessage').innerHTML = "";}, 3000);
  };
  xhttp.send();
};

/*FUNCTIONS FOR SHOWING A PANEL*/
function showHomePanel(){
  document.getElementById('homeTab').style.backgroundColor = 'DeepPink';
  document.getElementById('browseTab').style.backgroundColor = 'darkmagenta';
  document.getElementById('accountTab').style.backgroundColor = 'darkmagenta';

  document.getElementById('homePanel').style.display = 'flex';
  document.getElementById('browsePanel').style.display = 'none';
  document.getElementById('accountPanel').style.display = 'none';
};

function showBrowsePanel(){
  document.getElementById('homeTab').style.backgroundColor = 'darkmagenta';
  document.getElementById('browseTab').style.backgroundColor = 'DeepPink';
  document.getElementById('accountTab').style.backgroundColor = 'darkmagenta';

  document.getElementById('homePanel').style.display = 'none';
  document.getElementById('browsePanel').style.display = 'flex';
  document.getElementById('accountPanel').style.display = 'none';
};

function showAccountPanel(){
  document.getElementById('homeTab').style.backgroundColor = 'darkmagenta';
  document.getElementById('browseTab').style.backgroundColor = 'darkmagenta';
  document.getElementById('accountTab').style.backgroundColor = 'DeepPink';

  document.getElementById('homePanel').style.display = 'none';
  document.getElementById('browsePanel').style.display = 'none';
  document.getElementById('accountPanel').style.display = 'flex';
};
