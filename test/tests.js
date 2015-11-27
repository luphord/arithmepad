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
  
var getNextEditor = function(editor) {
  var next = arithmepad.Cell.fromEditor(editor).$node.nextAll('.' + arithmepad.__.classes.cell);
  if (next.length > 0) {
    return new arithmepad.Cell(next[0]).getEditor();
  }
};

var classEditorAndInput = '.ace_editor.' + arithmepad.__.classes.input;

QUnit.test('arithmepad available', function(assert) {
  assert.ok( typeof arithmepad === typeof {}, "arithmepad object should be available" );
  assert.ok( typeof _.map === typeof function(){}, "underscore map function should be available" );
  assert.ok( typeof ace === typeof {}, "ace should be available" );
});

QUnit.test('load cells from DOM', function(assert) {
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a second dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a third dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a fourth dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a fifth dom node for a cell</div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($(classEditorAndInput).length, 5, 'five ace editor instances should be available');
});

QUnit.test('load cells from base64 encoded string', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('Ly8gIWFyaXRobWVwYWQtcHJvcGVydGllcyB7InRpdGxlIjoidGVzdC1wYWQifQovLyAhYXJpdGhtZXBhZC1jZWxsCi8vICMgRGlzY291bnRpbmcgZXhhbXBsZQovLyAtIGRlZmluZXMgYW4gaW50ZXJlc3QgcmF0ZSBjdXJ2ZQovLyAtIGRlZmluZXMgYSBkaXNjb3VudCBmdW5jdGlvbgovLyAtIGRlZmluZXMgYSBucHYgZnVuY3Rpb24KLy8gIWFyaXRobWVwYWQtY2VsbAovLyBjZWxsIG51bWJlcjogMQoyKzIKLy8gIWFyaXRobWVwYWQtY2VsbAovLyBhIHNpbXBsZSBjb250aW51b3VzIGRpc2NvdW50IGN1cnZlCnIgPSB0ID0+IDAuMDEgKyAwLjAwMiAqIHQ7Ci8vIGRpc2NvdW50IGZhY3RvciBmcm9tIHJhdGVzCmRmID0gdCA9PiBNYXRoLmV4cCgtcih0KSp0KTsKLy8gaGVscGVyIGZ1bmN0aW9uCnN1bSA9IGZ1bmN0aW9uKHZhbHVlcykgewogIHJldHVybiBfKHZhbHVlcykucmVkdWNlKCh4LCB5KSA9PiB4ICsgeSwgMCk7Cn07Ci8vIGV4cGVjdGluZyBhbnkgY2FzaGZsb3cgZWxlbWVudCBvZiB0aGUgZm9ybSB7dDogLCB2OiB9Cm5wdiA9IGZ1bmN0aW9uKGNhc2hmbG93KSB7CiAgcmV0dXJuIHN1bShfKGNhc2hmbG93KS5tYXAoY2YgPT4gZGYoY2YudCkgKiBjZi52KSk7Cn07CgoyKzIKCi8vICFhcml0aG1lcGFkLWNlbGwKbnB2KFt7dDogMC41LCB2OiAxMDB9LCB7dDogMSwgdjogMTAwfSwge3Q6IDEuNSwgdjogMTAwfSwge3Q6IDIsIHY6IDEwMTAwfV0pCi8vICFhcml0aG1lcGFkLWNlbGwKLy8gY2VsbCBudW1iZXI6IDIKbnB2KFt7dDogMC41LCB2OiAxMDB9LCB7dDogMSwgdjogMTAwfSwge3Q6IDEuNSwgdjogMTAwfSwge3Q6IDIsIHY6IDEwMTAwfV0p');
  assert.equal($(classEditorAndInput).length, 5, 'five ace editor instances should be available');
  assert.equal($('#arithmepad-title').text(), 'test-pad', 'pad title should be "test-pad"');
  assert.equal(arithmepad.getPadProperties().title, 'test-pad', 'padProperties.title should be "test-pad"');
});

QUnit.test('load/save cells from/to JavaScript file', function(assert) {
  arithmepad.clearPad();
  var s = '// !arithmepad-properties {"title":"test-pad"}\n// !arithmepad-cell\n// a simple continuous discount curve\nr = t => 0.01 + 0.002 * t;\n// discount factor from rates\ndf = t => Math.exp(-r(t)*t);\n// helper function\nsum = function(values) {\n  return _(values).reduce((x, y) => x + y, 0);\n};\n// expecting any cashflow element of the form {t: , v: }\nnpv = function(cashflow) {\n  return sum(_(cashflow).map(cf => df(cf.t) * cf.v));\n};\n\n// !arithmepad-cell\nnpv([{t: 0.5, v: 100}, {t: 1, v: 100}, {t: 1.5, v: 100}, {t: 2, v: 10100}])';
  arithmepad.loadFromJSFile(s);
  assert.equal($(classEditorAndInput).length, 2, 'two ace editor instances should be available');
  var f = arithmepad.saveToJSFile();
  arithmepad.loadFromJSFile(f);
  assert.equal($(classEditorAndInput).length, 2, 'two ace editor instances should be available');
  arithmepad.evaluateAllCells();
  assert.equal(Math.round(Number($($('.' + arithmepad.__.classes.output)[1]).text())), 10117, 'result of third editor should equal 10117');
  assert.equal($('#arithmepad-title').text(), 'test-pad', 'pad title should be "test-pad"');
  assert.equal(arithmepad.getPadProperties().title, 'test-pad', 'padProperties.title should be "test-pad"');
});

QUnit.test('insert cells', function(assert) {
  arithmepad.clearPad();
  var code = '//test';
  var res = 'res';
  arithmepad.appendCodeCell(code, res);
  arithmepad.appendCodeCell();
  assert.equal($(classEditorAndInput).length, 2, 'two ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  assert.equal(firstEditor.getValue(), code, 'code of first editor should equal "' + code + '"');
  assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), res, 'res of first editor should equal "' + res + '"');
  arithmepad.appendMarkdownCell('# test');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  arithmepad.evaluateAllCells();
  var thirdResultNode = $($($('.' + arithmepad.__.classes.output)[2]).html())[0];
  assert.equal(thirdResultNode.nodeName.toLowerCase(), 'h1', 'Result should contain an <h1> tag');
  assert.equal(thirdResultNode.textContent, 'test', 'Result should contain text "test"');
});

QUnit.test('navigate using arrow keys in edit mode', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('Ly8gIWFyaXRobWVwYWQtY2VsbApmID0gZnVuY3Rpb24oeCkgewogIHZhciB5ID0geCArIDE7CiAgdmFyIHogPSB5IC8geDsKICByZXR1cm4gTWF0aC5leHAoeik7Cn0KCmYoMSk7Ci8vICFhcml0aG1lcGFkLWNlbGwKLy8gYSBzZWNvbmQgZG9tIG5vZGUgZm9yIGEgY2VsbAoKLy8gdGhpcmQgbGluZQovLyAhYXJpdGhtZXBhZC1jZWxsCi8vIGEgdGhpcmQgY2VsbAo=');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
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
  
  var secondEditor = getNextEditor(firstEditor);
  assert.equal(secondEditor.getSession().getDocument().getLength(), 3, 'there should be 3 code lines in the second editor');
  assert.ok(isEditSelection(secondEditor), 'the second editor should now be the edit selection');
  assert.equal(secondEditor.getCursorPosition().row, 0, 'cursor should be on the first line (counting 1-based) of the second editor');
  for(var i=0; i<2; i++)
    secondEditor.execCommand('arrowKeyDown');
  assert.equal(secondEditor.getCursorPosition().row, 2, 'cursor should be on the third line (counting 1-based) of the second editor');
  
  secondEditor.execCommand('arrowKeyDown');
  var thirdEditor = getNextEditor(secondEditor);
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
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.setValue('2+3');
  firstEditor.execCommand('evaluate');
  assert.equal($('.' + arithmepad.__.classes.output).length, 1, 'there should be exactly one cell output');
  assert.equal($('.' + arithmepad.__.classes.output).text(), '5', 'result should equal 5');
  firstEditor.setValue('2+4');
  firstEditor.execCommand('evaluateCreateNew');
  assert.equal($('.' + arithmepad.__.classes.output).length, 2, 'there should now be two cell outputs');
  assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), '6', 'result should now equal 6');
  var secondEditor = getNextEditor(firstEditor);
  assert.ok(isEditSelection(secondEditor), 'the second editor should now be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  hidePage();
});

QUnit.test('command mode', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  secondEditor.execCommand('evaluateCreateNew');
  var thirdEditor = getNextEditor(secondEditor);
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
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  secondEditor.execCommand('evaluateCreateNew');
  var thirdEditor = getNextEditor(secondEditor);
  thirdEditor.execCommand('commandMode');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no more edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should be exactly one command selection');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
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
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  hidePage();
});

QUnit.test('delete cells by button', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  assert.equal($(classEditorAndInput).length, 2, 'two ace editor instances should be available');
  $("#arithmepad-delete-cell").click();
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should be available');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should be one command selection');
  $("#arithmepad-delete-cell").click();
  assert.equal($(classEditorAndInput).length, 0, 'no more ace editor instances should be available');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
});

QUnit.test('copy / cut / paste cells', function(assert) {
  // we check for the buttons, but we are not going to use them all in the test,
  // because the Cell methods yield simpler synchronous calls than the asynchronous button clicks
  assert.equal($('#arithmepad-toolbar-copy-cell').length, 1, 'the "Copy cell" toolbar button should be available');
  assert.equal($('#arithmepad-toolbar-cut-cell').length, 1, 'the "Cut cell" toolbar button should be available');
  assert.equal($('#arithmepad-toolbar-paste-cell').length, 1, 'the "Paste cell" toolbar button should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('//1');
  arithmepad.appendCodeCell('//2');
  arithmepad.appendCodeCell('//3');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  var first = arithmepad.Cell.fromEditor(ace.edit($(classEditorAndInput)[0]));
  var second = arithmepad.Cell.fromEditor(ace.edit($(classEditorAndInput)[1]));
  var third = arithmepad.Cell.fromEditor(ace.edit($(classEditorAndInput)[2]));
  assert.equal(ace.edit($(classEditorAndInput)[0]).getValue(), '//1', 'value of top most editor instance should be "//1"');
  assert.equal(ace.edit($(classEditorAndInput)[1]).getValue(), '//2', 'value of middle editor instance should be "//2"');
  assert.equal(ace.edit($(classEditorAndInput)[2]).getValue(), '//3', 'value of last editor instance should be "//3"');
  first.cut();
  assert.equal($(classEditorAndInput).length, 2, 'two ace editor instances should no be available');
  assert.equal(ace.edit($(classEditorAndInput)[0]).getValue(), '//2', 'value of top most editor instance should now be "//2"');
  assert.equal(ace.edit($(classEditorAndInput)[1]).getValue(), '//3', 'value of second editor instance should now be "//3"');
  second.pasteAfter();
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should now be available');
  assert.equal(ace.edit($(classEditorAndInput)[0]).getValue(), '//2', 'value of top most editor instance should now be "//2"');
  assert.equal(ace.edit($(classEditorAndInput)[1]).getValue(), '//1', 'value of middle editor instance should now be "//1"');
  assert.equal(ace.edit($(classEditorAndInput)[2]).getValue(), '//3', 'value of last editor instance should still be "//3"');
  third.copy();
  // this cell was cut before and therefore the first.$node ist not in the DOM anymore
  // we need to reassign "first" before pasting after it
  first = arithmepad.Cell.fromEditor(ace.edit($(classEditorAndInput)[1]));
  first.pasteAfter();
  assert.equal($(classEditorAndInput).length, 4, 'four ace editor instances should now be available');
  assert.equal(ace.edit($(classEditorAndInput)[0]).getValue(), '//2', 'value of top most editor instance should now be "//2"');
  assert.equal(ace.edit($(classEditorAndInput)[1]).getValue(), '//1', 'value of middle editor instance should now be "//1"');
  assert.equal(ace.edit($(classEditorAndInput)[2]).getValue(), '//3', 'value of third editor instance should now be "//3"');
  assert.equal(ace.edit($(classEditorAndInput)[2]).getValue(), '//3', 'value of last editor instance should still be "//3"');
  arithmepad.clearPad();
  assert.equal($(classEditorAndInput).length, 0, 'no ace editor instances should now be available');
  var done = assert.async();
  $('#arithmepad-toolbar-paste-cell').click();
  setTimeout(function() {
    assert.equal($(classEditorAndInput).length, 1, 'one ace editor instances should now be available');
    assert.equal(ace.edit($(classEditorAndInput)[0]).getValue(), '//3', 'value of last editor instance should still be "//3"');
    done();
  }, 1);
});

QUnit.test('run all cells', function(assert) {
  assert.equal($('#arithmepad-run-all-button').length, 1, 'the "Run All Cells" button should be available');
  calls = [arithmepad.evaluateAllCells, _.bind($('#arithmepad-run-all-button').click, $('#arithmepad-run-all-button'))];
  for (var i = 0; i < calls.length; i++) {
    arithmepad.clearPad();
    arithmepad.appendCodeCell('a=2;');
    arithmepad.appendCodeCell('b=3;');
    arithmepad.appendCodeCell('a+b;');
    assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
    calls[i]();
    assert.equal($($('.' + arithmepad.__.classes.output)[2]).text(), '5', 'result of third editor should equal "5"');
  }
});

QUnit.test('run all cells by toolbar button', function(assert) {
  assert.equal($('#arithmepad-toolbar-run-all-cells').length, 1, 'the "Run All Cells" toolbar button should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('a=2;');
  arithmepad.appendCodeCell('b=3;');
  arithmepad.appendCodeCell('a+b;');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  var done = assert.async();
  $('#arithmepad-toolbar-run-all-cells').click();
  setTimeout(function() {
    assert.equal($($('.' + arithmepad.__.classes.output)[2]).text(), '5', 'result of third editor should equal "5"');
    done();
    hidePage();
  }, 1);
});

QUnit.test('run cell by button', function(assert) {
  showPage();
  assert.equal($('#arithmepad-run-cell').length, 1, 'the "Cell > Run" button should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('a=2;');
  $('#arithmepad-run-cell').click();
  var done = assert.async();
  setTimeout(function() {
    assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), '2', 'result of first editor should equal "2"');
    done();
    hidePage();
  }, 1);
});

QUnit.test('run cell by toolbar button', function(assert) {
  showPage();
  assert.equal($('#arithmepad-toolbar-run-cell').length, 1, 'the "Run Cell" toolbar button should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('a=2;');
  $('#arithmepad-toolbar-run-cell').click();
  var done = assert.async();
  setTimeout(function() {
    assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), '2', 'result of first editor should equal "2"');
    done();
    hidePage();
  }, 1);
});

QUnit.test('move cells', function(assert) {
  arithmepad.clearPad();
  arithmepad.appendCodeCell('//1');
  arithmepad.appendCodeCell('//2');
  arithmepad.appendCodeCell('//3');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  assert.equal(firstEditor.getValue(), '//1', 'value of first editor should be "//1"');
  var firstCell = arithmepad.Cell.fromEditor(firstEditor);
  firstCell.moveDown();
  secondEditor = ace.edit($(classEditorAndInput)[0]);
  assert.equal(secondEditor.getValue(), '//2', 'value of first visible editor should be "//2"');
  firstCell.moveDown();
  thirdEditor = ace.edit($(classEditorAndInput)[1]);
  assert.equal(thirdEditor.getValue(), '//3', 'value of second visible editor should be "//3"');
  firstCell.moveDown();
  firstCell.moveDown();
  secondEditor = ace.edit($(classEditorAndInput)[0]);
  assert.equal(secondEditor.getValue(), '//2', 'value of first visible editor should still be "//2"');
  thirdEditor = ace.edit($(classEditorAndInput)[1]);
  assert.equal(thirdEditor.getValue(), '//3', 'value of second visible editor should still be "//3"');
  firstCell.moveUp();
  secondEditor = ace.edit($(classEditorAndInput)[0]);
  assert.equal(secondEditor.getValue(), '//2', 'value of first visible editor should still be "//2"');
  thirdEditor = ace.edit($(classEditorAndInput)[2]);
  assert.equal(thirdEditor.getValue(), '//3', 'value of third visible editor should now be "//3"');
  firstCell.moveUp();
  secondEditor = ace.edit($(classEditorAndInput)[1]);
  assert.equal(secondEditor.getValue(), '//2', 'value of second visible editor should now be "//2"');
});

QUnit.test('blurring editors causes cells to be command selection', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  arithmepad.appendCodeCell('// 1');
  arithmepad.appendCodeCell('// 2');
  arithmepad.appendCodeCell('// 3');
  assert.equal($(classEditorAndInput).length, 3, 'three ace editor instances should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.blur();
  assert.ok(isCommandSelection(firstEditor), 'the first editor should be the command selection');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no edit selection');
  hidePage();
});

QUnit.test('switch between javascript and markdown', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  arithmepad.appendCodeCell('// 1');
  assert.equal($(classEditorAndInput).length, 1, 'one ace editor instance should be available');
  var firstEditor = ace.edit($(classEditorAndInput)[0]);
  firstEditor.focus();
  firstEditor.blur();
  assert.ok(isCommandSelection(firstEditor), 'the first editor should be the command selection');
  var mKey = $.Event('keydown');
  mKey.which = 77;
  var yKey = $.Event('keydown');
  yKey.which = 89;
  assert.ok(!arithmepad.__.getCell(firstEditor).hasClass(arithmepad.__.classes.markdown), 'editor does not have class markdown');
  assert.equal(firstEditor.getOption('mode'), 'ace/mode/javascript');
  $('#arithmepad-cells').trigger(mKey);
  assert.ok(arithmepad.__.getCell(firstEditor).hasClass(arithmepad.__.classes.markdown), 'editor has class markdown');
  assert.equal(firstEditor.getOption('mode'), 'ace/mode/markdown');
  $('#arithmepad-cells').trigger(yKey);
  assert.ok(!arithmepad.__.getCell(firstEditor).hasClass(arithmepad.__.classes.markdown), 'editor does not have class markdown');
  assert.equal(firstEditor.getOption('mode'), 'ace/mode/javascript');
  hidePage();
});

QUnit.test('In/Out markers', function(assert) {
  arithmepad.clearPad();
  arithmepad.__.resetEvalCounter();
  var f = "// !arithmepad-properties {\"title\":\"Example Pad\"}\n// !arithmepad-cell\n// # Discounting example\n// - defines an interest rate curve\n// - defines a discount function\n// - defines a npv function\n// \n// !arithmepad-cell\n// a simple continuous discount curve\nr = t => 0.01 + 0.002 * t;\n// discount factor from rates\ndf = t => Math.exp(-r(t)*t);\n// helper function\nsum = function(values) {\n  return _(values).reduce((x, y) => x + y, 0);\n};\n// expecting any cashflow element of the form {t: , v: }\nnpv = function(cashflow) {\n  return sum(_(cashflow).map(cf => df(cf.t) * cf.v));\n};\n\n// !arithmepad-cell\ncashflow = [{t: 0.5, v: 100}, {t: 1, v: 100}, {t: 1.5, v: 100}, {t: 2, v: 10100}];\nnpv(cashflow);\n// !arithmepad-cell\ndata = {labels: [], series: [[], []]};\n_(cashflow).each(function(c) {\n  data.labels.push(c.t);\n  data.series[0].push(c.v);\n  data.series[1].push(df(c.t) * c.v);\n});\n\nnew Chartist.Bar(plotId, data);\n";
  arithmepad.loadFromJSFile(f);
  assert.equal($(classEditorAndInput).length, 4, 'four ace editor instances should be available');
  assert.equal($('.' + arithmepad.__.classes.inMarker).length, 4, 'four In Markers should be available');
  assert.equal($('.' + arithmepad.__.classes.outMarker).length, 4, 'four Out Markers should be available');
  arithmepad.evaluateAllCells();
  assert.equal($('.' + arithmepad.__.classes.inMarker).length, 4, 'four In Markers should be available');
  assert.equal($('.' + arithmepad.__.classes.outMarker).length, 4, 'four Out Markers should be available');
  showPage();
  if ($(window).width() > 991) { // 991 is media query breakpoint for bootstrap sm, below all markers are hidden
    assert.equal($('.' + arithmepad.__.classes.inMarker + ':visible').length, 4, 'four In Markers should be visible'); // first one visible, but empty
    assert.equal($('.' + arithmepad.__.classes.outMarker + ':visible').length, 3, 'three Out Markers should be visible'); // first one hidden
  } else {
    assert.equal($('.' + arithmepad.__.classes.inMarker + ':visible').length, 0, 'no In Markers should be visible');
    assert.equal($('.' + arithmepad.__.classes.outMarker + ':visible').length, 0, 'no Out Markers should be visible');
  }
  hidePage();
  for (var i=0; i<3; i++) {
    assert.equal($($('.' + arithmepad.__.classes.inMarker)[i+1]).text(), 'In [' + i + ']', 'In Marker ' + (i+1) + ' should equal "In [' + i + ']"');
    assert.equal($($('.' + arithmepad.__.classes.outMarker)[i+1]).text(), 'Out [' + i + ']', 'Out Marker ' + (i+1) + ' should equal "Out [' + i + ']"');
  }
  var secondEditor = ace.edit($(classEditorAndInput)[1]);
  arithmepad.__.evaluate(secondEditor);
  assert.equal($($('.' + arithmepad.__.classes.inMarker)[1]).text(), 'In [3]', 'In Marker 1 should now equal "In [3]"');
  assert.equal($($('.' + arithmepad.__.classes.outMarker)[1]).text(), 'Out [3]', 'Out Marker 1 should equal "Out [3]"');
});

QUnit.test('numeric.js', function(assert) {
  assert.equal(typeof numeric, 'function', 'numeric should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('numeric.linspace(0,4,5);');
  arithmepad.evaluateAllCells();
  assert.equal(JSON.parse($($('.' + arithmepad.__.classes.output)[0]).text()).toString(), ([0,1,2,3,4]).toString(), 'result of third editor should equal [0,1,2,3,4]');
});

QUnit.test('Chartist.js plots', function(assert) {
  assert.equal(typeof Chartist, 'object', 'Chartist should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell("data = {  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],  series: [[5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8], [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4]]}; new Chartist.Line(plotId, data);");
  arithmepad.evaluateAllCells();
  var done = assert.async();
  setTimeout(function() {
    var $plot = $('.' + arithmepad.__.classes.plot);
    assert.equal($plot.length, 1, 'there should be one plot');
    assert.equal($plot.find('.ct-series').length, 2, 'there should be two series in the plot');
    var $points = $plot.find('.ct-series-b .ct-point');
    assert.equal($points.length, 12, 'there should be 12 points in the second series');
    done();
  });
});