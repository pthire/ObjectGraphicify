//============================================================================
// OBJECT GRAPHICIFY
// UI PART
//============================================================================

"use strict";

var sample = function sample (no) {
	var object;

	if(no === "1") {
		object = 'object = {"name": "SMITH", "surnames": ["Michael", "Robert"], "age": 34, "children": ["Sarah", "Louis"],"hobbies": ["Reading", "Painting"]}';

	} else if (no === "2") {
		object = 'object = [{"surname": "Arthur", "birth_date": { "day": 12, "month": 2, "year": 2001}}, {"surname": "Elisabeth", "birth_date": { "day": 8, "month": 20, "year": 2005}}]';
	} else if (no === "3") {
		object = 'object = {};\nobject.name = "SMITH";\n object.surnames = ["Michael", "Robert"];\nobject.birth_date = {"day": 12, "month": 10, "year": 1980};\n object.children = [];\n object.children.push({"surname" : "Arthur", "birth_date" : {"day": 12, "month": 2, "year": 2001}});\n object.children.push({"surname" : "Elisabeth", "birth_date" : {"day": 8, "month": 20, "year": 2005}});\n object.hobbies = ["Reading", "Painting"]; ';
	}

	return object;
	
}

var start = function start() {

	var fileName;
	var svg_tree = document.querySelector('svg');
	var json_object = document.querySelector('#json');
	var beautifull_json_object = document.querySelector('#beautifull_json');

	// LOAD

	document.querySelector('#file').addEventListener('change', function(e) {
		var file;
		var target;

		e = e || window.event;
		target = e.target || e.srcElement;

		file = target.files[0];
		fileName = file.name;

		var reader = new FileReader();

		reader.onload = (function(file) {
			return function(e) {
				var object;
				var code_b64
				var code;
				code_b64 = e.target.result.split(",")[1];
				code = atob(code_b64);

				eval(code);

				document.querySelector("#input").innerHTML = code.replace(/\n/g,"<br>");
				o2svg(object, svg_tree);		
				document.querySelector("#json").innerHTML = "<pre>" + JSON_colorize(JSON.stringify(object)) + "</pre>";
				document.querySelector("#beautifull_json").innerHTML = "<pre>" + JSON_colorize(JSON.stringify(object, null, "\t")) + "</pre>";

			};
		})(file);

		// image file is read as a data URL

		reader.readAsDataURL(file);
	});

	document.querySelector("#load").addEventListener("click", function() {
		window.document.querySelector("#file").click();
	});
	
	// SAVE

	document.querySelector("#save").addEventListener("click", function() {
		var content;

		content = document.querySelector("#input").textContent.trim();
		var textToSaveAsBlob = new Blob([content], {type:"text/plain"});
		var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
		var fileNameToSaveAs = fileName;
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		downloadLink.href = textToSaveAsURL;
		//downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);

		downloadLink.click();
	});

	// COLORIZE JSON

	var JSON_colorize = function JSON_colorize(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}

	// DIFFERENT DISPLAY COMMANDS (DRAWING, JSON ...)

	var execute = function execute(e) {
		var content;
		var option;
		var object;

		// SHOW ONLY WHAT IS ASKED

		option = e.target.dataset.option;

		if(option === "d") {
			svg_tree.setAttribute("style", "display: block");
			json_object.setAttribute("style", "display: none");
			beautifull_json_object.setAttribute("style", "display: none");
		} else if(option === "j") {
			svg_tree.setAttribute("style", "display: none");
			json_object.setAttribute("style", "display: block");
			beautifull_json_object.setAttribute("style", "display: none");
		} else if(option === "bj") {
			svg_tree.setAttribute("style", "display: none");
			json_object.setAttribute("style", "display: none");
			beautifull_json_object.setAttribute("style", "display: block");
		} else if(option === "dj") {
			svg_tree.setAttribute("style", "display: block");
			json_object.setAttribute("style", "display: block");
			beautifull_json_object.setAttribute("style", "display: none");
		} else if(option === "dbj") {
			svg_tree.setAttribute("style", "display: block");
			json_object.setAttribute("style", "display: none");
			beautifull_json_object.setAttribute("style", "display: block");
		} else if(option === "jbj") {
			svg_tree.setAttribute("style", "display: none");
			json_object.setAttribute("style", "display: block");
			beautifull_json_object.setAttribute("style", "display: block");
		}

		// EVAL INPUT ZONE

		content = document.querySelector("#input").textContent.trim();

		try {
			eval(content);
		} catch(e) {
			alert("erreur" + e);
		}

		// DRAW OBJECT

		o2svg(object, svg_tree);		
			
		// WRITE JSON

		document.querySelector("#json").innerHTML = JSON_colorize(JSON.stringify(object));

		// WRITE BAUTIFULL JSON

		document.querySelector("#beautifull_json").innerHTML = "<pre>" + JSON_colorize(JSON.stringify(object, null, "\t")) + "</pre>";

	}

	document.querySelector("#drawing_only").addEventListener("click", execute);
	document.querySelector("#json_only").addEventListener("click", execute);
	document.querySelector("#bjson_only").addEventListener("click", execute);
	document.querySelector("#drawing_json").addEventListener("click", execute);
	document.querySelector("#drawing_beautifull_json").addEventListener("click", execute);
	document.querySelector("#json_beautifull_json").addEventListener("click", execute);

	// SAMPLE COMMAND

	document.querySelectorAll(".sample").forEach(function(button) {
		button.addEventListener("click", function (e) {
			var object;
			var no;

			no = e.target.dataset.no;

			eval(sample(no));

			document.querySelector("#input").innerHTML = sample(no).replace(/\n/g,"<br>");
			o2svg(object, svg_tree);		
			document.querySelector("#json").innerHTML = "<pre>" + JSON_colorize(JSON.stringify(object)) + "</pre>";
			document.querySelector("#beautifull_json").innerHTML = "<pre>" + JSON_colorize(JSON.stringify(object, null, "\t")) + "</pre>";
		});

	});

	// CLEAR COMMAND

	document.querySelector("#clear").addEventListener("click", function (e) {
		var iz;
		var range;
		var sel;

		iz = document.querySelector("#input");
		iz.textContent = "object = ";

		range = document.createRange();
		sel = window.getSelection();
		range.setStart(iz.childNodes[0], 9);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);

		iz.focus();
	}) ;

	document.querySelector("#clear").click();
	fileName = "MyObject.txt";

}

window.addEventListener("load", start);	
