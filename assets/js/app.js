(function(ace, $) {

  var editorOptions = {
    mode: "ace/mode/javascript",
    tabSize: 2,
    //theme: theme,
    autoScrollEditorIntoView: true
  };
  
  var classes = {
    input: 'arithmepad-input',
    output: 'arithmepad-output',
    codeCell: 'arithmepad-code-cell',
    cellDivider: 'arithmepad-cell-divider',
    editSelection: 'arithmepad-edit-selection'
  }
  
  var div = {};
  _(classes).each(function(cls, clsName) {
    div[clsName] = function() {
      return $('<div>').attr('class', cls);
    };
  });
  
  var setResultForCell = function(editor, result) {
    $(editor.container).parent().find('.' + classes.output).text(result);
  };

  var add = function(editor, code, result) {
    var oldEl = $(editor.container).parent();
    var pad = div.cellDivider();
    pad.insertAfter(oldEl);

    var el = div.codeCell();
    el.insertAfter(pad);
    var input = div.input();
    el.append(input);
    el.append(div.output().text('---'));

    editor = ace.edit(input[0]);
    editor.setOptions(editorOptions);
    setupEditor(editor);
    editor.focus();
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      setResultForCell(editor, result);
  };
  
  var evaluate = function(editor) {
    try {
      var res = eval(editor.getValue());
    }
    catch(e) {
      res = e;
    }    
    if (typeof res === 'undefined')
      res = '---';
    setResultForCell(editor, res);
    updatePermalink();
  };

  var count = 1;
  var setupEditor = function(editor) {
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
    editor.on('blur', function() {
      $(editor.container).parent().removeClass(classes.editSelection);
    });
    editor.on('focus', function() {
      $(editor.container).parent().addClass(classes.editSelection);
    });
  };
  
  var readJSONFromDom = function() {
    var cells = []
    $('#arithmepad-cells .' + classes.codeCell).each(function() {
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
      var cellNode = div.input().text(json.cells[i].content);
      cellsNode.append(div.codeCell().append(cellNode).append(div.output().text('---')));
      cellsNode.append(div.cellDivider());
      var editor = ace.edit(cellNode[0]);
      editor.setOptions(editorOptions);
      setupEditor(editor);
    }
  }
  
  var loadFromDom = function() {
    $('#arithmepad-cells .' + classes.codeCell).each(function() {
      var editor = ace.edit($(this).find('.' + classes.input)[0]);
      //editor.setTheme("ace/theme/twilight");
      editor.setOptions(editorOptions);
      setupEditor(editor);
      editor.focus();
    });
  };
  if (window.location.hash.length > 1)
    loadFromHash();
  loadFromDom();
})(ace, jQuery);