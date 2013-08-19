'use strict';
var AutoCompleteJ = window.AutoCompleteJ;
AutoCompleteJ.debug();

describe('It should has ability to access closure variable on debug mode', function() {
  it('can access AutoCompleteJ class', function() {
    expect(AutoCompleteJ).toBeDefined();
  });

  it('can access DataListContainer class', function() {
    expect(AutoCompleteJ.DataListContainer).toBeDefined();
  });

  it('can access AutoCompleteHTML5 class', function() {
    expect(AutoCompleteJ.AutoCompleteHTML5).toBeDefined();
  });

  it('can access AutoCompleteLegacy class', function() {
    expect(AutoCompleteJ.AutoCompleteLegacy).toBeDefined();
  });

  it('can access tool object', function() {
    expect(AutoCompleteJ.tool).toBeDefined();
  });

  it('can access coreFlag object', function() {
    expect(AutoCompleteJ.coreFlag).toBeDefined();
  });

});

describe('There is not enough time to complete the unit test', function() {
  it('should need more days', function() {
    expect(true).toEqual(true);
  });

});
