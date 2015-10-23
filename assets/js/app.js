(function(ace, $) {

  var editorOptions = {
    mode: "ace/mode/javascript",
    tabSize: 2,
    //theme: theme,
    autoScrollEditorIntoView: true
  };

  var add = function(editor, code, result) {
    var oldEl = $(editor.container).parent();
    var pad = $('<div class="arithmepad-cell-divider">');
    pad.insertAfter(oldEl);

    var el = $('<div class="arithmepad-code-cell">');
    el.insertAfter(pad);
    var input = $('<div class="arithmepad-input">');
    el.append(input);
    el.append($('<div>').text('---').attr('class', 'arithmepad-output'))

    editor = ace.edit(input[0]);
    editor.setOptions(editorOptions);
    registerCommands(editor);
    editor.focus();
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      $(editor.container).parent().find('.arithmepad-output').text(result);
  };
  
  var evaluate = function(editor) {
    var res = eval(editor.getValue());
    if (typeof res === 'undefined')
      res = '---';
    $(editor.container).parent().find('.arithmepad-output').text(res);
    updatePermalink();
  };

  var count = 1;
  var registerCommands = function(editor) {
    editor.commands.addCommand({
      name: "execute",
      bindKey: {win: "Ctrl-Enter", mac: "Cmd-Enter"},
      exec: evaluate
    });
    editor.commands.addCommand({
      name: "executeCreateNew",
      bindKey: {win: "Shift-Enter", mac: "Shift-Enter"},
      exec: function(editor) {
        evaluate(editor);
        add(editor, "// cell number: " + count++ + "\n", 'result for cell ' + count);
      }
    });
  };
  
  var readJSONFromDom = function() {
    var cells = []
    $('#arithmepad-cells .arithmepad-code-cell').each(function() {
      cells.push({type: 'code', content: ace.edit($(this).find('.arithmepad-input')[0]).getValue()});
    })
    return {cells: cells};
  };
  
  var updatePermalink = function() {
    $('#arithmepad-permalink').attr('href', '#' + base64.encode(JSON.stringify(readJSONFromDom())));
  };
  
  var loadFromHash = function() {
    json = JSON.parse(base64.decode(window.location.hash.slice(1)));
    var cellsNode = $('#arithmepad-cells');
    cellsNode.empty();
    for (var i=0; i<json.cells.length; i++) {
      var cellNode = $('<div>').attr('class', 'arithmepad-input').text(json.cells[i].content);
      cellsNode.append($('<div>').attr('class', 'arithmepad-code-cell').append(cellNode).append($('<div>').text('---').attr('class', 'arithmepad-output')));
      cellsNode.append($('<div class="arithmepad-cell-divider">'));
      var editor = ace.edit(cellNode[0]);
      editor.setOptions(editorOptions);
      registerCommands(editor);
    }  
    console.log(json);
  }
  
  var loadFromDom = function() {
    $('#arithmepad-cells .arithmepad-code-cell').each(function() {
      var editor = ace.edit($(this).find('.arithmepad-input')[0]);
      //editor.setTheme("ace/theme/twilight");
      editor.setOptions(editorOptions);
      registerCommands(editor);
      editor.focus();
    });
  };
  if (window.location.hash.length > 1)
    loadFromHash();
  loadFromDom();
})(ace, jQuery);