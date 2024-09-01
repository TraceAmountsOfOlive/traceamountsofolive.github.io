_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
_octave = 4;
keyboards = {};
kbInputs = {};

function createKeyboard(keyboardID, octavesUp = 0, octavesDown = 0, synthIn = Tone.Synth) {
	console.debug("Creating Keyboard -", keyboardID);
	
	keyboards[keyboardID] = {};
	keyboards[keyboardID]["synth"] = new Tone.PolySynth(synthIn).toDestination();
	
	// if(inputArray){
		// keyboards[keyboardID]["inputs"] = inputArray;
	// }
	
	var visualKeyboard = document.getElementById(keyboardID);
	var whiteKeys = 0;
	
	if(kbInputs[keyboardID]) {
		var inputArray = kbInputs[keyboardID];
		keyboards[keyboardID]["keys"] = {};
	}
	
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
			
			var hotkey = document.createElement('div');
			hotkey.className = 'hotkey';
			hotkey.innerHTML = kbInputs[keyboardID] && inputArray[keyNote] ? inputArray[keyNote].toUpperCase() : "";
			hotkey.style = "display:none";
			if(i == 0 & note == "C"){
				hotkey.style.color = "red";
				hotkey.style.fontWeight = "bold";
			}
			thisKey.appendChild(hotkey);
			
			thisKey.setAttribute("ID", keyboardID + keyNote);	//Give the key an ID
			
			//Set MouseDown, MouseOver, MouseUp, and MouseLeave events on each key
			mdFunc = function(tempNote) {return function(){						   playKey(keyboardID, tempNote);}};
			moFunc = function(tempNote) {return function(e){if(e.buttons == 1)	   playKey(keyboardID, tempNote);}};
			muFunc = function(tempNote) {return function(){						releaseKey(keyboardID, tempNote);}};
			//mlFunc = function(tempNote) {return function()						{releaseKey(keyboardID, keyboards[keyboardID]["synth"], tempNote);}} //repeat, probably don't need
			
			//Add the event listeners
			thisKey.addEventListener("mousedown",  mdFunc(keyNote));
			thisKey.addEventListener("mouseover",  moFunc(keyNote));
			thisKey.addEventListener("mouseup",    muFunc(keyNote));
			thisKey.addEventListener("mouseleave", muFunc(keyNote));
			
			if(inputArray && keyNote in inputArray) {
				kdFunc = function(tempNote, toTest) { return function(e){
					if(e.key == toTest)
						playKey(keyboardID, tempNote);
				}};
				kuFunc = function(tempNote, toTest) { return function(e){
					if(e.key == toTest)
						releaseKey(keyboardID, tempNote);
				}};
				
				keyboards[keyboardID]["keys"][label.innerHTML] = {};
				keyboards[keyboardID]["keys"][label.innerHTML]["down"] = kdFunc(keyNote, inputArray[keyNote]);
				keyboards[keyboardID]["keys"][label.innerHTML]["up"] = kuFunc(keyNote, inputArray[keyNote]);
				document.addEventListener("keydown", keyboards[keyboardID]["keys"][label.innerHTML]["down"]);
				document.addEventListener("keyup",   keyboards[keyboardID]["keys"][label.innerHTML]["up"]);
			}
			
			visualKeyboard.appendChild(thisKey);				//Add the key to the keyboard
		}
	}
	keyboards[keyboardID]["uv"] = setInterval(updateVoices, 100, keyboardID);
	visualKeyboard.style.width = whiteKeys * 41 + 1 + "px";			//Space the keyboard div properly
	updateVolume(keyboardID); //Make sure the volume is properly set
	toggleHotkeys(keyboardID); //Make sure the hotkey status matches the checkbox
}
function deleteKeyboard(keyboardID){
	console.debug("Destroying Keyboard - " + keyboardID);
	clearInterval(keyboards[keyboardID]["uv"]);
	document.getElementById(keyboardID).innerHTML = "";
	removeEventListener("mousedown",  keyboards[keyboardID]["md"]);
	removeEventListener("mouseover",  keyboards[keyboardID]["mo"]);
	removeEventListener("mouseup",    keyboards[keyboardID]["mu"]);
	removeEventListener("mouseleave", keyboards[keyboardID]["ml"]);
	if(keyboards[keyboardID]["keys"]){
		for(v in keyboards[keyboardID]["keys"]) {
			document.removeEventListener("keydown", keyboards[keyboardID]["keys"][v]["down"]);
			document.removeEventListener("keyup", keyboards[keyboardID]["keys"][v]["up"]);
		}
	}
	delete keyboards[keyboardID];
}
function updateKeyboard(kbID){
	deleteKeyboard(kbID);
	createKeyboard(kbID, valOf(kbID + "OctUp"), valOf(kbID + "OctDown"),);
}

function playKey(keyboardID, noteIn){
	if(!document.getElementById(keyboardID + noteIn).classList.contains("playing")) {
		keyboards[keyboardID]["synth"].triggerAttack(noteIn);
		document.getElementById(keyboardID + noteIn).classList.add("playing");
		updateVoices(keyboardID);
	}
}
function releaseKey(keyboardID, noteIn){
	keyboards[keyboardID]["synth"].triggerRelease(noteIn);
	document.getElementById(keyboardID + noteIn).classList.remove("playing");
	updateVoices(keyboardID);
}

function toggleHotkeys(keyboardID){
	var keys = document.getElementById(keyboardID).children;
	var checked = document.getElementById(keyboardID + "HotkeyCheckbox").checked;
	for(key in keys){
		if(keys[key] instanceof Element || keys[key] instanceof HTMLDocument) {
			//keys[key].querySelector(".label").style.display  = checked ? "none"  : "block";
			keys[key].querySelector(".hotkey").style.display = checked ? "block" : "none";
		}
	}
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
	
	kbHotkeys = document.createElement("input");
	kbHotkeys.type = "checkbox";
	kbHotkeys.className = "checkbox";
	kbHotkeys.setAttribute("ID", kbID + "HotkeyCheckbox");
	kbHotkeys.setAttribute("onchange", "toggleHotkeys('" + kbID +"');");
	kbHotkeysLabel = document.createElement("label");
	kbHotkeysLabel.for = kbID + "HotkeyCheckbox";
	kbHotkeysLabel.innerHTML = "Toggle Hotkeys";
	kbControls.appendChild(kbHotkeys);
	kbControls.appendChild(kbHotkeysLabel);
	
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
