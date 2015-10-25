var showPage = function() {
  $('#arithmepad-page').show();
};

var hidePage = function() {
  $('#arithmepad-page').hide();
};

var isEditSelection = function(editor) {
  return $(arithmepad.__.getCell(editor)).hasClass(arithmepad.__.classes.editSelection);
};

QUnit.test( "arithmepad available", function(assert) {
  assert.ok( typeof arithmepad === typeof {}, "arithmepad object should be available" );
  assert.ok( typeof _.map === typeof function(){}, "underscore map function should be available" );
  assert.ok( typeof ace === typeof {}, "ace should be available" );
});

QUnit.test("load cells from DOM", function(assert) {
  arithmepad.clearPad();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a second dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a third dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fourth dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fifth dom node for a cell</div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test("load cells from base64 encoded string", function(assert) {
  arithmepad.clearPad();
  arithmepad.loadFromBase64('eyJjZWxscyI6W3sidHlwZSI6ImNvZGUiLCJjb250ZW50IjoiIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHNlY29uZCBkb20gbm9kZSBmb3IgYSBjZWxsIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHRoaXJkIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZm91cnRoIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZmlmdGggZG9tIG5vZGUgZm9yIGEgY2VsbCJ9XX0=');
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test("navigate using arrow keys in edit mode", function(assert) {
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