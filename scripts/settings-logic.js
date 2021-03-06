let clip = new ClipboardJS(".clip-btn");

let saveSched = document.getElementById("save-sched");
let bellSelect = document.getElementById("sound-select");
let saveBell = document.getElementById("save-bell");
let tbody = document.getElementById("tcust-names-bod");

let firstOption = "<option value=\"\" disabled selected>Select an Event</option>";
let rowMap = new Map();
let uniqueEvents = [];
let evrHtml = "<th scope=\"row\">\n" +
    "                    <select class=\"form-control\">\n" +
    "                    </select>\n" +
    "                </th>\n" +
    "                <td>\n" +
    "                    <input class=\"form-control\"\n" +
    "                           placeholder=\"Custom Name [eg. 'P1 Rocket Science (Mr. Jeb Kerman)']\" type=\"text\">\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <input class=\"form-control\" id=\"per1-link\"\n" +
    "                           placeholder=\"Links & Notes [eg. 'https://example.com Lorem Ipsum']\"\n" +
    "                           type=\"text\">\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <button type=\"button\" class=\"btn btn-danger\" onclick=\"this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);\">Delete</button>\n" +
    "                </td>";

let loadSettingsOntoPage = function() {

    tbody.innerHTML = "";
    bellSelect.value = "bellSounds/bell2.wav";

    uniqueEvents = [];
    for (let i = 0; i < 7; i++) {
        let sched = localStorage.getItem(getDayStr(i) + "-schedule");
        if (sched === null) {
            sched = getDefaultSched(i);
        }

        if ( sched !== "off_duty" && sched ) {
            let evs = sched.split("~[SE]~");
            for (let j of evs) {
                let uev = j.split("~[SA]~")[0];
                if (!uniqueEvents.includes(uev) && uev !== "Break" && !uev.includes("Passing Period")) {
                    uniqueEvents.push(uev);
                }
            }
        }
    }

    uniqueEvents.sort();

    console.log(uniqueEvents);


    if (localStorage.getItem("bellSound") !== null) {
        // Uh, totally didn't ctrl v from StackOverflow
        document.querySelector("#sound-select option[value='" + localStorage.getItem("bellSound") + "']").setAttribute('selected', true);
    }


    rowMap = new Map();
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        let v = localStorage.getItem(k);

        if (k.endsWith("-link")) {
            k = k.substr(0, k.length - 5);
            if (rowMap.has(k)) {
                rowMap.set(k, {name: rowMap.get(k).name, link: v});
            } else {
                rowMap.set(k, {name: "", link: v});
            }
        }

        if (k.endsWith("-name")) {
            k = k.substr(0, k.length - 5);
            if (rowMap.has(k)) {
                rowMap.set(k, {name: v, link: rowMap.get(k).link});
            } else {
                rowMap.set(k, {name: v, link: ""});
            }
        }
    }

    rowMap = new Map([...rowMap.entries()].sort());

    console.log(rowMap);

    rowMap.forEach(function(value, key) {
        console.log(key + ' = ' + value);
        let nr = addCustRow();
        nr.firstElementChild.firstElementChild.value = key;
        nr.children[1].firstElementChild.value = value.name;
        nr.children[2].firstElementChild.value = value.link;
    });
}

let previewSound = new Audio();
let saveBellFunc = function (p) {
    localStorage.setItem("bellSound", bellSelect.options[bellSelect.selectedIndex].value);

    previewSound = new Audio(localStorage.getItem("bellSound"));
    if (p) { previewSound.play(); $('#success').modal('show');}
};

let saveSchedFunc = function (ss) {
    let toRm = [];
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if (k.endsWith("-link") || k.endsWith("-name")) {
            toRm.push(k);
        }
    }

    for (let i of toRm) {
        localStorage.removeItem(i);
    }

    for (let i of tbody.children) {
        let evName = i.firstElementChild.firstElementChild.value;
        if (!evName) {
            $('#selectSomething').modal('show');
            return false;
        }

        let evCName = i.children[1].firstElementChild.value;
        let evLink = i.children[2].firstElementChild.value;
        localStorage.setItem(evName + "-link", evLink);
        localStorage.setItem(evName + "-name", evCName);
    }

    if (ss) {
        $('#success').modal('show');
    }
    return true;
};

let addCustRow = function() {
    let nr = document.createElement("tr");
    nr.innerHTML = evrHtml;

    let sel = nr.firstElementChild.firstElementChild;
    sel.innerHTML += firstOption;
    for (let i of uniqueEvents) {
        sel.innerHTML += `<option value="${i}">${i}</option>`;
    }

    tbody.appendChild(nr);
    return nr;
}

let showExport = function() {
    if (!saveSchedFunc(false)) {
        return;
    }

    saveBellFunc(false);

    let exp = "";
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        let v = localStorage.getItem(k);
        exp += k;
        exp += "~[SV]~";
        exp += v;
        exp += "~[SK]~";
    }

    if (exp.endsWith("~[SK]~")) {
        exp = exp.substr(0, exp.length - 6);
    }

    $('#exportModal').modal('show');
    document.getElementById("exportOut").value = exp;
}

let importSettings = function() {
    localStorage.clear();
    let impStr = document.getElementById('importIn').value;
    for (let i of impStr.split("~[SK]~")) {
        let args = i.split("~[SV]~");
        localStorage.setItem(args[0], args[1]);
    }

    loadSettingsOntoPage();
    $('#success').modal('show');
}


loadSettingsOntoPage();
