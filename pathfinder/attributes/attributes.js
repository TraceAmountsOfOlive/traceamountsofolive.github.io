const Rarity = {
	COMMON: 1,
	UNCOMMON: 2,
	RARE: 3
};
function getRarity(rarity) {
	switch(rarity) {
		case Rarity.COMMON:   return "Common";
		case Rarity.UNCOMMON: return "Uncommon";
		case Rarity.RARE:     return "Rare";
	}
	return null;
}

const Attr = {
	NON: 1,
	CHA: 2,
	CON: 4,
	DEX: 8,
	INT: 16,
	STR: 32,
	WIS: 64
};
function getAttr(attr) {
	switch(attr) {
		case Attr.NON: return "-";
		case Attr.CHA: return "CHA";
		case Attr.CON: return "CON";
		case Attr.DEX: return "DEX";
		case Attr.INT: return "INT";
		case Attr.STR: return "STR";
		case Attr.WIS: return "WIS";
	}
	return null;
}

class Ancestry {
	constructor(name, rarity, boostOne, boostTwo, flaw) {
		this.name = name;
		this.rarity = rarity;
		this.boostOne = boostOne;
		this.boostTwo = boostTwo;
		this.boosts = boostOne | boostTwo;
		this.allBoosts = boostOne + boostTwo;
		this.flaw = flaw;
	}

	compare(other) {
		if(this.rarity < other.rarity) {
			return -1;
		} else if(this.rarity > other.rarity) {
			return 1;
		} else {
			return this.name.localeCompare(other.name);
		}
	}

	toString() {
		return this.name;
	}
}

function createRow() {
	var row = document.createElement("tr");
	for (const argument of arguments) {
		var cell = document.createElement("td");
		cell.setHTML(argument[0]);
		if(argument[1]) {
			cell.setAttribute("class", argument[0]);
		}
		row.appendChild(cell);
	}
	return row;
}
function createHeaderRow() {
	var row = document.createElement("tr");
	for (const argument of arguments) {
		var cell = document.createElement("th");
		cell.setHTML(argument);
		row.appendChild(cell);
	}
	return row;
}

function updateTable() {
	var main = document.getElementById("ancestry-table-wrapper");
	main.setHTML(""); // Clear the table
	var table = document.createElement("table");
	var tHead = document.createElement("thead");
	var tBody = document.createElement("tbody");
	//var tFoot = document.createElement("tfoot");
	table.setAttribute("id", "ancestryTable");
	table.appendChild(tHead);
	table.appendChild(tBody);
	//table.appendChild(tFoot);
	tHead.appendChild(createHeaderRow("Ancestry", "Rarity", "B1", "B2", "F"));

	// Collect the boost data
	var allBoosts = document.getElementById("needs-all-boosts-checkbox").checked;
	var numBoosts = 0;
	var possibleBoosts = 0b0;
	var boostArray;
	for(var i = 1; i <= 6; i++) {
		var val = document.getElementById("boost-dropdown-" + i).value;
		possibleBoosts |= val;
		if (val > 0) numBoosts++;
	}
	if (numBoosts == 1) allBoosts = false; // Needing every 'one boost' doesn't make logical sense
	if (allBoosts) { // If we need the ancestry to match every boost, keep track of each combination
		var valOne = document.getElementById("boost-dropdown-1").value;
		var valTwo = document.getElementById("boost-dropdown-2").value;
		var valThr = document.getElementById("boost-dropdown-3").value;
		boostArray = [valOne | valTwo | 1, valTwo | valThr | 1, valOne | valThr | 1]; // Get every combination of two boosts and a free boost
	}
	var notBoosts = 0b0;
	for(var i = 1; i <= 6; i++) {
		notBoosts |= document.getElementById("no-boost-dropdown-" + i).value;
	}

	// Collect the flaw data
	var needsFlaw = document.getElementById("needs-flaw-checkbox").checked;
	var possibleFlaws = 0b0;
	for(var i = 1; i <= 6; i++) {
		possibleFlaws |= document.getElementById("flaw-dropdown-" + i).value;
	}
	var notFlaws = 0b0;
	for(var i = 1; i <= 6; i++) {
		notFlaws |= document.getElementById("no-flaw-dropdown-" + i).value;
	}

	for(const ancestry of ancestries) {
		// Boosts
		if (possibleBoosts) {
			// If we're looking for a specific spread of boosts
			if (allBoosts) {
				switch (numBoosts) {
				case 3:
					//If the ancestry has two of the three boosts and doesn't have a flaw in any, let them through
					if(!(boostArray.includes(ancestry.boosts | 1)) || (possibleBoosts & ancestry.flaw))
						continue;
				break;
				case 2:
					// If the ancestry has one or both boosts (or is human), let them through
					if(!(boostArray.includes(ancestry.boosts | 1)) && (ancestry.boostOne != Attr.NON))
						continue;
				break;
				//If there's only one boost, default to the normal behavior
				default: if(!(ancestry.boosts & possibleBoosts)) continue;
				}
			} else {
				// If the ancestry has any of the selected boosts, let them through
				if (!(ancestry.boosts & possibleBoosts)) {
					continue;
				}
			}
		}
		// If we have no-boosts selected and the ancestry doesn't have any, let them through
		if (notBoosts && (notBoosts & ancestry.boosts)) {
			continue;
		}

		// Flaws
		// If we're looking for ancestries with flaws and the ancestry has one, let them through
		if (needsFlaw && ancestry.flaw == Attr.NON) {
			continue;
		}
		// If we have flaws selected and the ancestry doesn't have any, let them through
		if (possibleFlaws && !(possibleFlaws & ancestry.flaw)) {
			continue;
		}
		// If we have no-flaws selected and the ancestry doesn't have any, let them through
		if (notFlaws && (notFlaws & ancestry.flaw)) {
			continue;
		}
		tBody.appendChild(createRow(
			[ancestry.name, false],
			[getRarity(ancestry.rarity), true],
			[getAttr(ancestry.boostOne), true],
			[getAttr(ancestry.boostTwo), true],
			[getAttr(ancestry.flaw), true]
		));
	}
	main.appendChild(table);
}

function updateBoosts() {
	var allBoosts = document.getElementById("needs-all-boosts-checkbox").checked;
	if (allBoosts) {
		for(var i = 4; i <= 6; i++) {
			var dropdown = document.getElementById("boost-dropdown-" + i);
			dropdown.value = 0;
			dropdown.setAttribute("disabled", true);
		}
	} else {
		for(var i = 4; i <= 6; i++) {
			var dropdown = document.getElementById("boost-dropdown-" + i);
			dropdown.removeAttribute("disabled");
		}
	}
	updateTable();
}

function clearBoosts(skipUpdate) {
	// Reset the boosts
	document.getElementById("needs-all-boosts-checkbox").checked = false;
	for(var i = 1; i <= 6; i++) {
		document.getElementById("boost-dropdown-" + i).value = 0;
		document.getElementById("boost-dropdown-" + i).removeAttribute("disabled");
	}
	for(var i = 1; i <= 6; i++) {
		document.getElementById("no-boost-dropdown-" + i).value = 0;
	}
	if(!skipUpdate)
		updateTable();
}

function clearFlaws(skipUpdate) {
	// Reset the flaws
	document.getElementById("needs-flaw-checkbox").checked = false;
	for(var i = 1; i <= 6; i++) {
		document.getElementById("flaw-dropdown-" + i).value = 0;
	}
	for(var i = 1; i <= 6; i++) {
		document.getElementById("no-flaw-dropdown-" + i).value = 0;
	}
	if(!skipUpdate)
		updateTable();
}

function clearFilters() {
	clearBoosts(true);
	clearFlaws(true);
	updateTable()
}

var ancestries = [
	new Ancestry("Dwarf",                Rarity.COMMON,   Attr.CON, Attr.WIS, Attr.CHA),
	new Ancestry("Elf",                  Rarity.COMMON,   Attr.DEX, Attr.INT, Attr.CON),
	new Ancestry("Gnome",                Rarity.COMMON,   Attr.CON, Attr.CHA, Attr.STR),
	new Ancestry("Goblin",               Rarity.COMMON,   Attr.DEX, Attr.CHA, Attr.WIS),
	new Ancestry("Halfling",             Rarity.COMMON,   Attr.DEX, Attr.WIS, Attr.STR),
	new Ancestry("Human",                Rarity.COMMON,   Attr.NON, Attr.NON, Attr.NON),
	new Ancestry("Leshy",                Rarity.COMMON,   Attr.CON, Attr.WIS, Attr.INT),
	new Ancestry("Orc",                  Rarity.COMMON,   Attr.STR, Attr.NON, Attr.NON),
	new Ancestry("Athamaru",             Rarity.UNCOMMON, Attr.STR, Attr.WIS, Attr.INT),
	new Ancestry("Azarketi",             Rarity.UNCOMMON, Attr.CON, Attr.CHA, Attr.WIS),
	new Ancestry("Bugbear",              Rarity.UNCOMMON, Attr.STR, Attr.CHA, Attr.INT),
	new Ancestry("Catfolk",              Rarity.UNCOMMON, Attr.DEX, Attr.CHA, Attr.WIS),
	new Ancestry("Centuar",              Rarity.UNCOMMON, Attr.STR, Attr.WIS, Attr.CHA),
	new Ancestry("Fetchling",            Rarity.UNCOMMON, Attr.DEX, Attr.NON, Attr.NON),
	new Ancestry("Hobgoblin",            Rarity.UNCOMMON, Attr.CON, Attr.INT, Attr.WIS),
	new Ancestry("Kholo",                Rarity.UNCOMMON, Attr.STR, Attr.INT, Attr.WIS),
	new Ancestry("Kitsune",              Rarity.UNCOMMON, Attr.CHA, Attr.NON, Attr.NON),
	new Ancestry("Kobold",               Rarity.UNCOMMON, Attr.DEX, Attr.CHA, Attr.CON),
	new Ancestry("Kobold (Mightyfall)",  Rarity.UNCOMMON, Attr.STR, Attr.CHA, Attr.INT),
	new Ancestry("Lizardfolk",           Rarity.UNCOMMON, Attr.STR, Attr.WIS, Attr.INT),
	new Ancestry("Merfolk",              Rarity.UNCOMMON, Attr.DEX, Attr.CHA, Attr.CON),
	new Ancestry("Minotaur",             Rarity.UNCOMMON, Attr.STR, Attr.CON, Attr.CHA),
	new Ancestry("Nagaji",               Rarity.UNCOMMON, Attr.STR, Attr.NON, Attr.NON),
	new Ancestry("Ratfolk",              Rarity.UNCOMMON, Attr.DEX, Attr.INT, Attr.STR),
	new Ancestry("Samsaran",             Rarity.UNCOMMON, Attr.CON, Attr.WIS, Attr.CHA),
	new Ancestry("Tanuki",               Rarity.UNCOMMON, Attr.CON, Attr.CHA, Attr.WIS),
	new Ancestry("Tengu",                Rarity.UNCOMMON, Attr.DEX, Attr.NON, Attr.NON),
	new Ancestry("Tripkee",              Rarity.UNCOMMON, Attr.DEX, Attr.WIS, Attr.STR),
	new Ancestry("Vanara",               Rarity.UNCOMMON, Attr.DEX, Attr.NON, Attr.NON),
	new Ancestry("Wayang",               Rarity.UNCOMMON, Attr.DEX, Attr.CHA, Attr.CON),
	new Ancestry("Anadi",                Rarity.RARE,     Attr.DEX, Attr.WIS, Attr.CON),
	new Ancestry("Android",              Rarity.RARE,     Attr.DEX, Attr.INT, Attr.CHA),
	new Ancestry("Automoton",            Rarity.RARE,     Attr.STR, Attr.NON, Attr.NON),
	new Ancestry("Awakened Animal",      Rarity.RARE,     Attr.CON, Attr.WIS, Attr.INT),
	new Ancestry("Conrasu",              Rarity.RARE,     Attr.CON, Attr.WIS, Attr.CHA),
	new Ancestry("Dragonet",             Rarity.RARE,     Attr.DEX, Attr.CHA, Attr.CON),
	new Ancestry("Fleshwarp",            Rarity.RARE,     Attr.CON, Attr.NON, Attr.NON),
	new Ancestry("Ghoran",               Rarity.RARE,     Attr.CON, Attr.NON, Attr.NON),
	new Ancestry("Goloma",               Rarity.RARE,     Attr.WIS, Attr.NON, Attr.NON),
	new Ancestry("Jotunborn",            Rarity.RARE,     Attr.STR, Attr.WIS, Attr.CHA),
	new Ancestry("Kashrishi",            Rarity.RARE,     Attr.CON, Attr.NON, Attr.NON),
	new Ancestry("Poppet",               Rarity.RARE,     Attr.CON, Attr.CHA, Attr.DEX),
	new Ancestry("Sarangay",             Rarity.RARE,     Attr.STR, Attr.CHA, Attr.WIS),
	new Ancestry("Sarangay (Full Moon)", Rarity.RARE,     Attr.WIS, Attr.CHA, Attr.CON),
	new Ancestry("Shisk",                Rarity.RARE,     Attr.INT, Attr.NON, Attr.NON),
	new Ancestry("Shoony",               Rarity.RARE,     Attr.DEX, Attr.CHA, Attr.CON),
	new Ancestry("Skeleton",             Rarity.RARE,     Attr.DEX, Attr.CHA, Attr.INT),
	new Ancestry("Sprite",               Rarity.RARE,     Attr.DEX, Attr.INT, Attr.STR),
	new Ancestry("Strix",                Rarity.RARE,     Attr.DEX, Attr.NON, Attr.NON),
	new Ancestry("Surki",                Rarity.RARE,     Attr.CON, Attr.NON, Attr.NON),
	new Ancestry("Vishkanya",            Rarity.RARE,     Attr.DEX, Attr.NON, Attr.NON),
	new Ancestry("Yaksha",               Rarity.RARE,     Attr.CON, Attr.CHA, Attr.INT),
	new Ancestry("Yaogui",               Rarity.RARE,     Attr.CHA, Attr.CON, Attr.INT)
]

updateTable();