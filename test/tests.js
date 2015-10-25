QUnit.test( "arithmepad available", function(assert) {
  assert.ok( typeof arithmepad === typeof {}, "arithmepad object should be available" );
  assert.ok( typeof _.map === typeof function(){}, "underscore map function should be available" );
});

QUnit.test("load cells from DOM", function(assert) {
  $('#arithmepad-cells').empty();
  $('#arithmepad-cells').html('<div class="arithmepad-code-cell"><div class="arithmepad-input"></div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a second dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a third dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fourth dom node for a cell</div><div class="arithmepad-output">123</div></div><div class="arithmepad-cell-divider"></div><div class="arithmepad-code-cell"><div class="arithmepad-input">// a fifth dom node for a cell</div><div class="arithmepad-output">123</div></div>');
  arithmepad.loadFromDom();
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});

QUnit.test("load cells from base64 encoded string", function(assert) {
  $('#arithmepad-cells').empty();
  arithmepad.loadFromBase64('eyJjZWxscyI6W3sidHlwZSI6ImNvZGUiLCJjb250ZW50IjoiIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHNlY29uZCBkb20gbm9kZSBmb3IgYSBjZWxsIn0seyJ0eXBlIjoiY29kZSIsImNvbnRlbnQiOiIvLyBhIHRoaXJkIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZm91cnRoIGRvbSBub2RlIGZvciBhIGNlbGwifSx7InR5cGUiOiJjb2RlIiwiY29udGVudCI6Ii8vIGEgZmlmdGggZG9tIG5vZGUgZm9yIGEgY2VsbCJ9XX0=');
  assert.equal($('.ace_editor').length, 5, 'five ace editor instances should be available');
});