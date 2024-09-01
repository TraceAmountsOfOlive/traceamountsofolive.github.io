const synth = new Tone.PolySynth(Tone.Synth).toDestination();
kbInputs = {};

function createKeyboard(keyboardID, octavesUp = 0, octavesDown = 0, synthIn = Tone.Synth) {
	console.debug("Creating Keyboard -", keyboardID);

function playNote(){
	synth.triggerAttackRelease("C4", "8n");
}

function createKeyboard(octavesUp = 0, octavesDown = 0) {
	console.debug("Creating Keyboard");
	
	var visualKeyboard = document.getElementById("keyboard");
	var whiteKeys = 0;

	if(kbInputs[keyboardID]) {
		var inputArray = kbInputs[keyboardID];
		keyboards[keyboardID]["keys"] = {};
	}
	
	for(var i=-octavesDown; i < octavesUp + 1; i++) {			//Loop through each octave requested
		for(var note of _notes) {					//Loop through each key in each octave
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
				thisKey.style.left = 40 * whiteKeys + "px";
				whiteKeys++;
			}

			var label = document.createElement('div');			//Create the label for the key
			label.className = 'label';
			label.innerHTML = note.substr(0,1) +				//Only show the octave label if there's more than one
								(octavesUp + octavesDown?(_octave + i):'') +
								(note.substr(1,1)?note.substr(1,1):'');
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
			
			mdFunc = function(tempNote) {return function(){						   playKey(keyboardID, tempNote);}};
			moFunc = function(tempNote) {return function(e){if(e.buttons == 1)	   playKey(keyboardID, tempNote);}};
			muFunc = function(tempNote) {return function(){						releaseKey(keyboardID, tempNote);}};
			
			mdFunc = function(tempNote) {return function(){synth.triggerAttack(tempNote);updateVoices();}}
			moFunc = function(tempNote) {return function(e){if(e.buttons == 1){synth.triggerAttack(tempNote);updateVoices();}}}
			muFunc = function(tempNote) {return function(e){synth.triggerRelease(tempNote);updateVoices();}}
			mlFunc = function(tempNote) {return function(e){synth.triggerRelease(tempNote);updateVoices();}}
			
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
			window.setInterval(updateVoices, 100)
		}
	}
	toggleHotkeys(keyboardID); //Make sure the hotkey status matches the checkbox
	if(keyboards[keyboardID]["keys"]){
		for(v in keyboards[keyboardID]["keys"]) {
			document.removeEventListener("keydown", keyboards[keyboardID]["keys"][v]["down"]);
			document.removeEventListener("keyup", keyboards[keyboardID]["keys"][v]["up"]);
		}
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

	
	visualKeyboard.style.width = whiteKeys * 40 + "px";			//Space the keyboard div properly
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
}

function updateVoices() {
	document.getElementById("curVoices").innerHTML = synth.activeVoices + " / " + synth.maxPolyphony;
}

function updateVolume() {
	synth.volume.value = document.getElementById("volumeSlider").value;
}

function deleteKeyboard(){
	console.debug("Destroying Keyboard");
	document.getElementById("keyboard").innerHTML = "";
	keyboard = {};
}