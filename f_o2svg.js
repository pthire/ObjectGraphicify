//===========================================================
// o2svg : draw tree representation of an object
//===========================================================

"use strict";

//==============================================================================
// Construction of the tree companion of an object for SVG representation
//
// Each node is described by an object with this properties :
//
// label: <g>                 node SVG DOM element
// n: "...."                  node payload (* for root)
// sn: [ {…}, {…}, {…}, … ]   sub-nodes
// t: "x"                     x: a(RRAY) / o(BJECT) / p(RIMITIF) / l(EAVE)
// st: "x"                    x: a(RRAY) / o(BJECT) / p(RIMITIF) / l(EAVE)
// taille: x                  node width
// taille_i: x                individual node width
// taille_sn: x               global node width
// tx: x                      x node position from left border
// ty: y                      y node position from left border
//==============================================================================

var o2comp = function o2comp(o) {

	var i;
	var lp;         // properties list of object
	var ctrees;     // current position in companion tree
	var type;       // a: array / o : object / p : primitif / l : leaf
	var st;         // a: array / o : object / p : primitif / l : leaf

	// INIT COMPANION TREE (ROOT NODE)

	if(!o2comp.tree) {
		if(Array.isArray(o)) {
			st = "a";
		} else {
			st = "o";
		}
		o2comp.tree = {"n": "*", "t": st, "st": st};
		o2comp.ctree = o2comp.tree;
	}

	// LOOP AND RECURSION ON PROPERTIES OF CURRENT OBJECT

	lp = Object.getOwnPropertyNames(o);
	if(lp.length) {
		o2comp.ctree.sn = [];

		for(i=0; i<lp.length; i++) {
			//console.log("PUSH ", lp[i], " SOUS ", o2comp.ctree.n, " ", o2comp.ctree.t);
			if(Array.isArray(o[lp[i]]) && lp[i] !== "length") {
				//console.log("Array : ", lp[i], o[lp[i]], type);
				o2comp.ctree.sn.push({"n": lp[i], "t": "a", "st": o2comp.ctree.t});
				ctrees = o2comp.ctree;
				o2comp.ctree = o2comp.ctree.sn[o2comp.ctree.sn.length-1];
				o2comp(o[lp[i]]);
				o2comp.ctree = ctrees;
			} else if(typeof o[lp[i]] === "object") {
				//console.log("Object : ", lp[i], o[lp[i]], type);
				o2comp.ctree.sn.push({"n": lp[i], "t": "o",  "st": o2comp.ctree.t});
				ctrees = o2comp.ctree;
				o2comp.ctree = o2comp.ctree.sn[o2comp.ctree.sn.length-1];
				o2comp(o[lp[i]]);
				o2comp.ctree = ctrees;
			} else {
				if(!Array.isArray(o) || lp[i] !== "length") {
					//console.log("Primitif : ", lp[i], o[lp[i]], type);
					o2comp.ctree.sn.push({"n": lp[i], "t": "l", "sn": [{"n": o[lp[i]], "t": "p", "st": "l"}], "st": o2comp.ctree.t});
				}
			}
		}
	}

	return o2comp.tree;
};

//==============================================================================
// Construction of svg element for each node of companion tree
// Each node is represented by 3 elements :
// - text : for payload
// - rect : for border
// - rect : for margin
// svg element are created at position (0, 0)
//==============================================================================

var sizen = function sizen(tree, svg_tree) {
	var i;
	var taille;
	var taille_n;
	var taille_sn;
	var bbox;
	var label;
	var rect;
	var svg_node;
	var enc;
	var padding;
	var spacing;
	var svgns;
	var fontSize;

	svgns = 'http://www.w3.org/2000/svg';

	// CREATION SVG ELEMENT

	padding = 10;
	spacing = 10;
	fontSize = 20;

	svg_node = document.createElementNS(svgns, 'g');
	svg_tree.appendChild(svg_node);

	// TEXTE

	label = document.createElementNS(svgns, 'text');
	label.appendChild(document.createTextNode(tree.n.toString(), true));
	label.setAttribute('class', "label");
	label.setAttribute('alignment-baseline', "middle");

	// uncomment if font size need to be changed
	//label.setAttribute('style', "font-family: Times New Roman; font-size: " + fontSize + "px;");

	svg_node.appendChild(label);

	label.setAttribute('x', padding/2 + spacing/2 + "px");
	label.setAttribute('y', fontSize + "px");

	if(tree.t === "a") {
		label.setAttribute("stroke", "red");
	} else if(tree.t === "o") {
		label.setAttribute("stroke", "orange");
	} else if(tree.t === "l") {
		label.setAttribute("stroke", "black");
	} else {
		label.setAttribute("stroke", "blue");
	}

	// BORDER RECT

	rect = document.createElementNS(svgns, 'rect');
	rect.setAttribute('fill', "none");
	rect.setAttribute('x', spacing/2 + "px");
	rect.setAttribute('y', 0 + "px");
	rect.setAttribute('rx', 5 + "px");
	rect.setAttribute('ry', 5 + "px");

	if(tree.t === "p") {
		rect.setAttribute('stroke', "none");
	} else if (tree.st === "o") {
		rect.setAttribute('stroke', "green");
	} else if (tree.st === "a") {
		rect.setAttribute('stroke', "red");
	} else {
		rect.setAttribute('stroke', "grey");
	}

	bbox = label.getBoundingClientRect();
	rect.setAttribute('stroke-width', 1);
	rect.setAttribute('width', (bbox.width + padding) + "px");
	rect.setAttribute('height', (bbox.height + padding) + "px");
	svg_node.appendChild(rect);

	// MARGING RECT

	enc = document.createElementNS(svgns, 'rect');
	enc.setAttribute('fill', "none");
	enc.setAttribute('x', 0 + "px");
	enc.setAttribute('y', 0 + "px");
	enc.setAttribute('rx', 5 + "px");
	enc.setAttribute('ry', 5 + "px");
	enc.setAttribute('width', (bbox.width + padding + spacing) + "px");
	enc.setAttribute('height', (bbox.height + padding) + "px");
	enc.setAttributeNS(null, 'stroke', 'none');
	svg_node.appendChild(enc);

	// COMPUTE DIMENSION

	bbox = svg_node.getBoundingClientRect();
	taille_n = bbox.width;
	tree.taille_i = bbox.width;
	tree.label = svg_node;

	if(!tree.sn) {
		taille = taille_n;
	} else {
		taille_sn = 0;
		for(i=0; i<tree.sn.length; i++) {
			tree.sn[i].nu = tree;
			taille_sn += sizen(tree.sn[i], svg_tree);
		}
		if(taille_sn >= taille_n) {
			taille = taille_sn;
		} else {
			taille = taille_n;
		}
	}

	tree.taille_sn = taille_sn;
	tree.taille = taille;
	return taille;
};

//==============================================================================
// Add offset to x position when node father is larger than its sub-node
//==============================================================================

var shift = function shift(tree, decal) {
	var i;
	var label;

	for(i=0; i<tree.sn.length; i++) {
		label = tree.sn[i].label;
		tree.sn[i].tx += decal;
		displace(tree.sn[i], decal, 0);
		if(tree.sn[i].sn) {
			shift(tree.sn[i], tree.sn[i].tx);
		}
	}

};

//==============================================================================
// Move node from (0, 0) to final position
//==============================================================================

var displace = function displace(tree, dx, dy) {
	var i;
	var children;
	var x,y;

	children = tree.label.childNodes;
	for (i = 0; i < children.length; i++) {
		x = parseInt(children[i].getAttribute("x"));
		y = parseInt(children[i].getAttribute("y"));
		children[i].setAttribute('x', x + dx);
		children[i].setAttribute('y', y + dy);
	}

};

//==============================================================================
// Draw companion tree
//==============================================================================

var draw = function draw(tree) {
	var posx;
	var label;
	var i;
	var marge_x;
	var marge_y;
	var interLevel = 90;        // DOUBLON !!!!!!!!!!!!!!!
	var max_x;
	var max_y;

	marge_x = 10;
	marge_y = 10;

	if(draw.prof === undefined) {
		// LEVEL 0 INITIALIZATION
		draw.prof = 0;
		draw.offset = [marge_x];
	} else {
		// NEW LEVEL (COPY OFFSET FROM UPPER LEVEL)
		draw.prof++;
		if(!draw.offset[draw.prof]) draw.offset[draw.prof] = draw.offset[draw.prof-1];
	}

	if(tree.sn) {
		for(i=0; i<tree.sn.length; i++) {
			draw(tree.sn[i]);
		}
	}

	label = tree.label;
	tree.tx = (draw.offset[draw.prof] + ((tree.taille - tree.taille_i)/2));
	tree.ty = (interLevel * draw.prof + marge_y);
	displace(tree, tree.tx, tree.ty);

	draw.offset[draw.prof] += tree.taille;

	// ADJUST LOWER LEVEL POSITION

	for(i=draw.prof+1; i<draw.offset.length; i++) {
		draw.offset[i] = draw.offset[draw.prof];
	}

	draw.prof--;

	if(tree.taille_i > tree.taille_sn) {
		shift(tree, (tree.taille_i - tree.taille_sn)/2);
	}

	max_x = draw.offset.reduce(function(a,b) {
	  return Math.max(a, b);
	});
	max_y = (interLevel * (draw.offset.length-1)) + interLevel/2;

	return {"x": max_x, "y": max_y};
};

//==============================================================================
// Add link between elements
//==============================================================================

var addLink = function addLink(tree, svg_tree) {
    var svgns = 'http://www.w3.org/2000/svg';
    var g = document.querySelector('svg');
    var i;
    var pos;
    var nb;
    var nn;
    var posn;
    var possn;
	var h;
    var span;
    var filler;
	var bezier;
	var arrow;
	var interLevel = 90;        // DOUBLON !!!!!!!!!!!!!!!

	var posg = g.getBoundingClientRect();

    posn = tree.label.getBoundingClientRect();
	h = posn.top - posn.bottom;
	posn = {};
	posn.left = parseInt(tree.label.childNodes[2].getAttribute("x"));
	posn.bottom = parseInt(tree.label.childNodes[2].getAttribute("y")) - h;
	
    pos = [];
    if(tree.sn) {
        for(i=0; i<tree.sn.length; i++) {

            arrow = document.createElementNS(svgns, 'path');
            arrow.setAttribute('stroke', 'grey');
            arrow.setAttribute('stroke-width', '1');
            arrow.setAttribute('fill', 'none');

			possn = {};
			possn.left = parseInt(tree.sn[i].label.childNodes[2].getAttribute("x"));
			possn.top = parseInt(tree.sn[i].label.childNodes[2].getAttribute("y"));

			bezier = "M" + (posn.left + tree.taille_i/2) + " " + posn.bottom + " ";
			bezier += "C " + (posn.left + tree.taille_i/2) + " " + (posn.bottom + interLevel/3) + ", ";
			bezier += (possn.left + tree.sn[i].taille_i/2) + " " + (possn.top - interLevel/3) + ", ";
			bezier += (possn.left + tree.sn[i].taille_i/2) + " " + (possn.top);
            arrow.setAttribute('d', bezier);

            svg_tree.appendChild(arrow);

			/****** code for straight link ********************************
            var rect = document.createElementNS(svgns, 'line');

			possn = {};
			possn.left = parseInt(tree.sn[i].label.childNodes[2].getAttribute("x"));
			possn.top = parseInt(tree.sn[i].label.childNodes[2].getAttribute("y"));

            rect.setAttributeNS(null, 'x1', posn.left + tree.taille_i/2);
            rect.setAttributeNS(null, 'y1', posn.bottom);
            rect.setAttributeNS(null, 'x2', possn.left + tree.sn[i].taille_i/2);
            rect.setAttributeNS(null, 'y2', possn.top);

            rect.setAttributeNS(null, 'stroke', 'red');
            rect.setAttributeNS(null, 'stroke-width', '2');

            svg_tree.appendChild(rect);
			****************************************************************/

            addLink(tree.sn[i], svg_tree);
        }
    }
    return(tree, tree.div);
};

//==============================================================================
// Main entry point
//==============================================================================

var o2svg = function(object, svg_tree) {

	var tree;                // companion tree of object
	var max;                 // size of global SVG

    var g = document.querySelector('svg');
	g.innerHTML = "";

	o2comp.tree = undefined;          // NOT SO ELEGANT, NEED REFACTORING !!!

	tree = o2comp(object);
	sizen(tree, svg_tree);

	draw.prof = undefined;            // NOT SO ELEGANT, NEED REFACTORING !!!
	max = draw(tree);

	addLink(tree, svg_tree);

	// ADJUST SVG ELEMENT DIMENSION

	g.setAttribute('width', max.x);
	g.setAttribute('height', max.y);
	g.setAttribute('viewBox', "0 0 " + max.x + " " + max.y);
};
