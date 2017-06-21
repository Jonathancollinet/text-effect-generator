(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var editor_1 = require('./editor');
/*
 *
 * todo
 *
 * pour les bugs et autre shits, demander accès au trello
 *
 * OP123
 * Pour le moment le programme se base sur 2 text-shadows, alors qu'on a la possibilitée d'en manipuler (n),
 * du coup il faut génériser le fait de créer des point dans toute les sections
 * à partir d'un '+' dans le rectangle 'Point'
 *
 * point2point
 * En gros l'idée c'est de faire une transition fluide entre chaque points setté
 * Si de 0 à 100 % aucun points n'est setté, qu'on set le 51% sur des valeurs lolilesque
 * alors l'option va permettre à l'animation d'aller jusqu'au prochain point setté
 * fluidement et progressivement, cad au lieu de faire 51% [30 30] puis 52% [0 0]
 * il va faire 51% [30 30] puis 52% [30 30] (puisque aucun autres points n'est setté)
 * mais si deux points étaient setté en 51% et 53% style 51[30 30] et 53[40 40]
 * alors on aurai une transition -> 51[30 30] 52[35 35] 53[40 40]
 *
 */
!function () {
  editor_1.default.init();
}();

},{"./editor":3}],2:[function(require,module,exports){
'use strict';

var drag = {
    selected: null,
    xPos: 0, yPos: 0,
    xElem: 0, yElem: 0,
    init: function init(elem) {
        drag.selected = elem;
        drag.xElem = drag.xPos - drag.selected.cx.baseVal.value;
        drag.yElem = drag.yPos - drag.selected.cy.baseVal.value;
    },
    move: function move(e) {
        drag.xPos = e.pageX;
        drag.yPos = e.pageY;
        if (drag.selected !== null) {
            drag.selected.cx.baseVal.valueAsString = drag.xPos - drag.xElem + 'px';
            drag.selected.cy.baseVal.valueAsString = drag.yPos - drag.yElem + 'px';
        }
    },
    remove: function remove() {
        drag.selected = null;
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = drag;

},{}],3:[function(require,module,exports){
'use strict';

var quicklightAPI_1 = require('./quicklightAPI');
var keyframes_1 = require('./keyframes');
var listeners_1 = require('./listeners');
var svgUtils_1 = require('./svgUtils');
var utils_1 = require('./utils');
var editor = {
    values: {},
    inputs: {},
    points: new Array(101),
    contextTypeEvents: {
        Display: 'input',
        Value: 'change'
    },
    inputNames: {
        'animationDuration': { type: 'range' },
        'hideMedianText': { type: 'checkbox' },
        'textColor': { type: 'color' },
        'color': { type: 'color' },
        'point2point': { type: 'checkbox' }
    },
    init: function init() {
        editor.init_values();
        editor.init_inputs();
        editor.init_inputListeners();
        editor.init_svg();
        editor.init_keybinding();
        editor.init_keyframe();
    },
    init_values: function init_values() {
        quicklightAPI_1.default.set_Points();
    },
    init_inputs: function init_inputs() {
        var name, input, display;
        for (name in editor.inputNames) {
            if (utils_1.default.has.call(editor.inputNames, name)) {
                editor.inputs[name] = {
                    input: utils_1.default.$$('#' + name + 'Input'),
                    display: utils_1.default.$$('#' + name + 'Value'),
                    prevented: utils_1.default.isPrevented(editor.inputNames[name])
                };
                input = editor.inputs[name].input;
                input[utils_1.default.get_contextName(input)] = quicklightAPI_1.default[name];
                display = editor.inputs[name].display;
                display.innerHTML = quicklightAPI_1.default[name];
            }
        }
    },
    init_svg: function init_svg() {
        svgUtils_1.default.init();
        svgUtils_1.default.createLayout();
        svgUtils_1.default.rectClick({ target: editor.points[0] });
    },
    init_keyframe: function init_keyframe() {
        keyframes_1.default.set_keyFrames();
    },
    init_inputListeners: function init_inputListeners() {
        var context;
        for (context in editor.contextTypeEvents) {
            if (utils_1.default.has.call(editor.contextTypeEvents, context)) {
                listeners_1.default.set_inputListeners(editor.inputs, context, editor.contextTypeEvents[context]);
            }
        }
    },
    set_allEmptyColorElse: function set_allEmptyColorElse(positions) {
        editor.points.map(function (point, i) {
            positions.map(function (position) {
                if (i !== position) {
                    point.setAttribute('fill', 'transparent');
                }
            });
        });
    },
    init_keybinding: function init_keybinding() {
        // window.addEventListener('keydown', e => {
        //   switch (e.keyCode) {
        //     case 37: // left
        //       break;
        //     case 39: // right
        //       break;
        //   }
        // })
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = editor;

},{"./keyframes":5,"./listeners":6,"./quicklightAPI":8,"./svgUtils":9,"./utils":10}],4:[function(require,module,exports){
'use strict';

var quicklightAPI_1 = require('./quicklightAPI');
var keyframes_1 = require('./keyframes');
var utils_1 = require('./utils');
var editorCore = {
    set_animationDurationValue: function set_animationDurationValue(animationDuration) {
        quicklightAPI_1.default.animationDuration = animationDuration + 'ms';
        editorCore.set_styleProperty('#livePreview', 'animationDuration', animationDuration + 'ms');
    },
    set_animationDurationDisplay: function set_animationDurationDisplay(animationDuration) {
        editorCore.set_property('#animationDurationValue', 'innerHTML', animationDuration + 'ms');
    },
    set_hideMedianTextValue: function set_hideMedianTextValue(hideMedianText) {
        quicklightAPI_1.default.hideMedianText = hideMedianText;
        editorCore.set_styleProperty('#livePreview', 'color', hideMedianText ? 'transparent' : quicklightAPI_1.default.textColor);
    },
    set_hideMedianTextDisplay: function set_hideMedianTextDisplay(hideMedianText) {
        editorCore.set_property('#hideMedianTextValue', 'innerHTML', hideMedianText);
    },
    set_textColorDisplay: function set_textColorDisplay(textColor) {
        editorCore.set_property('#textColorValue', 'innerHTML', textColor);
    },
    set_textColorValue: function set_textColorValue(textColor) {
        quicklightAPI_1.default.textColor = textColor;
        editorCore.set_styleProperty('#livePreview', 'color', textColor ? textColor : 'white');
    },
    set_colorValue: function set_colorValue(color) {
        quicklightAPI_1.default.color = color;
        editorCore.set_majorColor(color);
    },
    set_colorDisplay: function set_colorDisplay(color) {
        editorCore.set_property('#colorValue', 'innerHTML', color);
    },
    set_point2pointValue: function set_point2pointValue(point2point) {
        quicklightAPI_1.default.point2point = point2point;
        // add point2point feature
    },
    set_point2pointDisplay: function set_point2pointDisplay(point2point) {
        editorCore.set_property('#point2pointValue', 'innerHTML', point2point);
    },
    set_property: function set_property(element, name, value) {
        utils_1.default.$$(element)[name] = value;
    },
    set_styleProperty: function set_styleProperty(element, name, value) {
        utils_1.default.$$(element).style[name] = value;
    },
    set_majorColor: function set_majorColor(color) {
        quicklightAPI_1.default.points.map(function (point) {
            point.shadows.map(function (shadow) {
                shadow.color = color;
            });
        });
        keyframes_1.default.set_keyFrames();
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = editorCore;

},{"./keyframes":5,"./quicklightAPI":8,"./utils":10}],5:[function(require,module,exports){
'use strict';

var quicklightAPI_1 = require('./quicklightAPI');
var utils_1 = require('./utils');
var keyframes = {
    get_textShadow: function get_textShadow(position) {
        var str = '';
        var shadows = quicklightAPI_1.default.points[position].shadows,
            len = shadows.length;
        quicklightAPI_1.default.points[position].shadows.map(function (shadow, i) {
            if (i + 1 != len) {
                str += shadow.color + ' ' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px, ';
            } else {
                str += shadow.color + ' ' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px';
            }
        });
        return str + ";";
    },
    get_propertiesAt: function get_propertiesAt(position, vendor) {
        return vendor + 'text-shadow: ' + keyframes.get_textShadow(position);
    },
    set_style: function set_style(styleStr) {
        var style = window.document.createElement('style'),
            animation = window.document.createTextNode(styleStr),
            head = utils_1.default.$$('head'),
            livePreview = utils_1.default.$$('#livePreview');
        if (utils_1.default.$$('style')) {
            utils_1.default.$$('style').remove();
        }
        livePreview.style.animationName = 'generated_glitch';
        style.type = 'text/css';
        style.appendChild(animation);
        head.appendChild(style);
    },
    // génère la string keyframe, à appeler dès qu'on à besoin de refresh l'animation
    set_keyFrames: function set_keyFrames() {
        var str = '',
            i = -1;
        var steps = quicklightAPI_1.default.steps + 1,
            vendors = ['', '-webkit-', '-moz-'];
        vendors.map(function (vendor) {
            str += '@' + vendor + 'keyframes generated_glitch {\n';
            i = -1;
            while (++i < steps) {
                str += i + '% { ' + keyframes.get_propertiesAt(i, vendor) + ' }\n';
            }
        });
        keyframes.set_style(str);
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = keyframes;

},{"./quicklightAPI":8,"./utils":10}],6:[function(require,module,exports){
'use strict';

var editorCore_1 = require('./editorCore');
var utils_1 = require('./utils');
var editor_1 = require('./editor');
var listeners = {
    get_inputListenerFunc: function get_inputListenerFunc(input, callback, controlEvent) {
        return function (event) {
            if (event && controlEvent) {
                event[controlEvent]();
            }
            callback(listeners.get_contextValue(input));
        };
    },
    get_contextValue: function get_contextValue(input) {
        return input.type === 'checkbox' ? input.checked : input.value;
    },
    set_inputListeners: function set_inputListeners(inputs, context, type) {
        var input;
        for (input in inputs) {
            if (utils_1.default.has.call(inputs, input)) {
                listeners.set_inputListener(inputs[input].input, editorCore_1.default['set_' + input + context], type, editor_1.default.inputs[input].prevented);
            }
        }
    },
    set_inputListener: function set_inputListener(input, callback, type, prevented) {
        input.addEventListener(type, listeners.get_inputListenerFunc(input, callback, prevented ? 'preventDefault' : false), true);
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = listeners;

},{"./editor":3,"./editorCore":4,"./utils":10}],7:[function(require,module,exports){
'use strict';

var quicklightAPI_1 = require('./quicklightAPI');
var drag_1 = require('./drag');
var keyframes_1 = require('./keyframes');
var svgUtils_1 = require('./svgUtils');
var utils_1 = require('./utils');
var pointEditor = {
    area: {},
    points: [],
    positions: [],
    pointsPosition: [],
    clicked: false,
    dragging: false,
    init: function init(positions) {
        pointEditor.positions = positions;
        if (pointEditor.points.length) {
            pointEditor.clearPositions();
        } else {
            pointEditor.createLayout();
        }
        pointEditor.updateTitle();
        pointEditor.addXYPoints();
        pointEditor.initListenersPoints();
        pointEditor.addCenterPoint();
    },
    clearPositions: function clearPositions() {
        pointEditor.points.map(function (point, i) {
            pointEditor.pointsPosition[i] = { x: 0, y: 0 };
        });
        utils_1.default.$$('#colorContainer').innerHTML = '';
        utils_1.default.$$('#posContainer').innerHTML = '';
        utils_1.default.$$('#blurContainer').innerHTML = '';
    },
    createLayout: function createLayout() {
        pointEditor.area = svgUtils_1.default.get_domSvg('svg');
        pointEditor.area.style.height = '100%';
        pointEditor.area.style.width = '100%';
        pointEditor.area.appendChild(svgUtils_1.default.createForm('rect', {
            x: '0', y: '0',
            width: '100%', height: '100%',
            fill: '#424242'
        }));
        utils_1.default.$$('#pointPreview').appendChild(pointEditor.area);
    },
    updateTitle: function updateTitle() {
        var positions = pointEditor.positions,
            len = positions.length;
        if (len > 1) {
            utils_1.default.$$('#pointNumber').innerHTML = positions[0].toString() + ' -> ' + positions[len - 1].toString();
        } else {
            utils_1.default.$$('#pointNumber').innerHTML = positions[0].toString();
        }
    },
    calcNewPos: function calcNewPos(x, y, context) {
        var shadow,
            circle = pointEditor.pointsPosition[context];
        var diffX = x - circle.x,
            diffY = y - circle.y;
        circle.x = x;
        circle.y = y;
        pointEditor.positions.map(function (position, i) {
            shadow = quicklightAPI_1.default.points[position].shadows[context];
            if (i === 0) {
                shadow.x += diffX;
                shadow.y += diffY;
            }
        });
        pointEditor.points.map(function (point, i) {
            shadow = quicklightAPI_1.default.points[pointEditor.positions[0]].shadows[i];
            pointEditor.updateView(shadow.x, shadow.y, i);
        });
        keyframes_1.default.set_keyFrames();
    },
    calcNewPosEvent: function calcNewPosEvent(context) {
        return function (e) {
            pointEditor.calcNewPos(e.offsetX, e.offsetY, context);
        };
    },
    addXYPoints: function addXYPoints() {
        pointEditor.set_points();
        pointEditor.set_shadowValues();
        pointEditor.set_templateContainer();
        pointEditor.set_PointsPopover();
    },
    set_templateContainer: function set_templateContainer() {
        pointEditor.points.map(function (point, i) {
            pointEditor.addOneShadow(i);
        });
    },
    addOneShadow: function addOneShadow(number) {
        utils_1.default.$$("#colorContainer").innerHTML += utils_1.default.$$("#colorPoint").innerHTML;
        utils_1.default.$$("#posContainer").innerHTML += utils_1.default.$$("#posPoint").innerHTML;
        utils_1.default.$$("#blurContainer").innerHTML += utils_1.default.$$("#blurPoint").innerHTML;
        utils_1.default.$$('#colorPointValue').id += number;
        utils_1.default.$$('#colorPointInput').id += number;
        utils_1.default.$$('#nbColor').innerHTML = number;
        utils_1.default.$$('#nbColor').id += number;
        utils_1.default.$$('#blurPointValue').id += number;
        utils_1.default.$$('#blurPointInput').id += number;
        utils_1.default.$$('#nbBlur').innerHTML = number;
        utils_1.default.$$('#nbBlur').id += number;
        utils_1.default.$$('#nbPoint').innerHTML = number;
        utils_1.default.$$('#nbPoint').id += number;
        utils_1.default.$$("#posPointValue").id += number;
    },
    set_points: function set_points() {
        var i = -1;
        var len = quicklightAPI_1.default.shadowsDefaultNumber;
        if (pointEditor.points.length) {
            pointEditor.removePoints();
        }
        while (++i < len) {
            pointEditor.set_point(i);
        }
    },
    set_point: function set_point(position) {
        pointEditor.pointsPosition[position] = { x: 0, y: 0 };
        pointEditor.points[position] = svgUtils_1.default.createForm('circle', {
            cx: '50%', cy: '50%', r: '0.5em',
            stroke: '#424242', 'stroke-width': '1px',
            fill: 'black', id: 'circle' + position
        }, [{ action: 'mouseup', callback: pointEditor.calcNewPosEvent(position) }]);
        pointEditor.area.appendChild(pointEditor.points[position]);
    },
    removePoints: function removePoints() {
        pointEditor.points.map(function (point) {
            pointEditor.area.removeChild(point);
        });
    },
    set_shadowValues: function set_shadowValues() {
        setTimeout(function () {
            pointEditor.points.map(function (point, i) {
                pointEditor.set_shadowValue(i);
            });
        }, 0);
    },
    set_shadowValue: function set_shadowValue(position) {
        var point = pointEditor.points[position],
            pointPos = pointEditor.pointsPosition[position],
            shadow = quicklightAPI_1.default.points[pointEditor.positions[0]].shadows[position],
            xBaseVal = point.cx.baseVal,
            yBaseVal = point.cy.baseVal;
        xBaseVal.value = xBaseVal.value + shadow.x;
        yBaseVal.value = yBaseVal.value + shadow.y;
        point.setAttribute('r', point.r.baseVal.value + "px");
        pointPos.x = xBaseVal.value;
        pointPos.y = yBaseVal.value;
        pointEditor.calcNewPos(pointPos.x, pointPos.y, position);
    },
    set_changeInputColor: function set_changeInputColor(id) {
        return function (e) {
            pointEditor.positions.map(function (position) {
                quicklightAPI_1.default.points[position].shadows[id].color = e.target.value;
            });
            keyframes_1.default.set_keyFrames();
        };
    },
    set_PointsPopover: function set_PointsPopover() {
        pointEditor.points.map(function (point, i) {
            var shadow = quicklightAPI_1.default.points[pointEditor.positions[0]].shadows[i],
                color = utils_1.default.$$("#colorPointInput" + i),
                blur = utils_1.default.$$("#blurPointInput" + i);
            color.value = shadow.color;
            color.onchange = pointEditor.set_changeInputColor(i.toString());
            blur.value = shadow.blur;
            blur.onchange = pointEditor.set_changeInputBlur(i.toString());
        });
    },
    set_changeInputBlur: function set_changeInputBlur(id) {
        return function (e) {
            pointEditor.positions.map(function (position) {
                quicklightAPI_1.default.points[position].shadows[id].blur = e.target.value;
            });
            keyframes_1.default.set_keyFrames();
        };
    },
    updateView: function updateView(x, y, i) {
        utils_1.default.$$("#posPointValue" + i).innerHTML = x + ' ' + y;
    },
    initListenersPoints: function initListenersPoints() {
        pointEditor.points.map(function (point, i) {
            var shadow = utils_1.default.$$('#circle' + i);
            shadow.onmousedown = pointEditor.circleMouseDown;
            shadow.onmousemove = pointEditor.circleMouseMove;
            shadow.onmouseup = pointEditor.circleMouseUp;
            shadow.onclick = pointEditor.circleOnClick;
        });
    },
    addCenterPoint: function addCenterPoint() {
        pointEditor.area.appendChild(svgUtils_1.default.createForm('circle', {
            cx: '50%', cy: '50%', r: '0.1em',
            stroke: '#424242', fill: 'red'
        }));
    },
    circleMouseDown: function circleMouseDown(e) {
        pointEditor.clicked = true;
        drag_1.default.init(e.target);
        return false;
    },
    circleMouseMove: function circleMouseMove(e) {
        drag_1.default.move(e);
        if (pointEditor.clicked) {
            pointEditor.dragging = true;
        }
    },
    circleMouseUp: function circleMouseUp(e) {
        if (!pointEditor.dragging) {
            e.target.setAttribute('stroke', 'blue');
            e.target.setAttribute('stroke-width', '3px');
        }
    },
    circleOnClick: function circleOnClick() {
        pointEditor.dragging = false;
        pointEditor.clicked = false;
        drag_1.default.remove();
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pointEditor;

},{"./drag":2,"./keyframes":5,"./quicklightAPI":8,"./svgUtils":9,"./utils":10}],8:[function(require,module,exports){
'use strict';

var quicklightAPI = {
    steps: 100,
    animationDuration: '1500',
    hideMedianText: false,
    textColor: '#ffffff',
    color: '#ffffff',
    shadow: { x: 0, y: 0 },
    blur: '0',
    points: [],
    point2point: false,
    shadowsDefaultNumber: 8,
    set_Points: function set_Points() {
        var i = -1,
            j = -1,
            shadows;
        var len = quicklightAPI.steps + 1,
            len2 = quicklightAPI.shadowsDefaultNumber;
        quicklightAPI.points = [];
        while (++i < len) {
            j = -1;
            shadows = [];
            while (++j < len2) {
                shadows.push({
                    x: quicklightAPI.shadow.x,
                    y: quicklightAPI.shadow.y,
                    blur: quicklightAPI.blur,
                    color: quicklightAPI.color
                });
            }
            quicklightAPI.points.push({
                shadows: shadows
            });
        }
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = quicklightAPI;

},{}],9:[function(require,module,exports){
'use strict';

var pointEditor_1 = require('./pointEditor');
var editor_1 = require('./editor');
var utils_1 = require('./utils');
var svgUtils = {
    median: null,
    rectMedian: null,
    down: false,
    selection: [0],
    init: function init() {
        svgUtils.median = svgUtils.get_domSvg('svg');
        svgUtils.rectMedian = svgUtils.get_domSvg('rect');
    },
    createLayout: function createLayout() {
        svgUtils.rectMedian = svgUtils.createForm('rect', {
            x: '0', y: '0',
            width: '100%', height: '100%',
            fill: 'transparent'
        });
        svgUtils.median.setAttribute('width', '100%');
        svgUtils.median.setAttribute('height', '100%');
        svgUtils.median.appendChild(svgUtils.rectMedian);
        svgUtils.createEmptyRect();
        utils_1.default.$$('#medianChartRect').appendChild(svgUtils.median);
    },
    rectMouseHover: function rectMouseHover(e) {
        var id = parseInt(e.target.getAttribute('id'));
        if (e.target.getAttribute('fill') === 'transparent') {
            e.target.setAttribute('fill', 'red');
        }
        if (svgUtils.down && svgUtils.selection.indexOf(id) === -1) {
            svgUtils.selection.push(id);
            e.target.setAttribute('fill', 'blue');
        }
    },
    rectMouseLeave: function rectMouseLeave(e) {
        if (e.target.getAttribute('fill') === 'red') {
            e.target.setAttribute('fill', 'transparent');
        }
    },
    rectClick: function rectClick(e) {
        svgUtils.get_pointAt(svgUtils.selection);
        e.target.setAttribute('fill', 'blue');
        svgUtils.down = false;
    },
    activeDown: function activeDown(e) {
        svgUtils.down = true;
        svgUtils.selection = [parseInt(e.target.getAttribute('id'))];
        e.target.setAttribute('fill', 'blue');
    },
    createEmptyRect: function createEmptyRect() {
        var x,
            i = -1;
        var len = 101;
        while (++i < len) {
            x = i - 0.01 * i + '%';
            editor_1.default.points[i] = svgUtils.createForm('rect', {
                x: x, y: '0%',
                width: '0.99%', height: '100%',
                stroke: 'grey', 'stroke-width': '1px',
                fill: 'transparent', 'class': 'rectEmpty'
            }, [{ action: 'mouseover', callback: svgUtils.rectMouseHover }, { action: 'mouseleave', callback: svgUtils.rectMouseLeave }, { action: 'mousedown', callback: svgUtils.activeDown }, { action: 'mouseup', callback: svgUtils.rectClick }]);
            editor_1.default.points[i].setAttribute('id', i.toString());
            svgUtils.median.appendChild(editor_1.default.points[i]);
        }
    },
    createForm: function createForm(formType, formOptions, callbacks) {
        var formOption,
            item = svgUtils.get_domSvg(formType);
        for (formOption in formOptions) {
            if (utils_1.default.has.call(formOptions, formOption)) {
                item.setAttribute(formOption, formOptions[formOption]);
            }
        }
        if (callbacks) {
            callbacks.map(function (callback) {
                item.addEventListener(callback.action, callback.callback);
            });
        }
        return item;
    },
    get_pointAt: function get_pointAt(positions) {
        editor_1.default.set_allEmptyColorElse(positions);
        pointEditor_1.default.init(positions);
        positions.map(function (position) {
            editor_1.default.points[position].setAttribute('fill', 'blue');
        });
    },
    get_domSvg: function get_domSvg(type) {
        return document.createElementNS('http://www.w3.org/2000/svg', type);
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = svgUtils;

},{"./editor":3,"./pointEditor":7,"./utils":10}],10:[function(require,module,exports){
'use strict';

var u = {
    $$: function $$(name) {
        return window.document.querySelector(name);
    },
    has: Object.prototype.hasOwnProperty,
    get_contextName: function get_contextName(input) {
        return input.type === 'checkbox' ? 'checked' : 'value';
    },
    isPrevented: function isPrevented(input) {
        return input.type === 'checkbox' || input.type === 'color';
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = u;

},{}]},{},[1])


//# sourceMappingURL=bundle.js.map
