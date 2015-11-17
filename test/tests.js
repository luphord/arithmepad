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

QUnit.test('arithmepad available', function(assert) {
  assert.ok( typeof arithmepad === typeof {}, "arithmepad object should be available" );
  assert.ok( typeof _.map === typeof function(){}, "underscore map function should be available" );
  assert.ok( typeof ace === typeof {}, "ace should be available" );
});

QUnit.test('load cells from DOM', function(assert) {
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a second dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a third dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a fourth dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell"><div class="arithmepad-input">// a fifth dom node for a cell</div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test('load cells from base64 encoded string', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('Ly8gIWFyaXRobWVwYWQtY2VsbAovLyAjIERpc2NvdW50aW5nIGV4YW1wbGUKLy8gLSBkZWZpbmVzIGFuIGludGVyZXN0IHJhdGUgY3VydmUKLy8gLSBkZWZpbmVzIGEgZGlzY291bnQgZnVuY3Rpb24KLy8gLSBkZWZpbmVzIGEgbnB2IGZ1bmN0aW9uCi8vICFhcml0aG1lcGFkLWNlbGwKLy8gY2VsbCBudW1iZXI6IDEKMisyCi8vICFhcml0aG1lcGFkLWNlbGwKLy8gYSBzaW1wbGUgY29udGludW91cyBkaXNjb3VudCBjdXJ2ZQpyID0gdCA9PiAwLjAxICsgMC4wMDIgKiB0OwovLyBkaXNjb3VudCBmYWN0b3IgZnJvbSByYXRlcwpkZiA9IHQgPT4gTWF0aC5leHAoLXIodCkqdCk7Ci8vIGhlbHBlciBmdW5jdGlvbgpzdW0gPSBmdW5jdGlvbih2YWx1ZXMpIHsKICByZXR1cm4gXyh2YWx1ZXMpLnJlZHVjZSgoeCwgeSkgPT4geCArIHksIDApOwp9OwovLyBleHBlY3RpbmcgYW55IGNhc2hmbG93IGVsZW1lbnQgb2YgdGhlIGZvcm0ge3Q6ICwgdjogfQpucHYgPSBmdW5jdGlvbihjYXNoZmxvdykgewogIHJldHVybiBzdW0oXyhjYXNoZmxvdykubWFwKGNmID0+IGRmKGNmLnQpICogY2YudikpOwp9OwoKMisyCgovLyAhYXJpdGhtZXBhZC1jZWxsCm5wdihbe3Q6IDAuNSwgdjogMTAwfSwge3Q6IDEsIHY6IDEwMH0sIHt0OiAxLjUsIHY6IDEwMH0sIHt0OiAyLCB2OiAxMDEwMH1dKQovLyAhYXJpdGhtZXBhZC1jZWxsCi8vIGNlbGwgbnVtYmVyOiAyCm5wdihbe3Q6IDAuNSwgdjogMTAwfSwge3Q6IDEsIHY6IDEwMH0sIHt0OiAxLjUsIHY6IDEwMH0sIHt0OiAyLCB2OiAxMDEwMH1dKQ==');
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
  arithmepad.appendMarkdownCell('# test');
  assert.equal($('.ace_editor').length, 3, 'three ace editor instances should be available');
  arithmepad.evaluateAllCells();
  var thirdResultNode = $($($('.' + arithmepad.__.classes.output)[2]).html())[0];
  assert.equal(thirdResultNode.nodeName.toLowerCase(), 'h1', 'Result should contain an <h1> tag');
  assert.equal(thirdResultNode.textContent, 'test', 'Result should contain text "test"');
});

QUnit.test('navigate using arrow keys in edit mode', function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('Ly8gIWFyaXRobWVwYWQtY2VsbApmID0gZnVuY3Rpb24oeCkgewogIHZhciB5ID0geCArIDE7CiAgdmFyIHogPSB5IC8geDsKICByZXR1cm4gTWF0aC5leHAoeik7Cn0KCmYoMSk7Ci8vICFhcml0aG1lcGFkLWNlbGwKLy8gYSBzZWNvbmQgZG9tIG5vZGUgZm9yIGEgY2VsbAoKLy8gdGhpcmQgbGluZQovLyAhYXJpdGhtZXBhZC1jZWxsCi8vIGEgdGhpcmQgY2VsbAo=');
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
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
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
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
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

QUnit.test('delete cells by button', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
  firstEditor.focus();
  assert.ok(isEditSelection(firstEditor), 'the first editor should be the edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
  firstEditor.execCommand('evaluateCreateNew');
  var secondEditor = getNextEditor(firstEditor);
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 1, 'there should be exactly one edit selection');
  assert.equal($('.ace_editor').length, 2, 'two ace editor instances should be available');
  $("#arithmepad-delete-cell").click();
  assert.equal($('.ace_editor').length, 1, 'one ace editor instances should be available');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 1, 'there should be one command selection');
  $("#arithmepad-delete-cell").click();
  assert.equal($('.ace_editor').length, 0, 'no more ace editor instances should be available');
  assert.equal($('.' + arithmepad.__.classes.editSelection).length, 0, 'there should be no edit selection');
  assert.equal($('.' + arithmepad.__.classes.commandSelection).length, 0, 'there should be no command selection');
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

QUnit.test('run cell by button', function(assert) {
  assert.equal($('#arithmepad-run-cell').length, 1, 'the "Cell > Run" button should be available');
  arithmepad.clearPad();
  arithmepad.appendCodeCell('a=2;');
  $('#arithmepad-run-cell').click();
  var done = assert.async();
  setTimeout(function() {
    assert.equal($($('.' + arithmepad.__.classes.output)[0]).text(), '2', 'result of first editor should equal "2"');
    done();
  }, 100);
});

QUnit.test('blurring editors causes cells to be command selection', function(assert) {
  showPage(); // apparently, we need to have the page visible for the focus events to work properly
  arithmepad.clearPad();
  arithmepad.appendCodeCell('// 1');
  arithmepad.appendCodeCell('// 2');
  arithmepad.appendCodeCell('// 3');
  assert.equal($('.ace_editor').length, 3, 'three ace editor instances should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
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
  assert.equal($('.ace_editor').length, 1, 'one ace editor instance should be available');
  var firstEditor = ace.edit($('.ace_editor')[0]);
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