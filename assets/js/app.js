var arithmepad = (function(ace, $) {
  
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
  
  // ace editor related functionality

  var editorOptions = {
    mode: "ace/mode/javascript",
    tabSize: 2,
    //theme: theme,
    autoScrollEditorIntoView: true
  };
  
  var getCell = function(editor) {
    return $(editor.container).parent();
  };
  
  var setResultForCell = function(editor, result) {
    getCell(editor).find('.' + classes.output).text(result);
  };
  
  var getPreviousEditor = function(editor) {
    var previous = getCell(editor).prevAll('.' + classes.codeCell);
    if (previous.length > 0) {
      var input = $(previous[0]).find('.' + classes.input);
      if (input.length > 0)
        return ace.edit(input[0]);
    }
  };
  
  var getNextEditor = function(editor) {
    var next = getCell(editor).nextAll('.' + classes.codeCell);
    if (next.length > 0) {
      var input = $(next[0]).find('.' + classes.input);
      if (input.length > 0)
        return ace.edit(input[0]);
    }
  };
  
  // end of ace editor related functionality

  var add = function(editor, code, result) {
    var pad = div.cellDivider();
    pad.insertAfter(getCell(editor));

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
      getCell(editor).removeClass(classes.editSelection);
    });
    editor.on('focus', function() {
      getCell(editor).addClass(classes.editSelection);
    });
    editor.commands.addCommand({
      name: "arrowKeyDown",
      bindKey: {win: "Down"},
      exec: function(editor) {
        if (editor.getCursorPosition().row + 1 == editor.getSession().getDocument().getLength()) {
          var next = getNextEditor(editor);
          if (typeof next !== 'undefined') {
            next.focus();
          }
        } else {
          editor.navigateDown();
        }
      }
    });
    editor.commands.addCommand({
      name: "arrowKeyUp",
      bindKey: {win: "Up"},
      exec: function(editor) {
        if (editor.getCursorPosition().row == 0) {
          var previous = getPreviousEditor(editor);
          if (typeof previous !== 'undefined') {
            previous.focus();
          } 
        } else {
          editor.navigateUp();
        }
      }
    });
    // disable warning
    editor.$blockScrolling = Infinity;
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
  
  var loadFromBase64 = function(base64string) {
    json = JSON.parse(base64.decode(base64string));
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
  
  return {
    loadFromDom: loadFromDom,
    loadFromBase64: loadFromBase64
  }
})(ace, jQuery);