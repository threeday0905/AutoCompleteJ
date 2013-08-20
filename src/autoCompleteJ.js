/*
  AutoComleteJ.js
    This widget provide two ways to build the autocomplete UI.
      - HTML5, use native <datalist />
      - Legacy, use <li /> to simulate the auto complete fature.

    It could switch by options, please see the README file for more detail description.
*/

'use strict';

(function(window) {

  if (!window || !window.document) {
    throw new Error('This library can only used on browser.');
  }

  var document = window.document,
      body = document.body,
      console  = window.console;

  var toStr   = Object.prototype.toString,
      hasOwn  = Object.prototype.hasOwnProperty;


  /**
    Polyfill ES5 Methods,
     - string   : trim
     - array    : forEach, map, indexOf, filter
     - function : bind
  **/

  if (!String.prototype.trim) {
    String.prototype.trim = function(){ return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,''); };
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      for(var idx = 0, len = this.length; idx < len; idx++) {
        fn.call(scope, this[idx], idx, this);
      }
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function(fun, scope) {
      if (typeof fun !== 'function') {
        throw new TypeError();
      }
      var len = this.length;
      var res = new Array(len);
      for (var idx = 0; idx < len; idx++) {
        if (idx in this) {
          res[idx] = fun.call(scope, this[idx], idx, this);
        }
      }
      return res;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex ) {
      if (this === null) { throw new TypeError(); }
      var len = this.length, n = 0, k;
      if (len === 0) { return -1; }
      if (fromIndex) {
        n = Number(fromIndex);
        if (isNaN(n)) {
          n = 0;
        } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) { return -1; }
      k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (k; k < len; k++) {
        if (this[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun, scope) {
      if (this === null) { throw new TypeError(); }
      if (typeof fun !== 'function') { throw new TypeError(); }

      var res = [], val;
      for (var i = 0, len = this.length; i < len; i++) {
        if (i in this) {
          val = this[i];
          if (fun.call(scope, val, i, this)) {
            res.push(val);
          }
        }
      }
      return res;
    };
  }

  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') { throw new TypeError(); }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          FNOP = function () {},
          fBound = function () {
            return fToBind.apply(
              this instanceof FNOP && oThis ? this : oThis,
              aArgs.concat(Array.prototype.slice.call(arguments))
            );
          };

      FNOP.prototype = this.prototype;
      fBound.prototype = new FNOP();
      return fBound;
    };
  }

  /**
    Shared Tools,
      - is   methods -> check object format
      - oo   methods -> composite Object, e.g. inherit, mixin, etc.
      - evt  methods -> bind event to element
      - css  methods -> control element class
      - elem methods -> add element into document

  **/
  var tool = {
    is: {
      arr  : Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
      },
      obj   : function(obj) {
        //return obj === Object(obj);
        return toStr.call(obj) === '[object Object]';
      },
      fn    :  function(obj) {
        return toStr.call(obj) === '[object Function]';
      },
      reg   :  function(obj) {
        return toStr.call(obj) === '[object RegExp]';
      },
      date  :  function(obj) {
        return toStr.call(obj) === '[object Date]';
      },
      str   : function(obj) {
        return toStr.call(obj) === '[object String]';
      },
      num   : function(obj) {
        return toStr.call(obj) === '[object Number]';
      },
      bool  : function(obj) {
        return toStr.call(obj) === '[object Boolean]';
      },
      undef : function(obj) {
        return obj === void 0;
      },
      empty : function(obj) {
        if (obj === null || obj === undefined) { return true; }
        if (tool.is.arr(obj) || tool.is.str(obj)) {
          return obj.length === 0;
        }
        for (var key in obj) {
          if (hasOwn(key)) {
            return false;
          }
        }
        return true;
      },
      element : function(obj) {
        return !!(obj && obj.nodeType === 1);
      }
    },
    oo: {
      inherit: (function() {
        var Fake = function () {};
        return function(Child, Parent) {
          Fake.property = Parent.prototype;
          Child.property = new Fake();
          Child.uber = Parent.prototype;
          Child.prototype.constructor = Child;
        };
      }()),
      mixin: function(target) {
        var supplier, property, receiver, descriptor;
        receiver = target || {};
        if (arguments.legnth <= 1 ) { return receiver; }
        for (var i = 1, len = arguments.length; i < len; i++) {
          supplier = arguments[i];
          if (supplier) {
            if (Object.keys) {
              var keys = Object.keys(supplier);
              for (var j = 0, len2 = keys.length; j < len2; j++ ) {
                property = keys[j];
                if (tool.is.obj(supplier[property])) {
                  if (tool.is.empty(receiver[property]) || !tool.is.obj(receiver[property])) {
                    receiver[property] = tool.is.arr(supplier[property]) ? [] : {};
                  }
                  tool.oo.mixin(receiver[property], supplier[property]);
                } else {
                  descriptor = Object.getOwnPropertyDescriptor(supplier, property);
                  if (tool.is.obj(descriptor)) {
                    Object.defineProperty(receiver, property, descriptor);
                  } else {
                    receiver[property] = descriptor;
                  }

                }
              }

            } else {
              for (property in supplier) {
                if (supplier.hasOwnProperty(property)) {
                  if (tool.is.obj(supplier[property])) {
                    if (tool.is.empty(receiver[property]) || !tool.is.obj(receiver[property])) {
                      receiver[property] = tool.is.arr(supplier[property]) ? [] : {};
                    }
                    tool.oo.mixin(receiver[property], supplier[property]);
                  } else {
                    receiver[property] = supplier[property];
                  }
                }
              }
            }
          }
        }
        return receiver;
      }
    },
    evt: {
      bind: function(obj, type, fn) {
        if (!tool.is.element(obj) || !type || !tool.is.fn(fn)  ) { return false; }
        if (obj.addEventListener) {
          obj.addEventListener(type, fn, false);
        } else if (obj.attachEvent) {
          obj.attachEvent('on' + type, function(e) {
            var self = this;
            e = e || window.event;
            e.preventDefault  = e.preventDefault  || function(){ e.returnValue = false; };
            e.stopPropagation = e.stopPropagation || function(){ e.cancelBubble = true; };
            fn.call(self, e);
          });
        }
      }
    },
    css: (function() {
      var support = document.createElement('div').classList !== undefined;
      function update(method, alter) {
        return support ?
          function(dom, className) {
            if (!className) { return; }
            dom.classList[method](className);
          } :
          function(dom, className) {
            if (!className) { return; }
            var classArr = dom.className.split(/\s+/),
                index = classArr.indexOf(className);
            alter(classArr, index, className);
            dom.className = classArr.join(' ');
          };
      }
      return {
        add: update('add', function(classArr, index, className) {
          if (index === -1) { classArr.push(className); }
        }),
        remove: update('remove', function(classArr, index, className) {
          if (index > -1) { classArr.splice(index, 1); }
        }),
        toggle: update('toggle', function(classArr, index, className) {
          if (index > -1) { classArr.splice(index, 1); }
          else { classArr.push(className);}
        }),
        contains: function(dom, className) {
          return support ? dom.classList.contains(className) : dom.className.lastIndexOf(className) > -1;
        }
      };

    }()),
    elem: {
      appendChild: function(newEl, targetEl) {
        targetEl.appendChild(newEl);
      },
      insertBefore: function(newEl, targetEl) {
        var parentEl = targetEl.parentNode;
        parentEl.insertBefore(newEl, targetEl);
      },
      insertAfter: function(newEl, targetEl) {
        var parentEl = targetEl.parentNode;
        if(parentEl.lastChild === targetEl) {
          parentEl.appendChild(newEl);
        } else {
          parentEl.insertBefore(newEl,targetEl.nextSibling);
        }
      }
    },
    style: {
      computed: function(elem) {
        return elem.currentStyle || document.defaultView.getComputedStyle(elem, null);
      }
    }
  };


  /**
    Core coreFlag, it will reuse on different functions.

  **/
  var coreFlag = {
    //is browser support native datalist feature
    nativeSupported:
      !!(document.createElement('datalist') && window.HTMLDataListElement),

    html5: {
      inputListProp : 'list',
      listTag       : 'datalist',
      optionsHtml   : '<option value="{value}"/>',
      replaceToken  : '{value}'
    },
    legacy: {
      inputListProp : 'list',
      listTag       : 'ul',
      optionsHtml   : '<li>{value}</li>',
      replaceToken  : '{value}'
    }
  };

  /**
    Default Widget Settings, those could be replaced by user options argument

  **/
  var defaultOptions = {
    // set true to use html5 native autoComplete UI if browser is support.
    // set false to use legacy mode.
    html5      : true,

    // callback functions
    onInit      : false,  //triggered by widget init
    onMatched   : false,  //triggered by input text match the source.
    onUnMatched : false,  //if it has been matched, but enter another word then cause un-match.
    onKeyUp     : false,  //triggered by key up
    onKeyDown   : false,

    /* B: Above options will only work on legacy mode. */
    ignoreCase : true,

    // false: check if the string start with search txt.
    // true: check if the string contains the search text
    searchAny  : true,

    maxEntries : 1000,
    // true: sort the result
    // {function} : sort the result with this function
    sort       : false,

    // all style should be controled by CSS files.
    className: {
      datalist     : 'autoCompleteJ-datalist',
      wrapper      : 'autoCompleteJ-wrapper',
      active       : 'autoCompleteJ-active',
      opacity      : 'autoCompleteJ-opacity',
      hover        : 'autoCompleteJ-active'
    },
    /* E: Above options will only work on legacy mode. */

    /* TODO: Load auto complete result per AJAX mode*/
    ajax: false,
    delay: 2,
    minLength: 2
  };


  /**
    ClassName: AutoComleteJ
      Main UI Lib Constructor,
        it will call different sub constructor by different way.

  **/
  var AutoCompleteJ = function(domOrId, source, userOptions) {
    var self = this;

    var init = AutoCompleteJ._initMethods,
        factory = init.factory;

    //give the unique id
    self.id = init.getInstanceId();

    //init options
    var options = tool.oo.mixin({}, defaultOptions, userOptions);
    self.options = self.addFlagInOptions(options);

    //init and check target input
    self.input = init.makeInputByIdOrSelf(domOrId);
    if (!init.validateInput(self.input)) {
      return; // it should throw error if the dom is not match our expect
    }

    //init and check data source
    self.source = init.makeArrayIfSourceIsEmpty(source);
    if (!init.validateSource(self.source)) {
      return; // it should throw error if the source format is illegal.
    }

    //call factory by different way
    var html5 = self.options.html5 && coreFlag.nativeSupported;
    var factoryName = html5 ? 'html5' : 'legacy';

    self.engine = factory(factoryName, self);
    self.engineType = factoryName;

    //on init callback
    if (tool.is.fn(options.onInit)) {
      options.onInit.call(null);
    }
  };

  /**
    ClassName: AutoComleteJ
      Instance Methods

  **/
  AutoCompleteJ.prototype = {
    addFlagInOptions: function(options) {
      var self = this;
      options = options || self.options;

      if (tool.is.fn(options.onMatched) || tool.is.fn(options.onUnMatched)) {
        options.listenerNeeded = true;
      }
      return options;
    }
  };

  /**
    ClassName: AutoComleteJ
      Static Methods

  **/
  AutoCompleteJ._initMethods = {
    //give unique id on every instance
    instanceCount: 0,
    getInstanceId: function() {
      var id = String(++this.instanceCount);
      return 'datalist_' + new Array(3 - id.length).join('0') + id;
    },
    //init UI lib by different way.
    factory: function(factoryName, parentInstance) {
      if (!factoryName) {
        throw new Error('Factory method need factoryName');
      }
      var engine;

      switch(factoryName) {
      case 'html5':
        engine = new AutoCompleteHTML5(parentInstance);
        break;
      default:
        engine = new AutoCompleteLegacy(parentInstance);
        break;
      }
      return engine;
    },
    // init target input by self element or id
    makeInputByIdOrSelf: function(domOrId) {
      var dom;
      if (tool.is.element(domOrId)) {
        dom = domOrId;
      } else if (tool.is.str(domOrId)) {
        dom = document.getElementById(domOrId);
      }
      return dom;
    },

    // make sure the input is match our expect
    validateInput: function(dom) {
      if (!tool.is.element(dom)) {
        throw new Error('The element is not exists');
      }

      var tagName = dom.tagName.toLowerCase();
      if (tagName !== 'input') {
        throw new Error('The element is not an input element');
      }

      //var inputType = dom.type.toLowerCase();
      //TODO - validate input type to avoid user assign autoComplete into color / range / etc. input
      return true;
    },

    makeArrayIfSourceIsEmpty: function(datalist) {
      if (datalist === null || datalist === undefined) {
        datalist = [];
      }
      return datalist;
    },
    // current we are only accept the source with string-array format
    validateSource: function(datalist) {
      if (!tool.is.arr(datalist)) {
        throw new Error('Datalist should be array type');
      }

      for (var idx = 0, len = datalist.length; idx < len; idx++) {
        if(!tool.is.str(datalist[idx])) {
          throw new Error('Index #' + idx + 'in datalist should be string format');
        }
      }
      return true;
    }
    /* TODO - 1: it should give a method to unfold the complex object into our expect foramt */
    /* TODO - 2: it should give a method to load source via AJAX */
  };

  /**
    ClassName: DataListContainer
      Generate DataList Container,
       - it will generate <datalist> when html5 mode.
       - it will generate <ul> when legacy mode.

  **/
  var DataListContainer = function(source, options) {
    var self = this;

    self.options = options;
    self.element = self.generateContainer();

    self.updateSource(source);
    self.updateContent();
  };

  DataListContainer.prototype = {
    /* B: Helper functions */
    isItemMatchSource: function(text) {
      var self = this;
      return self.options.ignoreCase ?
        self._lowerCaseSource.indexOf(text.toLowerCase()) > -1 :
        self.source.indexOf(text) > -1;
    },
    updateSource: function(newSource) {
      var self = this;
      self.source = newSource;
      if(self.options.ignoreCase) {
        self._lowerCaseSource = self.source.map(function(val) {
          return val.toLowerCase();
        });
      }
    },
    /* E: Helper functions */

    /* B: Control the source */
    sortSource: function(source) {
      var self = this;
      var sort = self.options.sort;

      if (sort === true) {
        source.sort();
      } else if (tool.is.fn(sort)){
        source.sort(sort);
      }
      return source;
    },
    sliceSource: function(source) {
      var self = this;
      if (!self.options.html5engine && source.length > self.options.maxEntries) {
        source = source.slice(0, self.options.maxEntries);
      }
      return source;
    },
    filterSource: function(searchText, source) {
      var self = this;
      var result;

      if (self.options.searchAny) {
        if (self.options.ignoreCase) {
          result = source.filter(self.getSearchAnyICFn(searchText));
        } else {
          result = source.filter(self.getSearchAnyFn(searchText));
        }
      } else {
        if (self.options.ignoreCase) {
          result = source.filter(self.getSearchStartICFn(searchText));
        } else {
          result = source.filter(self.getSearchStartFn(searchText));
        }
      }

      //cache necessary datas for next filter event
      self._lastSearchText = searchText;
      self._lastFilterResult = result;
      return result;
    },
    getTargetSource: function(searchText) {
      var self = this;

      var source;

      // if user expand search condition, then use cached result as data source
      var lastSearchText   = self._lastSearchText,
          lastFilterResult = self._lastFilterResult;

      if (lastSearchText && lastFilterResult &&
          searchText.length > lastSearchText.length &&
          new RegExp('^' + lastSearchText).test(searchText) ) {
        source = lastFilterResult;
      } else {
        source = self.source;
      }

      return source;
    },
    /* E: Control the source */

    /* B: Search Methods */
    getSearchAnyFn: function(searchText) {
      return function(val) {
        return val.lastIndexOf(searchText) > -1;
      };
    },
    getSearchAnyICFn: function(searchText) {
      searchText = searchText.toLowerCase();
      return function(val) {
        return val.toLowerCase().lastIndexOf(searchText) > -1;
      };
    },
    getSearchStartFn: function(searchText) {
      var searchTextLength = searchText.length;
      return function(val) {
        return val.substr(0, searchTextLength) === searchText;
      };
    },
    getSearchStartICFn: function(searchText) {
      var searchTextLength = searchText.length;
      searchText = searchText.toLowerCase();
      return function(val) {
        return val.toLowerCase().substr(0, searchTextLength) === searchText;
      };
    },
    /* E: Search Methods */

    /* B: Control the document element */
    updateContent: function(searchText) {
      var self = this;
      var source = self.source;
      if (searchText) {
        source = self.getTargetSource(searchText);
        source = self.filterSource(searchText, source);
      }

      source = self.sliceSource(source);
      source = self.sortSource(source);
      self.element.innerHTML = self.generateListHtml(source);
    },
    generateContainer: function() {
      var self      = this;
      var tagName   = self.options.containerTag;
      var container = document.createElement(tagName);
      return container;
    },
    generateListHtml: function(source) {
      var self = this;

      var htmlSample   = self.options.listHtmlSample,
          replaceToken = self.options.htmlReplaceToken;

      var parseMethod = self.getHTMLParseMethod(htmlSample, replaceToken);
      var htmlArray   = source.map(parseMethod);

      return htmlArray.join('');
    },
    /* E: Control the document element */

    /*B: HTML Parse methods */
    getHTMLParseMethod: function(htmlSample, replaceToken) {
      var parseMethod;

      // get replace regex from token string, default: {value}
      var regexText = replaceToken.replace(/(\{|\})/g, function(match, bracket) {
        return '\\' + bracket;
      });
      var regex = new RegExp(regexText, 'g');


      var tokenNum = htmlSample.match(regex);

      // if there is only one token, then use string contact to improve preformance
      if (tokenNum.length === 1) {
        var replaceSymbolIndex = htmlSample.search(regex),
            replaceSymbolLength = replaceToken.length;

        var htmlStart = htmlSample.substr(0, replaceSymbolIndex),
            htmlEnd   = htmlSample.substr(replaceSymbolIndex + replaceSymbolLength);

        parseMethod = this.getMethodToConcat(htmlStart, htmlEnd);
      } else {
        parseMethod = this.getMethodToReplace(regex, htmlSample);
      }

      return parseMethod;
    },
    getMethodToReplace: function(regex, htmlSample) {
      return function(value) {
        return htmlSample.replace(regex, function(match, group) {
          return value;
        });
      };
    },
    getMethodToConcat: function(htmlStart, htmlEnd) {
      return function(value) {
        return htmlStart + value + htmlEnd;
      };
    }
    /*E: HTML Parse methods */
  };


  /**
    ClassName: AutoCompleteHTML5
      Sub UI Lib Constructor,
      init auto complete UI via HTML5 feature ( using <datalist> tag)

  **/
  var AutoCompleteHTML5 = function(instance) {
    var self = this;

    var input   = instance.input,
        source  = instance.source,
        options = instance.options;

    // init datalist element
    options = tool.oo.mixin(options, {
      html5engine      : true,
      containerTag     : coreFlag.html5.listTag,
      listHtmlSample   : coreFlag.html5.optionsHtml,
      htmlReplaceToken : coreFlag.html5.replaceToken
    });
    var datalist = new DataListContainer(source, options);

    self.instance = instance;
    self.datalist = datalist;
    self.options  = options;

    self.element = {
      input: input,
      datalist: datalist.element
    };

    self.matched = false;

    self.elemInit();
    self.elemEventInit();
    self.elemRender();
  };

  /**
    ClassName: AutoCompleteHTML5
      Instance Methods.
      HML5 mode will use all native features.
      There are only init / callback function on the library methods.

  **/
  AutoCompleteHTML5.prototype = {
    /* B: UI Init Methods */
    elemInit: function() {
      var self = this;
      self.element.datalist.setAttribute('id', self.instance.id);
      self.element.input.setAttribute(coreFlag.html5.inputListProp, self.instance.id);
    },
    elemEventInit: function() {
      var self = this;

      tool.evt.bind(self.element.input, 'keyup',  self.inputOnKeyUp.bind(self));
      tool.evt.bind(self.element.input, 'change', self.inputOnChange.bind(self));
    },
    elemRender: function() {
      var self = this;
      tool.elem.insertAfter(self.element.datalist, self.element.input);
    },
    /* E: UI Init Methods */

    /* B: Listen to Match */
    checkMatch: function() {
      var self = this;
      var value = self.element.input.value;
      if (self._lastValue !== value) {
        if (self.datalist.isItemMatchSource(value)) {
          if (!self.matched) {
            self.onMatched();
          }
        } else if (self.matched) { // only call un-match method when last-call is matched
          self.onUnMatched();
        }
        self._lastValue = value;
      }
    },
    onMatched: function() {
      var self = this;
      if (tool.is.fn(self.options.onMatched)) {
        self.options.onMatched.call(self.element.input, self.element.input.value);
      }
      self.matched = true;
    },
    onUnMatched: function() {
      var self = this;
      if (tool.is.fn(self.options.onUnMatched)) {
        self.options.onUnMatched.call(self.element.input, self.element.input.value);
      }
      self.matched = false;
    },
    /* E: Listen to Match */

    /* B: Element Methods */
    inputOnChange: function() {
      var self = this;
      self.checkMatch();
    },
    inputOnKeyUp: function(evt) {
      var self = this;
      //callback - onKeyUp
      if (tool.is.fn(self.options.onKeyUp)) {
        self.options.onKeyUp.call(self.element.input, evt.keyCode, self.element.input.value);
      }
      self.checkMatch();
    }
    /* E: Element Methods */
  };


  /**
    ClassName: AutoCompleteLegacy
      Sub UI Lib Constructor,
      init auto complete UI via legacy way

  **/
  var AutoCompleteLegacy = function(instance) {
    var self = this;

    var input   = instance.input,
        source  = instance.source,
        options = instance.options;

    // init datalist element
    options = tool.oo.mixin(options, {
      html5engine      : false,
      containerTag     : coreFlag.legacy.listTag,
      listHtmlSample   : coreFlag.legacy.optionsHtml,
      htmlReplaceToken : coreFlag.legacy.replaceToken
    });
    var datalist = new DataListContainer(source, options);

    // bind all necessary properties
    self.instance     = instance;
    self.datalist     = datalist;
    self.options      = options;

    self.element = {
      input: input,
      datalist: datalist.element,
      wrapper: document.createElement('div')
    };

    self.selectedItem = null;
    self.hoveringItem    = null;
    self.inputHasFocus  = false;
    self.listShown    = false;

    self.elemInit();
    self.elemEventInit();
    self.elemRender();
  };

  /**
    ClassName: AutoComleteJ
      Instance Methods

  **/
  AutoCompleteLegacy.prototype = {
    /* B: Core Methods */
    assignValue: function(value) {
      var self = this;
      self.element.input.value = value;
    },
    filterItem: function(searchText) {
      var self = this;
      self.datalist.updateContent(searchText);
      self.lastSeachText = searchText;
    },
    /* E: Core Methods */

    /* B: UI Init Methods */
    elemInit: function() {
      var self = this,
          element = self.element;

      self.element.datalist.setAttribute('id', self.instance.id);
      self.element.input.setAttribute('autocomplete', 'off');

      tool.css.add(element.datalist, self.options.className.datalist);
      tool.css.add(element.wrapper,  self.options.className.wrapper);
    },
    elemEventInit: function() {
      var self = this,
          element = self.element;

      tool.evt.bind(element.input, 'focus'   , self.inputOnFocus.bind(self));
      tool.evt.bind(element.input, 'blur'    , self.inputOnBlur.bind(self));
      tool.evt.bind(element.input, 'keyup'   , self.inputOnKeyUp.bind(self));
      tool.evt.bind(element.input, 'keydown' , self.inputOnKeyDown.bind(self));
      tool.evt.bind(element.input, 'click'   , self.inputOnClick.bind(self));
      tool.evt.bind(element.input, 'change'  , self.inputOnChange.bind(self));
      tool.evt.bind(element.datalist, 'click', self.itemOnClick.bind(self));
    },
    elemRender: function() {
      var self = this,
          element = self.element;

      tool.elem.appendChild( element.datalist, element.wrapper);
      tool.elem.insertBefore(element.wrapper , element.input);
      tool.elem.insertBefore(element.input   , element.datalist);

      if (tool.style.computed(element.input).position !== 'static') {
        self.fixAbsolutePositionInput();
      }
    },
    fixAbsolutePositionInput: function() {
      var self = this,
          element = self.element;

      element.wrapper.style.position = tool.style.computed(element.input).position;
      element.wrapper.style.width = element.input.offsetWidth + 'px';
      element.wrapper.style.left = tool.style.computed(element.input).left;
      element.wrapper.style.top = tool.style.computed(element.input).top;
      element.input.style.position = 'static';
    },
    /* B: UI Init Methods */

    /* B: Listen to Match */
    checkMatch: function() {
      var self = this;
      var value = self.element.input.value;
      if (self._lastValue !== value) {
        if (self.datalist.isItemMatchSource(value)) {
          if (!self.matched) {
            self.onMatched();
          }
        } else if (self.matched) { // only call un-match method when last-call is matched
          self.onUnMatched();
        }
        self._lastValue = value;
      }
    },
    onMatched: function() {
      var self = this;
      if (tool.is.fn(self.options.onMatched)) {
        self.options.onMatched.call(self.element.input, self.element.input.value);
      }
      self.matched = true;
    },
    onUnMatched: function() {
      var self = this;
      if (tool.is.fn(self.options.onUnMatched)) {
        self.options.onUnMatched.call(self.element.input, self.element.input.value);
      }
      self.matched = false;
    },
    /* E: Listen to Match */

    /* B: DataList Controller */
    listToShow: function() {
      var self = this,
          element = self.element;

      tool.css.add(element.datalist , self.options.className.active);
      element.datalist.scrollTop = 0;
      self.listShown = true;
    },
    listToHide: function() {
      var self = this,
          element = self.element;

      self.itemToReset();
      tool.css.remove(element.datalist, self.options.className.active);
      self.listShown = false;
    },
    listToOpacity: function() {
      var self = this,
          element = self.element;

      tool.css.add(element.datalist, self.options.className.opacity);
      setTimeout(function() {
        tool.css.remove(element.datalist, self.options.className.opacity);
        self.listToHide();
      }, 300);
    },
    adjustListScroll: function(item) {
      var BAND_WIDTH = 20;

      var self = this;

      var list = self.element.datalist;

      var itemPosition = item.offsetTop + item.offsetHeight,
          listCeiling  = list.scrollTop + BAND_WIDTH,
          listFloor    = list.scrollTop + list.offsetHeight - BAND_WIDTH;

      var nextCeiling, nextFloor;

      if (itemPosition > listCeiling && itemPosition > listFloor) {
        nextCeiling = list.scrollTop + item.offsetHeight;
        if (itemPosition > nextFloor + list.offsetHeight) {
          nextCeiling = item.offsetTop;
        }
        list.scrollTop = nextCeiling;
      } else if (itemPosition <= listCeiling && itemPosition < listFloor) {
        nextCeiling = list.scrollTop - item.offsetHeight;
        if (itemPosition <= nextCeiling) {
          nextCeiling = item.offsetTop;
        }
        list.scrollTop = nextCeiling;
      }
    },
    /* E: DataList Controller */

    /* B: DataListItem Controller */
    itemToSelect: function(item) {
      var self = this;

      self.itemToHover(item);
      self.selectedItem = item;
      self.assignValue(item.textContent || item.innerText);
      self.inputOnChange();
    },
    itemToHover: function(item) {
      var self = this;

      self.itemToReset();
      tool.css.add(item, self.options.className.active);
      self.hoveringItem = item;
    },
    itemToReset: function(item) {
      var self = this;

      if (self.selectedItem) {
        tool.css.remove(self.selectedItem, self.options.className.active);
      }
      self.selectedItem = undefined;

      if (self.hoveringItem) {
        tool.css.remove(self.hoveringItem, self.options.className.active);
      }
      self.hoveringItem = undefined;
    },
    firstItem: function() {
      var self = this;
      return self.element.datalist.childNodes[0];
    },
    /* E: DataListItem Controller */

    /* B: Keyboard Navigation */
    inputOnFocus: function() {
      var self = this;
      // follow the html5 spec, display datalist when user click the focus input
      setTimeout(function() {
        self.inputHasFocus = true;
      }, 200);

      //self.listToShow();
    },
    inputOnBlur: function() {
      var self = this;
      self.inputHasFocus = false;
      self.listToOpacity();
    },
    inputOnChange: function(evt) {
      var self = this;
      self.checkMatch();
    },
    inputOnKeyDown: function(evt) {
      var self = this;
      var keyCode = evt.keyCode;
      switch(keyCode) {
      case 9:  // tab
        self.keyToSelectItem();
        self.listToHide();
        break;

      case 27: // esc
        self.listToHide();
        break;
      }

      //callback onKeyUp
      if (tool.is.fn(self.options.onKeyDown)) {
        self.options.onKeyDown.call(self.element.input, evt.keyCode, self.element.input.value);
      }
    },
    inputOnKeyUp: function(evt) {
      var self = this;
      var keyCode = evt.keyCode;


      if ( !self.listShown) {
        self.listToShow();
      }

      switch(keyCode) {
      case 33: // page up
        self.keyToChoicePrevPage();
        break;

      case 34: // page down
        self.keyToChoiceNextPage();
        break;

      case 38: //up arrow
        self.keyToChoicePrevItem();
        break;

      case 40: //down arrow
        self.keyToChoiceNextItem();
        break;

      case 13:  // enter
        self.keyToSelectItem();
        self.listToHide();
        evt.preventDefault();
        break;

      case 9:  // tab
        self.keyToSelectItem();
        self.listToHide();
        break;

      case 27: // esc
        self.listToHide();
        break;

      default:
        var searchText = self.element.input.value;
        if ( searchText !== self.lastSeachText ) {
          self.filterItem(searchText);
        }
        break;
      }

      //callback onKeyUp
      if (tool.is.fn(self.options.onKeyUp)) {
        self.options.onKeyUp.call(self.element.input, evt.keyCode, self.element.input.value);
      }
      self.checkMatch();
    },
    keyToChoicePrevItem: function() {
      var self = this;
      if (!self.hoveringItem) {
        self.itemToHover(self.firstItem());
      } else if (self.hoveringItem.previousSibling) {
        self.itemToHover(self.hoveringItem.previousSibling);
      }
      self.adjustListScroll(self.hoveringItem);
    },
    keyToChoiceNextItem: function() {
      var self = this;
      if (!self.hoveringItem) {
        self.itemToHover(self.firstItem());
      } else if (self.hoveringItem.nextSibling) {
        self.itemToHover(self.hoveringItem.nextSibling);
      }
      self.adjustListScroll(self.hoveringItem);
    },
    keyToChoicePrevPage: function() {
      var self = this;
      if (!self.hoveringItem) {
        self.itemToHover(self.firstItem());

      // TODO - Move to Prev Page
      } else if (self.hoveringItem.previousSibling) {
        self.itemToHover(self.hoveringItem.previousSibling);
      }
      self.adjustListScroll(self.hoveringItem);
    },
    keyToChoiceNextPage: function() {
      var self = this;
      if (!self.hoveringItem) {
        self.itemToHover(self.firstItem());

      // TODO - Move to Next Page
      } else if (self.hoveringItem.nextSibling) {
        self.itemToHover(self.hoveringItem.nextSibling);
      }
      self.adjustListScroll(self.hoveringItem);
    },
    keyToSelectItem: function() {
      var self = this;
      if (self.hoveringItem) {
        self.itemToSelect(self.hoveringItem);
      }
    },
    /* E: Keyboard Navigation */


    /* B: Mouse Navigation */
    inputOnClick: function(evt) {
      var self = this;
      if (self.inputHasFocus) {
        self.listToShow();
      }
    },
    itemOnClick: function(evt) {
      var self = this;
      self.itemToSelect(evt.target || evt.srcElement);
    }
    /* E: Mouse Navigation */

  };

  if ( typeof window.module === 'object' ) {
    window.module.exports = AutoCompleteJ;
  } else if ( typeof window.define === 'function') {
    window.define(function() {
      return AutoCompleteJ;
    });
  } else {
    window.AutoCompleteJ = AutoCompleteJ;
  }

  // public closure variable into global variable when debug mode
  AutoCompleteJ.debug = function() {
    AutoCompleteJ.tool  = tool;
    AutoCompleteJ.coreFlag = coreFlag;
    AutoCompleteJ.DataListContainer  = DataListContainer;
    AutoCompleteJ.AutoCompleteHTML5  = AutoCompleteHTML5;
    AutoCompleteJ.AutoCompleteLegacy = AutoCompleteLegacy;
  };

} ( window ) );


