_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
_octave = 4;
keyboards = {};

function createKeyboard(keyboardID, octavesUp = 0, octavesDown = 0,inputArray = null, synthIn = Tone.Synth) {
	console.debug("Creating Keyboard - " + keyboardID);
	
	keyboards[keyboardID] = {};
	keyboards[keyboardID]["synth"] = new Tone.PolySynth(synthIn).toDestination();
	
	// if(inputArray){
		// keyboards[keyboardID]["inputs"] = inputArray;
	// }
	
	var visualKeyboard = document.getElementById(keyboardID);
	var whiteKeys = 0;
	
	for(var i=-octavesDown; i < octavesUp + 1; i++) {			//Loop through each octave requested
		for(var note of _notes) {					//Loop through each key in each octave
			var keyNote = note + (_octave + i)
			var thisKey = document.createElement("div");		//Create the key as a div
			if(note.length > 1) {								//Create A Black Key
				thisKey.className = "black key";
				thisKey.style.width = "30px";
				thisKey.style.height = "120px";
				thisKey.style.left = (40 * (whiteKeys - 1)) + 25 + "px";
			} else {											//Create A White Key
				thisKey.className = "white key";
				thisKey.style.width = "40px";
				thisKey.style.height = "200px";
				thisKey.style.left = 41 * whiteKeys + "px";
				whiteKeys++;
			}
			
			var label = document.createElement('div');			//Create the label for the key
			label.className = 'label';
			label.innerHTML = note.substr(0,1) +				//Only show the octave label if there's more than one
								(octavesUp + octavesDown?(_octave + i):'') +
								(note.substr(1,1)?note.substr(1,1):'');
			if(i == 0 & note == "C"){							//Mark middle C
				label.style.color = "red";
				label.style.fontWeight = "bold";
			}
			thisKey.appendChild(label);							//Add the label to the key
			
			thisKey.setAttribute("ID", keyboardID + keyNote);	//Give the key an ID
			
			//Set MouseDown, MouseOver, MouseUp, and MouseLeave events on each key
			mdFunc = function(tempNote) {return function(){						   playKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);}};
			moFunc = function(tempNote) {return function(e){if(e.buttons == 1)	   playKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);}};
			muFunc = function(tempNote) {return function(){						releaseKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);}};
			//mlFunc = function(tempNote) {return function()						{releaseKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);}} //repeat, probably don't need
			
			//Add the event listeners
			thisKey.addEventListener("mousedown",  mdFunc(keyNote));
			thisKey.addEventListener("mouseover",  moFunc(keyNote));
			thisKey.addEventListener("mouseup",    muFunc(keyNote));
			thisKey.addEventListener("mouseleave", muFunc(keyNote));
			
			// if(inputArray && keyNote in inputArray){
				// console.log("test1 - " + inputArray[keyNote]);
				// kdFunc = function(tempNote, toTest) {
					// return function(e, toTest){
						// console.log(e);
						// console.log("test2 - " + toTest);
						// if(e.key == toTest)
							// playKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);
					// }
				// };
				// document.addEventListener("keydown", kdFunc(keyNote), inputArray[keyNote]);
			// }
			
			visualKeyboard.appendChild(thisKey);				//Add the key to the keyboard
		}
	}
	keyboards[keyboardID]["uv"] = setInterval(updateVoices, 100, keyboardID);
	visualKeyboard.style.width = whiteKeys * 41 + 1 + "px";			//Space the keyboard div properly
	updateVolume(keyboardID); //Make sure the volume is properly set
}
function deleteKeyboard(keyboardID){
	console.debug("Destroying Keyboard - " + keyboardID);
	clearInterval(keyboards[keyboardID]["uv"]);
	document.getElementById(keyboardID).innerHTML = "";
	removeEventListener("mousedown",  keyboards[keyboardID]["md"]);
	removeEventListener("mouseover",  keyboards[keyboardID]["mo"]);
	removeEventListener("mouseup",    keyboards[keyboardID]["mu"]);
	removeEventListener("mouseleave", keyboards[keyboardID]["ml"]);
	delete keyboards[keyboardID];
}
function updateKeyboard(kbID){
	deleteKeyboard(kbID);
	createKeyboard(kbID, valOf(kbID + "OctUp"), valOf(kbID + "OctDown"),);
}

function playKey(keyboardID, synthIn, noteIn){
	synthIn.triggerAttack(noteIn);
	document.getElementById(keyboardID + noteIn).classList.add("playing");
	updateVoices(keyboardID);
}
function releaseKey(keyboardID, synthIn, noteIn){
	synthIn.triggerRelease(noteIn);
	document.getElementById(keyboardID + noteIn).classList.remove("playing");
	updateVoices(keyboardID);
}

function createKeybox(kbID, kbName){
	mainWindow = document.getElementsByTagName("main")[0];
	
	keybox = document.createElement("div");
	keybox.className = "keybox";
	keybox.setAttribute("ID", kbID + "Box");
	keybox.innerHTML = "<div id='" + kbID + "CurVoices'></div>"; //Create voice counter
	
	kb = document.createElement("div");
	kb.className = "keyboard";
	kb.setAttribute("ID", kbID);
	keybox.appendChild(kb);
	
	kbControls = document.createElement("div");
	kbControls.className = "keyboardControls";
	kbControls.innerHTML = kbName + " Controls:\<\/br\>\<\/br\>Volume:";
	
	kbVolume = document.createElement("input");
	kbVolume.type = "range";
	kbVolume.min = "-40";
	kbVolume.max = "15";
	kbVolume.value = "-15";
	kbVolume.className = "slider";
	kbVolume.setAttribute("ID", kbID + "Volume");
	kbVolume.setAttribute("onchange", "updateVolume('"+ kbID +"');");
	
	kbControls.appendChild(kbVolume);
	keybox.appendChild(kbControls);
	
	mainWindow.appendChild(keybox);
}
function deleteKeybox(kbID){
	deleteKeyboard(kbID);
	document.getElementById(kbID + "Box").remove();
	document.getElementById(kbID + "Create").disabled = false;
	document.getElementById(kbID + "Delete").disabled = true;
}

function newKeyboard(kbID, kbName, inputIn){
	createKeybox(kbID, kbName);
	createKeyboard(kbID, valOf(kbID + "OctUp"), valOf(kbID + "OctDown"), inputArray = inputIn);
	document.getElementById(kbID + "Create").disabled = true;
	document.getElementById(kbID + "Delete").disabled = false;
}

function createKeyboardControl(kbID, kbName){
	kbSidebar = document.getElementById("keyboardSidebar");
	
	optionBox = document.createElement("div");
	optionBox.className = "keyboardOptions";
	optionBox.setAttribute("ID", kbID + "Options");
	optionBox.innerHTML = "<span>" + kbName + ":</span>";
	
	buttonTable = document.createElement("table");
	buttonTable.className = "createDeleteButtons";
	buttonTable.innerHTML = "<tr><td><button id='" + kbID + "Create' onclick='newKeyboard(\"" + kbID + "\",\"" + kbName + "\")\'>Create</button></td><td><button id='" + kbID + "Delete' onclick='deleteKeybox(\"" + kbID + "\")'>Delete</button></td></tr>";
	optionBox.appendChild(buttonTable);
	
	sizeTable = document.createElement("table");
	sizeTable.className = "keyboardSizes";
	sizeTable.setAttribute("ID", kbID + "Sizes");
	sizeTable.innerHTML = "<tr><td>Octaves Up:</td><td><input type='number' min='0' max='3' value='0' class='octaveSelector' id='" + kbID + "OctUp' onchange='updateKeyboard(\"" + kbID + "\");'></td></tr>";
	sizeTable.innerHTML += "<tr><td>Octaves Down:</td><td><input type='number' min='0' max='3' value='0' class='octaveSelector' id='" + kbID + "OctDown' onchange='updateKeyboard(\"" + kbID + "\");'></td></tr>";
	optionBox.appendChild(sizeTable);
	
	kbSidebar.appendChild(optionBox);
}

function updateVoices(keyboardID){
	document.getElementById(keyboardID+"CurVoices").innerHTML = keyboards[keyboardID]["synth"].activeVoices + " / " + keyboards[keyboardID]["synth"].maxPolyphony;
}
function updateVolume(keyboardID){
	keyboards[keyboardID]["synth"].volume.value = document.getElementById(keyboardID + "Volume").value;
}
function valOf(idIn){
	return Number(document.getElementById(idIn).value);
}
