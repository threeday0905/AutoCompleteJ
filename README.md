Widget - J / AutoComplete
=========================

AutoCompleteJ is an UI component to easily create auto-complete boxes for input fields;



This widget proivde two way to build the auto-complete UI.
 - HTML5 Mode, it will convert data source into `<datalist>` tag, and use native HTML5 autocomplete widget.

 - Legacy Mode, it will convert data source into `<ul>` tag, and use javascript to simulate auto-complete widget.
 

=========================
The constructor receive three arguments as below:
  1. dom     -> input id or dom object
  2. source  -> data source (with string-array format)
  3. options -> the detail description on the next part.



Initial code like this:
```
new AutomCompleteJ('fromCity', [ /* data */ ], {
  html5: true //init with html5 mode
});

new AutomCompleteJ('toCity', [ /* data */ ], {
  html5: false, //init with legacy mode
});
```


# Options

`html5`
  * {true}:  use html5 mode if browser support.
  * {false}: use legacy mode.
  * default: true

`onInit`
  * callback function
  * trigger when widget init

`onMatched`
  * callback function
  * trigger if input value match any source item

`onUnMatched`
  * callback function
  * trigger if input has been matched, but user key-in another char cause un-match.

`onKeyUp`
  * callback function
  * trigger when key up on input

[above options does not support in HTML5 mode]<br/>
`ignoreCase`
  * {true}:  filter engine will be case-sensitive
  * {false}: filter engine will ignore case.
  * default: true

`searchAny`
  * {true}:  filter engine will return true if item contains searct text.
  * {false}: filter engine will return true if item is start with search text.
  * default: true

`maxEntries`
  * accept format: number
  * how many entries will shown on auto-complete box.
  * default: 1000

`sort`
  * accept format: boolean or function
  * {true} : filter engine will sort result by default rule.
  * {false}: filter engine will not sort result.
  * {callback} : filter engine will use this function to sort result

`className`
  * accept format: object
  * define the element class
  * default
    '''
    {
      datalist     : 'autoCompleteJ-datalist',
      wrapper      : 'autoCompleteJ-wrapper',
      active       : 'autoCompleteJ-active',
      hover        : 'autoCompleteJ-active'
    }
    '''


# Supported Browser

- All major browser.
- IE7 and above.


# Demo

http://beerfriday.net/hman/autoCompleteJ/demo/index.html

(The file is same as "demo" folder)
