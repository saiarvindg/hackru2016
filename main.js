//var url = "127.0.0.1:1337";
var url = "http://da87c870.ngrok.io/";

var socketio = io.connect(url);

// initialize leap motion variables
var ws;
var paused = false;
var pauseOnGesture = false;
var focusListener;
var blurListener;

// initialize counters
var numFingers = 0;
var count = 0;
var msgSent = false;


// recieve message
socketio.on("message_to_client", function(data) {

	// reset message
	document.getElementById("msg").innerHTML = data['message'] == "It's a tie?";

	setTimeout(function() {

		// reset message
		document.getElementById("msg").innerHTML = "Play again!";

		// reset counters
		numFingers = 0;
		count = 0;
		msgSent = false;

	}, 3000);

	// print result
	console.log(data);
	document.getElementById("output").style.visibility = "visible"
	document.getElementById("chatlog").innerHTML = ( document.getElementById("chatlog").innerHTML + data['message'] + "<hr/>");

});


// send message
function sendMessage(msg) {
	//var msg = document.getElementById("message_input").value;
	console.log({ message : msg, username : document.getElementById("user").value });
	socketio.emit("message_to_server", { message : msg, username : document.getElementById("user").value });
}



// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
    WebSocket = MozWebSocket;
}

// Create the socket with event handlers
function init() {
    // Create and open the socket
    ws = new WebSocket("ws://localhost:6437/v6.json");

    // On successful connection
    ws.onopen = function(event) {
        var enableMessage = JSON.stringify({enableGestures: true});
        ws.send(enableMessage); // Enable gestures
        ws.send(JSON.stringify({focused: true})); // claim focus

        focusListener = window.addEventListener('focus', function(e) {
                               ws.send(JSON.stringify({focused: true})); // claim focus
                         });

        blurListener = window.addEventListener('blur', function(e) {
                               ws.send(JSON.stringify({focused: false})); // relinquish focus
                         });

        document.getElementById("main").style.visibility = "visible";
        document.getElementById("connection").innerHTML = "WebSocket connection open!";
		document.getElementById("connection").style.visibility = "hidden"
    };

    // On message received
    ws.onmessage = function(event) {
        if (!paused) {
            var obj = JSON.parse(event.data);

			// Parse JSON Object
			parseFrame(obj);

            //var str = JSON.stringify(obj, undefined, 2);
            //document.getElementById("output").innerHTML = '<pre>' + str + '</pre>';
            if (pauseOnGesture && obj.gestures.length > 0) {
                togglePause();
            }
        }
    };

    // On socket close
    ws.onclose = function(event) {
        ws = null;
        window.removeListener("focus", focusListener);
        window.removeListener("blur", blurListener);
        document.getElementById("main").style.visibility = "hidden";
        document.getElementById("connection").innerHTML = "WebSocket connection closed";
    }

    // On socket error
    ws.onerror = function(event) {
      alert("Received error");
    };


}

function parseFrame(data) {

	var num = 0;

	if (msgSent == true || data.hands == undefined || data.hands.length == 0) {
		document.getElementById("finger1").innerHTML = "false";
		document.getElementById("finger2").innerHTML = "false";
		document.getElementById("finger3").innerHTML = "false";
		document.getElementById("finger4").innerHTML = "false";
		document.getElementById("finger5").innerHTML = "false";
		return;
	}

	// reset message
	document.getElementById("msg").innerHTML = "Keep steady!";

	//console.log("called");
	pointables = data.pointables;
	if (pointables != undefined && pointables[0] != undefined) {
		document.getElementById("finger1").innerHTML = data.pointables[0].extended;
		if (data.pointables[0].extended) {
			num++;
		}
	} else {
		document.getElementById("finger1").innerHTML = "false";
	}

	if (pointables != undefined && pointables[1] != undefined) {
		document.getElementById("finger2").innerHTML = data.pointables[1].extended;
		if (data.pointables[1].extended) {
			num++;
		}
	} else {
		document.getElementById("finger2").innerHTML = "false";
	}

	if (pointables != undefined && pointables[2] != undefined) {
		document.getElementById("finger3").innerHTML = data.pointables[2].extended;
		if (data.pointables[2].extended) {
			num++;
		}
	} else {
		document.getElementById("finger3").innerHTML = "false";
	}

	if (pointables != undefined && pointables[3] != undefined) {
		document.getElementById("finger4").innerHTML = data.pointables[3].extended;
		if (data.pointables[3].extended) {
			num++;
		}
	} else {
		document.getElementById("finger4").innerHTML = "false";
	}

	if (pointables != undefined && pointables[4] != undefined) {
		document.getElementById("finger5").innerHTML = data.pointables[4].extended;
		if (data.pointables[4].extended) {
			num++;
		}
	} else {
		document.getElementById("finger5").innerHTML = "false";
	}

	console.log(num);
	if (num == numFingers) {
		count++;
		if (count == 200) {
			document.getElementById("msg").innerHTML = "Message sent!";
			msgSent = true;

			setTimeout(function() {
				sendMessage(numFingers);
			}, 1000);

		}
	} else {
		numFingers = num;
		count = 0;
	}
}