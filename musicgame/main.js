const synth = new Tone.PolySynth(Tone.Synth).toDestination();

_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
_octave = 4

function playNote(){
	synth.triggerAttackRelease("C4", "8n");
}

function createKeyboard(octavesUp = 0, octavesDown = 0) {
	console.debug("Creating Keyboard");
	
	var visualKeyboard = document.getElementById("keyboard");
	var whiteKeys = 0;

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

			thisKey.setAttribute("ID", label.innerHTML);	//Give the key an ID
			
			mdFunc = function(tempNote) {return function(){synth.triggerAttack(tempNote);updateVoices();}}
			moFunc = function(tempNote) {return function(e){if(e.buttons == 1){synth.triggerAttack(tempNote);updateVoices();}}}
			muFunc = function(tempNote) {return function(e){synth.triggerRelease(tempNote);updateVoices();}}
			mlFunc = function(tempNote) {return function(e){synth.triggerRelease(tempNote);updateVoices();}}
			
			thisKey.addEventListener("mousedown", mdFunc(note + (_octave + i)));
			thisKey.addEventListener("mouseover", moFunc(note + (_octave + i)));
			thisKey.addEventListener("mouseup",   muFunc(note + (_octave + i)));
			thisKey.addEventListener("mouseleave",   mlFunc(note + (_octave + i)));
			//keyboard[label.innerHTML] = tempFunc(note, _octave + i)

			visualKeyboard.appendChild(thisKey);				//Add the key to the keyboard
			window.setInterval(updateVoices, 100)
		}
	}
	
	visualKeyboard.style.width = whiteKeys * 40 + "px";			//Space the keyboard div properly
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