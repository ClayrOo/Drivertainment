 $(document).ready(function(){
 	
 	/**
 	 * 
 	 * 	CONNECTION TO BROKER
 	 * 
 	 */
 
				// Create a client instance: Broker, Port, Websocket Path, Client ID
				client = new Paho.MQTT.Client("wjajfh.messaging.internetofthings.ibmcloud.com", Number(443), "d:wjajfh:Car:Car-01");
				
				// set callback handlers
				client.onConnectionLost = function (responseObject) {
				    alert("Connection Lost: "+responseObject.errorMessage);
				}
				
				client.onMessageArrived = function (message) {
				  //alert("Message Arrived: "+message.payloadString);
				  action(JSON.parse(message.payloadString)["DriverStatus"]);
				}
				
				// Called when the connection is made
				function onConnect(){
					client.subscribe("iot-2/cmd/driverstatus/fmt/json");
					
				}
				
				function onFail(responseObject){
				    alert("Failed! " + responseObject.errorMessage);
				}
				
				// Connect the client, providing an onConnect callback
				client.connect({
				    onSuccess: onConnect,
				    onFailure : onFail,
				    useSSL : true,
					userName : "use-token-auth",
				    password : "4YYUu*fo4JrB7t@qDQ"
				});	 

	/**
	 * 
	 * 	VARIABLES
	 * 
	 */
				var carOn = false;
				var speed = 0;
				var startTime = 0;
				var originHeight = 1080;
				var originWidth = 1920;
				var screenHeight = 214;
				var screenWidth = 309;
				var actionAudio = new Audio('Sounds/brake.mp3');
				var carAudio = new Audio('Sounds/brake.mp3');
				var carOnAudio = new Audio('Sounds/motoron.mp3');
				carOnAudio.addEventListener('ended', function() {
					if(carOn == true){
						this.currentTime = 0;
						this.play();
					}
				}, false);
				var buttonCoords = {"speedButton" : [824,872,857,872,835,1035,781,1040,790,1025,796,984,802,931,804,902],
									"brakeButton" : [551,856,568,859,583,889,605,915,607,1031,578,1032,543,1018],
									"honkButton" : [695,837,90],
									"startstopButton" : [827,772,886,783,909,791,921,807,924,821,925,836,918,843,911,848,838,840]
									};
				
				$(window).resize(function() {
					remap();
				});
				document.getElementById("speedDisplay").innerHTML = speed;
				
				var $boolSpeed = 0;
				setInterval(function () {
					if($boolSpeed == -1){
						//slowing down
						if(speed > 0){
							speed -= 10;
							document.getElementById("speedDisplay").innerHTML = speed.toString();
						}
					} else if($boolSpeed == 1){
						//speeding up
						if(speed < 250){
							speed += 10;
							document.getElementById("speedDisplay").innerHTML = speed.toString();
						}
					}
				}, 400);
  
  				remap();

	/**
	 * 
	 * 	Button Functions
	 * 
	 */
	

				$('#honkButton').on("click", function(e){
					e.preventDefault();
					if(carOn == true){
			  			sendMessage("honk");
			  			carAudio = new Audio('Sounds/horn.mp3');
						carAudio.play();
					}
				});
				
				
			    $("#speedButton").on("mousedown", function(e) {
					e.preventDefault();
					if(carOn == true){
						$("#carImage").attr("src", "ImagesNew/SpeedPedalOn.jpg");
						if(speed < 250){
							$boolSpeed = 1;
							startTime = (new Date()).getTime();
							carAudio = new Audio('Sounds/acceleration.mp3');
							carAudio.play();
						}
					}
				});
			
				$("#speedButton").on("click", function(e) {
					e.preventDefault();
					if(carOn == true){
						$("#carImage").attr("src", "ImagesNew/CarisOn.jpg");
						$boolSpeed = 0;
						sendMessage("speedPedal");
					}
				});
				
				$("#brakeButton").on("click", function(e) {
					e.preventDefault();
					if(carOn == true){
						$("#carImage").attr("src", "ImagesNew/CarisOn.jpg");
						$boolSpeed = 0;
						sendMessage("brakePedal");
					}
				});
				
				$("#brakeButton").on("mousedown", function(e) {
					e.preventDefault();
					if(carOn == true){
						$("#carImage").attr("src", "ImagesNew/BrakePedalOn.jpg");
						if (speed > 0){
							$boolSpeed = -1;
							startTime = (new Date()).getTime();
							carAudio = new Audio('Sounds/brake.mp3');
							carAudio.play();
						}
					}
				});
				
			
				$("#startstopButton").on("click", function(e) {
					e.preventDefault();
					if(carOn == false){
						$("#carImage").attr("src", "ImagesNew/CarisOn.jpg");
						carOn = true;
						carAudio = new Audio('Sounds/carstart2.mp3');
						carAudio.play();
						carOnAudio.play();
					} else if(carOn == true) {
						$("#carImage").attr("src", "ImagesNew/Carisoff.jpg");
						carOn = false;
						carOnAudio.pause();
						actionAudio.pause();
						carAudio.pause();
						$boolSpeed = 0;
						speed = 0;
						document.getElementById("speedDisplay").innerHTML = speed.toString();
						document.getElementById("screen").style.visibility = "hidden";
					}
					sendMessage("startStop");
				});
	
	/*
	 * 
	 * 	FUNCTIONS
	 * 
	 */

				function sendMessage(msgtype) {
					var falseMessage = false;
					var messageJSON = {};
					switch(msgtype) {
			    		case "speedPedal":
			    			messageJSON['speedPedal'] = (new Date()).getTime() - startTime;
			        		break;
			    		case "brakePedal":
			    			messageJSON['brakePedal'] = (new Date()).getTime() - startTime;
			        		break;
			        	case "honk":
			        		messageJSON['honk'] = parseFloat(1);
			        		break;
			        	case "startStop":
			        		messageJSON['startStop'] = carOn ? 1 : 0;
			        		break;
			        	default:
			        		falseMessage = true;
			  				break;
					}
					if(!falseMessage){
						var message = new Paho.MQTT.Message(JSON.stringify(messageJSON));
						message.destinationName = "iot-2/evt/status/fmt/json";
						client.send(message);
					}
				}
				
				function action(driverstatus){
					switch(driverstatus){
						case "Upset":
							$("#screenImage").attr("src", "ImagesNew/karmachameleon.png");
							actionAudio.pause();
							actionAudio = new Audio('Sounds/Karma Chameleon.m4a');
							actionAudio.play();
							break;
						case "Traffic":
							$("#screenImage").attr("src", "ImagesNew/waze.png");
							break;
						case "Tired":
							$("#screenImage").attr("src", "ImagesNew/audiobook.png");
							actionAudio.pause();
							actionAudio = new Audio('Sounds/audiobook.m4a');
							actionAudio.play();
							break;
					}
					document.getElementById("screen").style.visibility = "visible";
				}

				
				
				function remap() {
					
					var windowWidth = $(window).width();
					var windowHeight = $(window).height();					
					
					
					
					if(windowWidth/originWidth > windowHeight/originHeight){

						$('#carImage').css({'width' : 'auto' , 'height' : windowHeight});
					} else {
						$('#carImage').css({'width' : windowWidth , 'height' : 'auto'});
						
					}
					

					var currentHeight = document.getElementById("carImage").height;
					var currentWidth = document.getElementById("carImage").width;
					
					
					
					
					var buttonElements = document.getElementsByClassName("button");
					

					for(i = 0; i < buttonElements.length; i++){
						var id = buttonElements[i].id;

						var originCoords = buttonCoords[id];
						var newCoords = "";
						
						for(j = 0; j < originCoords.length; j++){
							
							if(j != 0){
								newCoords += ",";
							}
							
							var c = originCoords[j];
							var newC;
							if(j%2==0){
								//X coordinate
								newC = Math.round(c/originWidth*currentWidth);
							} else {
								//Y coordinate
								newC = Math.round(c/originHeight*currentHeight);
							}
			
							newCoords += newC;
						}
						document.getElementById(id).coords = newCoords;
					}
					
					//Screen
					$('#screen').css({'width' : screenWidth/originWidth*currentWidth , 'height' : screenHeight/originHeight*currentHeight , 'left' : 1150/originWidth*currentWidth, 'top' : 345/originHeight*currentHeight});
					$('#screenImage').css("width", "100%");	
					
					
					//speed area
					var textSize = "" + Math.round(30/originHeight*currentWidth) + "px";
					$('#speedDisplay').css("left", Math.round(770/originWidth*currentWidth));
					$('#speedDisplay').css("top", Math.round(575/originHeight*currentHeight));
					$('#speedDisplay').css("font-size", textSize);
				}
})