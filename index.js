(function () {
    "use strict";

    var timer = null;

    // DEFAULT INPUT DATA METHOD
    function saveItem(id) {
        try {
            localStorage.setItem(id, $("#" + id)[0].value);
        }
        catch (e) {
            dbgout("saveItem(" + id + "): `" + e.message + "`");
        }
    }

    // DEFAULT LOAD DATA METHOD
    function loadItem(id, defaultValue) {
        try {
            var item = $("#" + id)[0];
            if (defaultValue)
                item.value = defaultValue;
            else
                item.value = "";

            if (localStorage.getItem(id))
                item.value = localStorage.getItem(id);
        }
        catch (e) {
            dbgout("loadItem(" + id + "): `" + e.message + "`");
        }
    }

    // DEFAULT GET VAL FROM ID METHOD
    function getval(id) {
        return $("#" + id)[0].value;
    }

    // DEFAULT SET VAL IN ID METHOD
    function setval(id, val) {
        $("#" + id)[0].value = val;
        return val;
    }

    // MAIN DRAW METHOD
    function draw(text) {

        timer = null;

        if (text == undefined)
            text = $("#automata-data")[0].value;

        var auto;

        try {
            auto = new Automata(text);
        } catch (e) {
            return;
        }

        // BASE NODE SETTINGS
        var network =
            'digraph {\n' +
            'node [shape=circle, color=white, fontSize=16]\n' +
            'edge [length=80, color=white, fontColor=black]\n';

        var cycle = {};

        for (var i in auto.edges) {

            var e = auto.edges[i];

            if (e.source == e.target) {

                if (!cycle[e.source])
                    cycle[e.source] = [];

                cycle[e.source].push(e.label);

                continue;
            }

            network += '"' + e.source + '" -> "' + e.target + '"';

            if (e.label != "$")
                network += '[label="' + e.label + '"]';

            network += ";\n";

        }

        for (var i in cycle) {

            network += '"' + i + '" -> "' + i + '"';
            network += '[label="' + cycle[i].sort() + '"];\n';

        }

        for (var i in auto.nodes) {

            var n = auto.nodes[i];

            if (!n.isStart && !n.isFinish)
                continue;

            network += '"' + n.name + '"[';

            // START NODE SETTINGS
            if (n.isStart)
                network += "fontColor=white, color=green, level=0, ";

            // FINISH NODE SETTINGS
            if (n.isFinish)
                network += "shape=box, radius=8, color=red, fontColor=white";

            network += "];\n";

        }

        network += "}";

        try {
            drawNetwork(network);
        } catch (e) {
        }

    }

    // DEFAULT INIT METHOD
    function init() {

        load();

        // SAVE BUTTON
        $("#button-save").bind("click", function () { save(); });
        // LOAD BUTTON
        $("#button-load").bind("click", function () { load(); });
        // TEST BUTTON
        $("#button-test").bind("click", function () { Test.runTest(); });
        // COPY BUTTON
        $("#button-copy").bind("click", function () {
            $("#data-input")[0].value = $("#data-output")[0].value;
        });

        // DATA PROCESSING BUTTON
        $("#button-data-processing").bind("click", function () {
            var r = $("#data-input")[0].value;
            $("#data-output")[0].value =
                new Tree(r).normalize().optimize2()
                    .normalize().toString();
        });

        $("#automata-data").bind("input propertychange", function () {
            if (timer)
                return;
            timer = setTimeout(draw, 500);
        });

        // DFA DRAW METHOD
        $("#button-automata-opt").bind("click", function () {
            var r = $("#data-input")[0].value;
            var dfa = DFA(r);
            dfa.getUsedNodes();
            $("#automata-data")[0].value = dfa+"";
            draw();
        });

        compat();

        window.T = function (r) { return new Tree(r); };

        draw();
    }

    // SAVE DEFAULT VALUES
    function save() {
        saveItem("data-input");
        saveItem("data-output");
        saveItem("automata-data");
    }

    // LOAD DEFAULT VALUES
    function load() {
        loadItem("data-input" , "((a*b+b*a)*)*");
        loadItem("data-output" );
        loadItem("automata-data", "^start\nfinish^\nstart, 1\n1, 2, c\n2, 3\n3, 5\n5, 5, a\n5, 4\n4, 3, b\n3, 1\n1, finish");
    }

    function compat() {
        try {

            if (!Array.prototype.indexOf) {

                Array.prototype.indexOf = function(elt) {
                    'use strict';

                    var len = this.length >>> 0;
                    var from = Number(arguments[1]) || 0;

                    from = (from < 0) ? Math.ceil(from) : Math.floor(from);

                    if (from < 0)
                        from += len;

                    for (; from < len; from++) {
                        if (from in this && this[from] === elt)
                            return from;
                    }

                    return -1;

                };
            }

            if (!Array.prototype.filter) {

                Array.prototype.filter = function(fun /*, thisp */) {
                    'use strict';

                    if (this === void 0 || this === null)
                        throw new TypeError();

                    var t = Object(this);
                    var len = t.length >>> 0;

                    if (typeof fun !== "function")
                        throw new TypeError();

                    var res = [];
                    var thisp = arguments[1];

                    for (var i = 0; i < len; i++) {
                        if (i in t) {
                            var val = t[i]; // in case fun mutates this
                            if (fun.call(thisp, val, i, t))
                                res.push(val);
                        }
                    }

                    return res;
                };
            }
        }
        catch (e) {
            dbgout(e.message+"");
        }

    }

    // DEFAULT DEBUG METHOD
    function dbgout(s) {
        try { console.log(s); } catch (e) {}
    }

    $(document).ready(function() { init(); });

})();
