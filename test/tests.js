var showPage = function() {
  $('#arithmepad-page').show();
};

var hidePage = function() {
  $('#arithmepad-page').hide();
};

var isEditSelection = function(editor) {
  return $(arithmepad.__.getCell(editor)).hasClass(arithmepad.__.classes.editSelection);
};

var isCommandSelection = function(editor) {
  return $(arithmepad.__.getCell(editor)).hasClass(arithmepad.__.classes.commandSelection);
};

QUnit.test('arithmepad available', function(assert) {
  assert.ok( typeof arithmepad === typeof {}, "arithmepad object should be available" );
  assert.ok( typeof _.map === typeof function(){}, "underscore map function should be available" );
  assert.ok( typeof ace === typeof {}, "ace should be available" );
});

QUnit.test('load cells from DOM', function(assert) {
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a second dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a third dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fourth dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fifth dom node for a cell</div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test('load cells from base64 encoded string', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('eyJjZWxscyI6W3sidHlwZSI6ImNvZGUiLCJjb250ZW50IjoiIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHNlY29uZCBkb20gbm9kZSBmb3IgYSBjZWxsIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHRoaXJkIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZm91cnRoIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZmlmdGggZG9tIG5vZGUgZm9yIGEgY2VsbCJ9XX0=');
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test('load/save cells from/to JavaScript file', function(assert) {
  arithmepad.clearPad();
  var s = '// !arithmepad-cell\n// a simple continuous discount curve\nr = t => 0.01 + 0.002 * t;\n// discount factor from rates\ndf = t => Math.exp(-r(t)*t);\n// helper function\nsum = function(values) {\n  return _(values).reduce((x, y) => x + y, 0);\n};\n// expecting any cashflow element of the form {t: , v: }\nnpv = function(cashflow) {\n  return sum(_(cashflow).map(cf => df(cf.t) * cf.v));\n};\n\n// !arithmepad-cell\nnpv([{t: 0.5, v: 100}, {t: 1, v: 100}, {t: 1.5, v: 100}, {t: 2, v: 10100}])';
  arithmepad.loadFromJSFile(s);
  assert.equal($('.ace_editor').length, 2, 'two ace editor instances should be available');
  var f = arithmepad.saveToJSFile();
  arithmepad.loadFromJSFile(f);
  assert.equal($('.ace_editor').length, 2, 'two ace editor instances should be available');
  arithmepad.evaluateAllCells();
  assert.equal(Math.round(Number($($('.' + arithmepad.__.classes.output)[1]).text())), 10117, 'result of third editor should equal 10117');
});

QUnit.test('insert cells', function(assert) {
  arithmepad.clearPad();
  var code = '//test';
  var res = 'res';
  arithmepad.appendCodeCell(code, res);
  arithmepad.appendCodeCell();
  assert.equal($('.ace_editor').length, 2, 'two ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  assert.equal(firstEditor.getValue(), code, 'code of first editor should equal "' + code + '"');
  assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), res, 'res of first editor should equal "' + res + '"');
});

QUnit.test('navigate using arrow keys in edit mode', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('eyJjZWxscyI6W3sidHlwZSI6ImNvZGUiLCJjb250ZW50IjoiZiA9IGZ1bmN0aW9uKHgpIHtcbiAgdmFyIHkgPSB4ICsgMTtcbiAgdmFyIHogPSB5IC8geDtcbiAgcmV0dXJuIE1hdGguZXhwKHopO1xufVxuXG5mKDEpOyJ9LHsidHlwZSI6ImNvZGUiLCJjb250ZW50IjoiLy8gYSBzZWNvbmQgZG9tIG5vZGUgZm9yIGEgY2VsbFxuXG4vLyB0aGlyZCBsaW5lIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHRoaXJkIGNlbGxcbiJ9XX0=');
  assert.equal($('.ace_editor').length, 3, 'three ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  assert.equal(firstEditor.getSession().getDocument().getLength(), 7, 'there should be 7 code lines in the first editor');
  
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  firstEditor.navigateTo(0,0);
  
  // moving down
  
  for(var i=0; i<6; i++)
    firstEditor.execCommand('arrowKeyDown');
  assert.equal(firstEditor.getCursorPosition().row, 6, 'cursor should be on the 7th line (counting 1-based) of the first editor');
  firstEditor.execCommand('arrowKeyDown');
  
  var secondEditor = arithmepad.__.getNextEditor(firstEditor);
  assert.equal(secondEditor.getSession().getDocument().getLength(), 3, 'there should be 3 code lines in the second editor');
  assert.ok(isEditSelection(secondEditor), 'the second editor should now be the edit selection');
  assert.equal(secondEditor.getCursorPosition().row, 0, 'cursor should be on the first line (counting 1-based) of the second editor');
  for(var i=0; i<2; i++)
    secondEditor.execCommand('arrowKeyDown');
  assert.equal(secondEditor.getCursorPosition().row, 2, 'cursor should be on the third line (counting 1-based) of the second editor');
  
  secondEditor.execCommand('arrowKeyDown');
  var thirdEditor = arithmepad.__.getNextEditor(secondEditor);
  assert.equal(thirdEditor.getSession().getDocument().getLength(), 2, 'there should be 2 code lines in the third editor');
  assert.ok(isEditSelection(thirdEditor), 'the third editor should now be the edit selection');
  thirdEditor.execCommand('arrowKeyDown');
  assert.equal(thirdEditor.getCursorPosition().row, 1, 'cursor should be on the second line (counting 1-based) of the second editor');
  
  // moving back up
  for(var i=0; i<2; i++)
    thirdEditor.execCommand('arrowKeyUp');
  assert.ok(isEditSelection(secondEditor), 'the second editor should now be the edit selection');
  for(var i=0; i<3; i++)
    secondEditor.execCommand('arrowKeyUp');
  assert.ok(isEditSelection(firstEditor), 'the first editor should now be the edit selection');
  for(var i=0; i<10; i++)
    firstEditor.execCommand('arrowKeyUp');
  assert.equal(firstEditor.getCursorPosition().row, 0, 'cursor should be on the first line (counting 1-based) of the first editor');
  
  hidePage();
});

QUnit.test('Ctrl/Shift + Enter', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  firstEditor.setValue('2+3');
  firstEditor.execCommand('evaluate');
  assert.equal($('.' + arithmepad.__.classes.output).length, 1, 'there should be exactly one cell output');
  assert.equal($('.' + arithmepad.__.classes.output).text(), '5', 'result should equal 5');
  firstEditor.setValue('2+4');
  firstEditor.execCommand('evaluateCreateNew');
  assert.equal($('.' + arithmepad.__.classes.output).length, 2, 'there should now be two cell outputs');
  assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), '6', 'result should now equal 6');
  var secondEditor = arithmepad.__.getNextEditor(firstEditor);
  assert.ok(isEditSelection(secondEditor), 'the second editor should now be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  hidePage();
});

QUnit.test('command mode', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = arithmepad.__.getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  secondEditor.execCommand('evaluateCreateNew');
  var thirdEditor = arithmepad.__.getNextEditor(secondEditor);
  thirdEditor.execCommand('commandMode');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no more edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should be exactly one command selection');
  var arrowKeyUp = $.Event('keydown');
  arrowKeyUp.which = 38;
  assert.ok(isCommandSelection(thirdEditor), 'the third editor should be the command selection');
  $('#arithmepad-cells').trigger(arrowKeyUp);
  assert.ok(isCommandSelection(secondEditor), 'the second editor should be the command selection');
  $('#arithmepad-cells').trigger(arrowKeyUp);
  assert.ok(isCommandSelection(firstEditor), 'the first editor should now be the command selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should still be exactly one command selection');
  $('#arithmepad-cells').trigger(arrowKeyUp);
  assert.ok(isCommandSelection(firstEditor), 'the first editor should now be the command selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should still be exactly one command selection');
  var arrowKeyDown = $.Event('keydown');
  arrowKeyDown.which = 40;
  $('#arithmepad-cells').trigger(arrowKeyDown);
  assert.ok(isCommandSelection(secondEditor), 'the second editor should now be the command selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should still be exactly one command selection');
  $('#arithmepad-cells').trigger(arrowKeyDown);
  assert.ok(isCommandSelection(thirdEditor), 'the third editor should now be the command selection');
  $('#arithmepad-cells').trigger(arrowKeyDown);
  assert.ok(isCommandSelection(thirdEditor), 'the third editor should still be the command selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should still be exactly one command selection');
  var enterKey = $.Event('keydown');
  enterKey.which = 13;
  $('#arithmepad-cells').trigger(enterKey);
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no more command selection');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should now be exactly one edit selection');
  hidePage();
});

QUnit.test('delete cells', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = arithmepad.__.getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  secondEditor.execCommand('evaluateCreateNew');
  var thirdEditor = arithmepad.__.getNextEditor(secondEditor);
  thirdEditor.execCommand('commandMode');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no more edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should be exactly one command selection');
  assert.equal($('.ace_editor').length, 3, 'three ace editor instances should be available');
  var arrowKeyUp = $.Event('keydown');
  arrowKeyUp.which = 38;
  $('#arithmepad-cells').trigger(arrowKeyUp);
  assert.ok(isCommandSelection(secondEditor), 'the second editor should be the command selection');
  var dKey = $.Event('keydown');
  dKey.which = 68;
  $('#arithmepad-cells').trigger(dKey);
  $('#arithmepad-cells').trigger(dKey);
  assert.ok(isCommandSelection(thirdEditor), 'the third editor should be the command selection');
  $('#arithmepad-cells').trigger(dKey);
  assert.ok(isCommandSelection(thirdEditor), 'the third editor should still be the command selection');
  $('#arithmepad-cells').trigger(dKey);
  assert.ok(isCommandSelection(firstEditor), 'the first editor should now be the command selection');
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  hidePage();
});

QUnit.test('run all cells', function(assert) {
  assert.equal($('#arithmepad-run-all-button').length, 1, 'the "Run All Cells" button should be available');
  calls = [arithmepad.evaluateAllCells, _.bind($('#arithmepad-run-all-button').click, $('#arithmepad-run-all-button'))];
  for (var i = 0; i < calls.length; i++) {
    arithmepad.clearPad();
    arithmepad.appendCodeCell('a=2;');
    arithmepad.appendCodeCell('b=3;');
    arithmepad.appendCodeCell('a+b;');
    assert.equal($('.ace_editor').length, 3, 'three ace editor instances should be available');
    calls[i]();
    assert.equal($($('.' + arithmepad.__.classes.output)[2]).text(), '5', 'result of third editor should equal "5"');
  }
});