'use strict';

/*
*
* todo
*
* pour les bugs et autre, demander accès au trello
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

!(function _main_app() {

  // dom selector
  var $$ = function _$$(name) {
    return window.document.querySelector(name);
  };

  /*
   *
   *
   * quicklightAPI
   *
   *
   */

  var quicklightAPI = {

    steps: 100, // ne jamais bouger
    animationDuration: '3500', // durée de l'animation
    hideMedianText: false, // true/false pour hide le texte static (qui est le texte de base, sur lequel les shadows se clonent)
    textColor: '#ffffff', // couleur du texte
    color: '#ffffff', // couleur des shadows par default
    shadow: {x: 0, y: 0}, // position des shadows par défault à l'init
    blur: '0', // blur par défault à l'init
    points: [], // les 100 points représentant chaque % du keyframe
    point2point: true, // voir au top 'point2point'
    shadowsDefaultNumber: 2, // nombre de shadows par default
    preColor: '#ffffff',

    set_Points: function _set_Points() {
      var i, len,
          j, len2,
          shadows;

      i = -1;
      len = quicklightAPI.steps + 1; // on veux créer 100 points

      if (typeof quicklightAPI.steps === 'string') { // on évite les confusions
        quicklightAPI.steps = parseInt(quicklightAPI.steps);
      }
      quicklightAPI.points = [];
      while (++i < len) { // on push 101 point, qui représentent chaque % de la keyframe
        j = -1;
        len2 = this.shadowsDefaultNumber;
        shadows = [];
        while (++j < len2) {
          shadows.push({
            x: quicklightAPI.shadow.x,
            y: quicklightAPI.shadow.y,
            blur: quicklightAPI.blur,
            color: quicklightAPI.color
          })
        }
        quicklightAPI.points.push({
          shadows: shadows
        })
      }
    }

  };

  /*
   *
   *
   * End of quicklightAPI
   *
   *
   */

  /*
   *
   *
   * deepDiff
   *
   *
   */

  var deepDiff = { // un deepdiff pompé sur un jsfiddle, recursif

    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    unchanged: 'unchanged',

    map: function(obj1, obj2) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        return
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          type: this.compareValues(obj1, obj2),
          data: (obj1 === undefined) ? obj2 : obj1
        };
      }

      var diff,
          key;

      diff = {};

      for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
          if (this.isFunction(obj1[key])) {
            continue;
          }
          var value2 = undefined;
          if ('undefined' != typeof(obj2[key])) {
            value2 = obj2[key];
          }
          diff[key] = this.map(obj1[key], value2);
        }
      }
      for (key in obj2) {
        if (obj1.hasOwnProperty(key)) {
          if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
            continue;
          }
          diff[key] = this.map(undefined, obj2[key]);
        }
      }

      return diff;
    },

    compareValues: function(value1, value2) {
      if (value1 === value2) {
        return this.unchanged;
      }
      if ('undefined' == typeof(value1)) {
        return this.created;
      }
      if ('undefined' == typeof(value2)) {
        return this.deleted;
      }

      return this.updated;
    },

    isFunction: function(obj) {
      return {}.toString.apply(obj) === '[object Function]';
    },
    isArray: function(obj) {
      return {}.toString.apply(obj) === '[object Array]';
    },
    isObject: function(obj) {
      return {}.toString.apply(obj) === '[object Object]';
    },
    isValue: function(obj) {
      return !this.isObject(obj) && !this.isArray(obj);
    }

  };

  /*
   *
   *
   * End of deepDiff
   *
   *
   */

  /*
   *
   *
   * drag
   *
   *
   */

  var drag = { // drag n drop fonctionnel, spécialisé pour déplacer les Points (en bas à droite)

    selected: null,
    xPos: 0, yPos: 0,
    xElem: 0, yElem: 0,

    init: function _init(elem) {
      this.selected = elem;
      this.xElem = this.xPos - this.selected.cx.baseVal.value;
      this.yElem = this.yPos - this.selected.cy.baseVal.value;
    },

    move: function _move(e) {
      this.xPos = document.all ? window.event.clientX : e.pageX;
      this.yPos = document.all ? window.event.clientY : e.pageY;
      if (this.selected !== null) {
        this.selected.cx.baseVal.valueAsString = (this.xPos - this.xElem) + 'px';
        this.selected.cy.baseVal.valueAsString = (this.yPos - this.yElem) + 'px';
      }
    },

    remove: function _destroy() {
      this.selected = null;
    }

  };

  /*
   *
   *
   * End of drag
   *
   *
   */


  /*
   *
   *
   * listeners
   *
   *
   */
  
  /*
  * Objet générant des listeners sur des inputs,
  * bind un callback, et permet d'etre prevent
   */
  var listeners = {
    
    get_inputListenerFunc: function _get_inputListenerModel(input, callback, controlEvent) {
      return function _inputListenerFunc(event) {
        if (event && controlEvent) {
          event[controlEvent]();
        }
        callback(listeners.get_contextValue(input));
      }
    },

    get_contextValue: function _get_contextValue(input) {
      return input.type === 'checkbox' ? input.checked : input.value;
    },

    set_inputListeners: function _set_inputListeners(inputs, context, type) {
      var input;

      for (input in inputs) {
        if (inputs.hasOwnProperty(input)) {
          this.set_inputListener(
            inputs[input].input,
            editorCore['set_' + input + context],
            type,
            editor.inputs[input].prevented
          );
        }
      }
    },

    set_inputListener: function _set_inputListener(input, callback, type, prevented) {
      input.addEventListener(type, this.get_inputListenerFunc(input, callback, prevented ? 'preventDefault' : false), true);
    }
    
  };

  /*
   *
   *
   * End of listeners
   *
   *
   */

  /*
   *
   *
   * utils
   *
   *
   */

  var utils = { // des fonctions utiles de refacto

    get_contextName: function _get_contextName(input) {
      return input.type === 'checkbox' ? 'checked' : 'value';
    },
    
    isPrevented: function _isPrevented(input) {
      return input.type === 'checkbox'
        || input.type === 'color';
    }
    
  };

  /*
   *
   *
   * End of utils
   *
   *
   */

  /*
   *
   *
   * editorCore
   *
   *
   */

  /*
  * Il contient les fonctions essentielles à l'edit de #livePreview,
  * ainsi qu'à l'edit des valeurs affichées dans le front
   */
  var editorCore = {

    set_animationDurationValue: function _set_animationDurationValue(animationDuration) {
      quicklightAPI.animationDuration = animationDuration + 'ms';
      editorCore.set_styleProperty('#livePreview', 'animationDuration', animationDuration + 'ms');
    },

    set_animationDurationDisplay: function _set_animationDurationDisplay(animationDuration) {
      editorCore.set_property('#animationDurationValue', 'innerHTML', animationDuration);
    },

    set_hideMedianTextValue: function _set_hideMedianTextValue(hideMedianText) {
      quicklightAPI.hideMedianText = hideMedianText;
      if (quicklightAPI.preColor) {
        quicklightAPI.textColor = quicklightAPI.preColor;
        quicklightAPI.preColor = null;
      }
      editorCore.set_styleProperty(
        '#livePreview',
        'color',
        (hideMedianText ?
          'transparent' :
          quicklightAPI.textColor)
      );
    },

    set_hideMedianTextDisplay: function _set_hideMedianTextDisplay(hideMedianText) {
      editorCore.set_property('#hideMedianTextValue', 'innerHTML', hideMedianText);
    },

    set_textColorDisplay: function _set_textColorDisplay(textColor) {
      editorCore.set_property('#textColorValue', 'innerHTML', textColor);
    },

    set_textColorValue: function _set_textColorValue(textColor) {
      if (quicklightAPI.hideMedianText) {
        quicklightAPI.preColor = textColor;
      } else {
        quicklightAPI.textColor = textColor;
        editorCore.set_styleProperty('#livePreview', 'color', textColor);
      }
    },

    set_colorValue: function _set_colorValue(color) {
      quicklightAPI.color = color;
      editorCore.set_majorColor(color);
    },

    set_colorDisplay: function _set_colorDisplay(color) {
      editorCore.set_property('#colorValue', 'innerHTML', color);
    },
    
    set_point2pointValue: function _set_point2pointValue(point2point) {
      quicklightAPI.point2point = point2point;
    },

    set_point2pointDisplay: function _set_point2pointDisplay(point2point) {
      editorCore.set_property('#point2pointValue', 'innerHTML', point2point);
    },

    set_property: function _set_property(element, name, value) {
      $$(element)[name] = value;
    },

    set_styleProperty: function _set_styleProperty(element, name, value) {
      $$(element).style[name] = value;
    },

    set_majorColor: function _set_majorColor(color) {
      var i, len,
          j, len2;

      i = -1;
      len = quicklightAPI.points.length;

      while (++i < len) {
        j = -1;
        len2 = quicklightAPI.points[i].shadows.length;
        while (++j < len2) {
          quicklightAPI.points[i].shadows[j].color = color;
        }
      }
      keyframes.set_keyFrames();
    }
    
  };

  /*
   *
   *
   * End of editorCore
   *
   *
   */

  /*
   *
   *
   * keyframes
   *
   *
   */

  /*
  * Générateur de keyframe
  * permet de créer un keyframe à partir des valeurs présentent dans quicklightAPI
   */
  var keyframes = {

    get_textShadow: function _get_textShadow(position) {
      var i, len,
          point, str,
          shadow;

      i = -1;
      point = quicklightAPI.points[position];
      len = point.shadows.length;
      str = '';
      while (++i < len) {
        shadow = point.shadows[i];
        if (i + 1 != len) {
          str += shadow.color + ' ' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px, ';
        } else {
          str += shadow.color + ' ' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px';
        }
      }

      return str + ";";
    },

    get_propertiesAt: function _get_propertiesAt(position, vendor) {
      return (vendor + 'text-shadow: ' + this.get_textShadow(position));
    },

    set_style: function _set_style(styleStr) { // append le keyframe généré dans une balise style
      var style,
        animation,
        head,
        livePreview;

      head = $$('head');
      style = window.document.createElement('style');
      animation = window.document.createTextNode(styleStr);
      livePreview = $$('#livePreview');

      if ($$('style')) {
        $$('style').remove();
      }
      livePreview.style.animationName = 'generated_glitch';
      style.type = 'text/css';
      style.appendChild(animation);
      head.appendChild(style);
    },

    isNotSetted: function _isNotSetted(shadows) {
      for (var i = 0, len = shadows.length; i < len; i++) {
        var point = shadows[i];
        if (!point.x && !point.y && point.color === "#ffffff") {
          return true;
        }
      }
      return false;
    },

    // génère la string keyframe, à appeler dès qu'on à besoin de refresh l'animation
    set_keyFrames: function _set_keyFrames() {
      var steps, str,
          i, len, j,
          vendors, vendor;

      i = -1;
      str = '';
      vendors = ['','-webkit-','-moz-'];
      steps = quicklightAPI.steps + 1;
      len = vendors.length;

      while (++i < len) {
        vendor = vendors[i];
        str += '@' + vendor + 'keyframes generated_glitch {\n';
        j = -1;
        while (++j < steps) {
          var frame = this.get_propertiesAt(j, vendor);
          if (quicklightAPI.point2point) {
            if (!this.isNotSetted(quicklightAPI.points[j].shadows)) {
              str += j + '% { ' + frame + ' }\n';
            }
          } else {
            str += j + '% { ' + frame + ' }\n';
          }
        }
      }
      this.set_style(str);
    }

  };

  /*
   *
   *
   * End of keyframes
   *
   *!
   */

  /*
   *
   *
   * svgUtils
   *
   *
   */

  /*
  * Génère chaque % en rectangle svg
  * en bas de l'editor
  * manipule des svg donc gaffe pas tout css
  * catch le click sur un rectangle
   */
  var svgUtils = {

    median: null,
    rectMedian: null,
    down: false,
    selection: [0],

    init: function _init() {
      this.median = this.get_domSvg( 'svg');
      this.rectMedian = this.get_domSvg( 'rect');
    },

    createLayout: function _createLayout() {
      var rectMedian;

      rectMedian = this.createForm('rect', {
        x: '0', y: '0',
        width: '100%', height: '100%',
        fill: 'transparent'
      });

      this.rectMedian = rectMedian;
      this.median.setAttribute('width', '100%');
      this.median.setAttribute('height', '100%');
      this.median.appendChild(this.rectMedian);
      this.createEmptyRect();
      $$('#medianChartRect').appendChild(this.median);
    },

    rectMouseHover: function _rectMouseHover(e) {
      var id;

      id = parseInt(e.target.getAttribute('id'));

      if (e.target.getAttribute('fill') === 'transparent') {
        e.target.setAttribute('fill', 'red');
      }
      if (svgUtils.down && svgUtils.selection.indexOf(id) === -1) {
        svgUtils.selection.push(id);
        e.target.setAttribute('fill', 'blue');
      }
    },

    rectMouseLeave: function _rectMouseLeave(e) {
      if (e.target.getAttribute('fill') === 'red') {
        e.target.setAttribute('fill', 'transparent');
      }
    },

    rectClick: function _rectClick(e) {
      svgUtils.get_pointAt(svgUtils.selection);
      e.target.setAttribute('fill', 'blue');
      svgUtils.down = false;
    },

    activeDown: function _activeDown(e) {
      svgUtils.down = true;
      svgUtils.selection = [parseInt(e.target.getAttribute('id'))];
      e.target.setAttribute('fill', 'blue');
    },

    createEmptyRect: function _createEmptyRect() {
      var x, iInt,
          i, len;

      i = -1;
      len = 101;

      while (++i < len) {
        iInt = parseInt(i);
        x = (iInt - (0.01 * iInt)) + '%';
        editor.points[i] = this.createForm( 'rect', {
          x: x, y: '0%',
          width: '0.99%', height: '100%',
          stroke: 'grey', 'stroke-width': '1px',
          fill: 'transparent', class: 'rectEmpty'
        }, [
          { action: 'mouseover', callback: this.rectMouseHover },
          { action: 'mouseleave', callback: this.rectMouseLeave },
          { action: 'mousedown', callback: this.activeDown },
          { action: 'mouseup', callback: this.rectClick }
        ]);
        editor.points[i].setAttribute('id', i.toString());
        this.median.appendChild(editor.points[i]);
      }
    },

    createForm: function _createForm(formType, formOptions, callbacks) {
      var item,
          formOption,
          i, len,
          callback;

      item = this.get_domSvg( formType);

      for (formOption in formOptions) {
        if (formOptions.hasOwnProperty(formOption)) {
          item.setAttribute(formOption, formOptions[formOption]);
        }
      }
      if (callbacks) {
        i = -1;
        len = callbacks.length;
        while (++i < len) {
          callback = callbacks[i];
          item.addEventListener(callback.action, callback.callback);
        }
      }

      return item;
    },

    get_pointAt: function _addPointAt(positions) {
      var i, len;

      i = -1;
      len = positions.length;

      editor.set_allEmptyColorElse(positions);
      pointEditor.init(positions);
      while (++i < len) {
        editor.points[positions[i]].setAttribute('fill', 'blue');
      }
    },

    get_domSvg: function _get_domSvg(type) {
      return document.createElementNS('http://www.w3.org/2000/svg', type);
    }
    
  };

  /*
   *
   *
   * End of svgUtils
   *
   *
   */

  /*
   *
   *
   * pointEditor
   *
   *
   */

  /*
  * Génère les Points en bas à droite
  * le cadre etc...
  * catch les nouveles positions
   */
  var pointEditor = {

    area: null,
    points: [],
    positions: [],
    pointsPosition: [],
    clicked: false,
    dragging: false,

    init: function _init(positions) {
      this.positions = positions;
      if (this.points.length) {
        this.clearPositions();
      } else {
        this.createLayout();
      }
      this.updateTitle();
      this.addXYPoints();
      this.initListenersPoints();
      this.addCenterPoint();
    },

    clearPositions: function _clearPositions() {
      var i = -1,
          len = this.points.length;

      while (++i < len) {
        this.pointsPosition[i] = { x: 0, y: 0 };
      }
      $$('#colorContainer').innerHTML = '';
      $$('#posContainer').innerHTML = '';
      $$('#blurContainer').innerHTML = '';
    },

    createLayout: function _createLayout() {
      var rect;

      rect = svgUtils.createForm('rect', {
        x: '0', y: '0',
        width: '100%', height: '100%',
        fill: '#424242'
      });

      this.area = svgUtils.get_domSvg('svg');
      this.area.style.height = '100%';
      this.area.style.width = '100%';
      this.area.appendChild(rect);
      $$('#pointPreview').appendChild(this.area);
    },

    updateTitle: function _updateTitle() {
      var len;

      len = this.positions.length;

      if (len > 1) {
        $$('#pointNumber').innerHTML = this.positions[0].toString() + ' -> ' + this.positions[(len - 1)].toString();
      } else {
        $$('#pointNumber').innerHTML = this.positions[0].toString();
      }
    },

    calcNewPos: function _calcNewPos(x, y, context) {
      var circle,
          diffX,
          diffY,
          i, len,
          shadow;

      i = -1;
      len = this.positions.length;
      circle = this.pointsPosition[context];
      diffX = x - circle.x;
      diffY = y - circle.y;
      circle.x = x;
      circle.y = y;

      while (++i < len) {
        shadow = quicklightAPI.points[this.positions[i]].shadows[context];
        if (i === 0) {
          shadow.x += diffX;
          shadow.y += diffY;
        } else {
          shadow.x = quicklightAPI.points[this.positions[0]].shadows[context].x;
          shadow.y = quicklightAPI.points[this.positions[0]].shadows[context].y;
        }
      }
      i = -1;
      len = this.points.length;
      while (++i < len) {
        this.updateView(quicklightAPI.points[this.positions[0]].shadows[i].x, quicklightAPI.points[this.positions[0]].shadows[i].y, i);
      }
      keyframes.set_keyFrames();
    },

    calcNewPosEvent: function _calcNewPosEvent(context) {
      return function(e) {
        pointEditor.calcNewPos(e.offsetX, e.offsetY, context);
      }
    },

    addXYPoints: function _addXYPoints() {
      this.set_points();
      this.set_shadowValues();
      this.set_templateContainer();
      this.set_PointsPopover();
    },

    set_templateContainer: function _set_templateContainer() {
      var i, len;

      i = -1;
      len = this.points.length;

      while (++i < len) {
        this.addOneShadow(i);
      }
    },
    
    addOneShadow: function _addOneShadow(number) {
      $$("#colorContainer").innerHTML += $$("#colorPoint").innerHTML;
      $$("#posContainer").innerHTML += $$("#posPoint").innerHTML;
      $$("#blurContainer").innerHTML += $$("#blurPoint").innerHTML;
      $$('#colorPointValue').id += number;
      $$("#colorContainer").getElementsByTagName('label')[0].for += number;
      $$('#colorPointInput').id += number;
      $$('#nbColor').innerHTML = number;
      $$('#nbColor').id += number;
      $$('#blurPointValue').id += number;
      $$("#blurContainer").getElementsByTagName('label')[0].for += number;
      $$('#blurPointInput').id += number;
      $$('#nbBlur').innerHTML = number;
      $$('#nbBlur').id += number;
      $$('#nbPoint').innerHTML = number;
      $$('#nbPoint').id += number;
      $$("#posPointValue").id += number;
    },

    set_points: function _set_points() {
      var i, len;

      i = -1;
      len = quicklightAPI.shadowsDefaultNumber;

      if (this.points.length) {
        this.removePoints();
      }
      while (++i < len) {
        this.set_point(i);
      }
    },
    
    set_point: function _set_point(position) {
      this.pointsPosition[position] = { x: 0, y: 0 };
      this.points[position] = svgUtils.createForm('circle', {
        cx: '50%', cy: '50%', r: '0.5em',
        stroke: '#424242', 'stroke-width': '1px',
        fill: 'black', id: 'circle' + position
      }, [
        {action: 'mouseup', callback: this.calcNewPosEvent(position)}
      ]);
      this.area.appendChild(this.points[position]);
    },

    removePoints: function _removepoints() {
      var i, len;

      i = -1;
      len = this.points.length;

      while (++i < len) {
        this.area.removeChild(this.points[i]);
      }
    },

    set_shadowValues: function _set_circleValues() {
      var that,
          i, len;

      that = this;
      i = -1;

      setTimeout(function() {
        len = that.points.length;
        while (++i < len) {
          that.set_shadowValue(i);
        }
      }, 0);
    },
    
    set_shadowValue: function _set_shadowValue(position) {
      var point, pointPos, shadow,
          xBaseVal, yBaseVal;
      
      point = this.points[position];
      pointPos = this.pointsPosition[position];
      shadow = quicklightAPI.points[pointEditor.positions[0]].shadows[position];
      xBaseVal = point.cx.baseVal;
      yBaseVal = point.cy.baseVal;
      
      xBaseVal.value = (xBaseVal.value + shadow.x);
      yBaseVal.value = (yBaseVal.value + shadow.y);
      point.setAttribute('r', point.r.baseVal.value + "px");
      pointPos.x = xBaseVal.value;
      pointPos.y = yBaseVal.value;
      this.calcNewPos(pointPos.x, pointPos.y, position);
    },

    set_changeInputColor: function _set_changeInputColor(id) {
      return function(e) {
        var i, len;

        i = -1;
        len = pointEditor.positions.length;

        while (++i < len) {
          quicklightAPI.points[pointEditor.positions[i]].shadows[id].color = e.target.value;
        }
        keyframes.set_keyFrames();
      };
    },

    set_PointsPopover: function _set_PointsPopover() {
      var i = -1;
      var len = this.points.length;
      while (++i < len) {
        $$("#colorPointInput" + i).value = quicklightAPI.points[pointEditor.positions[0]].shadows[i].color;
        $$("#colorPointInput" + i).onchange = this.set_changeInputColor(i.toString());
        $$("#blurPointInput" + i).value = quicklightAPI.points[pointEditor.positions[0]].shadows[i].blur;
        $$("#blurPointInput" + i).onchange = this.set_changeInputBlur(i.toString());
      }
    },

    set_changeInputBlur: function _set_changeInputBlur(id) {
      return function(e) {
        var i, len;

        i = -1;
        len = pointEditor.positions.length;

        while (++i < len) {
          quicklightAPI.points[pointEditor.positions[i]].shadows[id].blur = e.target.value;
        }
        keyframes.set_keyFrames();
      };
    },

    updateView: function _updateview(x, y, i) {
      $$("#posPointValue" + i).innerHTML = parseInt(x) + ' ' + parseInt(y);
    },

    initListenersPoints: function _initListenersPoints() {
      var i, len,
          shadow;

      i = -1;
      len = this.points.length;

      while (++i < len) {
        shadow = $$('#circle' + i);
        shadow.onmousedown = this.circleMouseDown;
        shadow.onmousemove = this.circleMouseMove;
        shadow.onclick = this.circleOnClick;
      }
    },

    addCenterPoint: function _addCenterPoint() {
      this.area.appendChild(
        svgUtils.createForm('circle', {
          cx: '50%', cy: '50%', r: '0.1em',
          stroke: '#424242', fill: 'red'
        })
      );
    },

    circleMouseDown: function _circleMouseDown() {
      this.clicked = true;
      drag.init(this);
      return false;
    },

    circleMouseMove: function _circleMouseMove(e) {
      drag.move(e);
      if (this.clicked) {
        this.dragging = true;
      }
    },

    // circleMouseUp: function _circleMouseUp(e) {
    //   if (!this.dragging) {
    //     e.target.setAttribute('stroke', 'blue');
    //     e.target.setAttribute('stroke-width', '3px');
    //     // select this circle and init point
    //   }
    // },

    circleOnClick: function _circleOnClick() {
      this.dragging = false;
      this.clicked = false;
      drag.remove();
    }

  };

  /*
   *
   *
   * End of pointEditor
   *
   *
   */

  /*
   *
   *
   * editor
   *
   *
   */

  /*
  * Objet initer
  * remplir inputNames pour ajouter un nouvel input
  * si y a une fonction à init c'est ici
   */
  var editor = {

    values: {},
    inputs: {},
    points: new Array(101),

    contextTypeEvents: {
      Display: 'input',
      Value: 'change'
    },

    inputNames: {
      'animationDuration': {type: 'range'},
      'hideMedianText': {type: 'checkbox'},
      'textColor': {type: 'color'},
      'color': {type: 'color'},
      'point2point': {type: 'checkbox'}
    },

    init: function _init() {
      this.init_values();
      this.init_inputs();
      this.init_inputListeners();
      this.init_svg();
      this.init_keybinding();
      this.init_keyframe();
    },

    init_values: function _init_values() {
      quicklightAPI.set_Points();
    },

    init_inputs: function _init_inputs() {
      var name,
        input,
        display;

      for (name in this.inputNames) {
        if (this.inputNames.hasOwnProperty(name)) {
          this.inputs[name] = {
            input: $$('#' + name + 'Input'),
            display: $$('#' + name + 'Value'),
            prevented: utils.isPrevented(this.inputNames[name])
          };
          input = this.inputs[name].input;
          input[utils.get_contextName(input)] = quicklightAPI[name];
          display = this.inputs[name].display;
          display.innerHTML = quicklightAPI[name];
        }
      }
    },

    init_svg: function _init_svg() {
      svgUtils.init();
      svgUtils.createLayout();
      svgUtils.rectClick({target: editor.points[0]});
    },

    init_keyframe: function _init_keyframe() {
      keyframes.set_keyFrames();
    },

    init_inputListeners: function _init_inputListeners() {
      var context;

      for (context in this.contextTypeEvents) {
        if (this.contextTypeEvents.hasOwnProperty(context)) {
          listeners.set_inputListeners(
            this.inputs,
            context,
            this.contextTypeEvents[context]
          );
        }
      }
    },

    set_allEmptyColorElse: function _set_allEmptyColorElse(positions) {
      var i, len,
          j, len2;

      i = -1;
      len = this.points.length;
      while (++i < len) {
        j = -1;
        len2 = positions.length;
        while (++j < len2) {
          if (i !== positions[j]) {
            this.points[i].setAttribute('fill', 'transparent');
          }
        }
      }
    },

    init_keybinding: function _init_keybinding() {
      // window.addEventListener('keydown', function(e) {
      //   switch (e.keyCode) {
      //     case 37: // left
      //       break;
      //     case 39: // right
      //       break;
      //   }
      // });
    }

  };

  /*
   *
   *
   * End of editor
   *
   *
   */

  var app = {
    init: function _init() {
      editor.init();
    }
  };

  app.init();
}());
