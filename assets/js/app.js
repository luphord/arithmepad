var arithmepad = (function(ace, $) {
  
  var classes = {
    input: 'arithmepad-input',
    output: 'arithmepad-output',
    codeCell: 'arithmepad-code-cell',
    cellDivider: 'arithmepad-cell-divider',
    editSelection: 'arithmepad-edit-selection',
    commandSelection: 'arithmepad-command-selection'
  };
  
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
  
  var getEditor = function(cell) {
    if (typeof cell !== 'undefined' && $(cell).length > 0) {
      var sel = $($(cell)[0]).find('.' + classes.input);
      if (sel.length > 0)
        return sel[0];
    }
  };
  
  var setResultForCell = function(editor, result) {
    getCell(editor).find('.' + classes.output).text(result);
  };
  
  var getPreviousEditor = function(editor) {
    var previous = getCell(editor).prevAll('.' + classes.codeCell);
    if (previous.length > 0) {
      var input = getEditor(previous);
      if (typeof input !== 'undefined') {
        return ace.edit(input);
      }
    }
  };
  
  var getNextEditor = function(editor) {
    var next = getCell(editor).nextAll('.' + classes.codeCell);
    if (next.length > 0) {
      var input = getEditor(next);
      if (typeof input !== 'undefined') {
        return ace.edit(input);
      }
    }
  };
  
  var firstOrUndefined = function(selection) {
    if ($(selection).length > 0) {
      return $(selection)[0];
    }
  }
  
  var getNextCell = function(cell) {
    return firstOrUndefined($(cell).nextAll('.' + classes.codeCell));
  };
  
  var getPreviousCell = function(cell) {
    return firstOrUndefined($(cell).prevAll('.' + classes.codeCell));
  };
  
  var scrollUpTo = function(cell) {
    cell.scrollIntoView(true);
    window.scrollBy(0, -60);
  };
  
  var scrollDownTo = function(cell) {
    cell.scrollIntoView(false);
  };
  
  var emptyEditAndCommandSelection = function() {
    $('.' + classes.editSelection).removeClass(classes.editSelection);
    $('.' + classes.commandSelection).removeClass(classes.commandSelection);
  };
  
  var selectInCommandMode = function(cell) {
    emptyEditAndCommandSelection();
    $(cell).addClass(classes.commandSelection);
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
    getCell(editor)[0].scrollIntoView(false);
  };
  
  var evaluate = function(editor) {
    try {
      var res = eval(editor.getValue());
    }
    catch(e) {
      res = e;
    }    
    if (typeof res === 'undefined') {
      res = '---';
    }
    setResultForCell(editor, res);
    updatePermalink();
  };

  var count = 1;
  var setupEditor = function(editor) {
    editor.commands.addCommand({
      name: 'evaluate',
      bindKey: {win: 'Ctrl-Enter', mac: 'Cmd-Enter'},
      exec: evaluate
    });
    editor.commands.addCommand({
      name: 'evaluateCreateNew',
      bindKey: {win: 'Shift-Enter'},
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
      $('.' + classes.commandSelection).removeClass(classes.commandSelection);
    });
    editor.commands.addCommand({
      name: 'arrowKeyDown',
      bindKey: {win: 'Down'},
      exec: function(editor) {
        if (editor.getCursorPosition().row + 1 == editor.getSession().getDocument().getLength()) {
          var next = getNextEditor(editor);
          if (typeof next !== 'undefined') {
            next.focus();
            scrollDownTo(getCell(next)[0]);
          }
        } else {
          editor.navigateDown();
        }
      }
    });
    editor.commands.addCommand({
      name: 'arrowKeyUp',
      bindKey: {win: 'Up'},
      exec: function(editor) {
        if (editor.getCursorPosition().row == 0) {
          var previous = getPreviousEditor(editor);
          if (typeof previous !== 'undefined') {
            previous.focus();
            scrollUpTo(getCell(previous)[0]);
          } 
        } else {
          editor.navigateUp();
        }
      }
    });
    editor.commands.addCommand({
      name: 'commandMode',
      bindKey: {win: 'Esc'},
      exec: function(editor) {
        editor.blur();
        selectInCommandMode(getCell(editor));
      }
    });
    // disable warning
    editor.$blockScrolling = Infinity;
  };
  
  var readJSONFromDom = function() {
    var cells = []
    $('#arithmepad-cells .' + classes.codeCell).each(function() {
      cells.push({type: 'code', content: ace.edit(getEditor(this)).getValue()});
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
      var editor = ace.edit(getEditor(this));
      //editor.setTheme("ace/theme/twilight");
      editor.setOptions(editorOptions);
      setupEditor(editor);
      editor.focus();
    });
  };
  
  var clearPad = function() {
    $('#arithmepad-cells').empty();
  };
  
  var keyHandlers = {
    13: /* enter */ function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = ace.edit(getEditor(cmdSel));
          editor.focus();
          evt.preventDefault();
        }
        cmdSel.removeClass(classes.commandSelection);
      },
    38: /* arrow up */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var prevCell = getPreviousCell(cmdSel[0]);
          if (typeof prevCell !== 'undefined') {
            selectInCommandMode(prevCell);
            scrollUpTo(prevCell);
          }
          evt.preventDefault();
        }
      },
    40: /* arrow down */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var nextCell = getNextCell(cmdSel[0]);
          if (typeof nextCell !== 'undefined') {
            selectInCommandMode(nextCell);
            scrollDownTo(nextCell);
          }
          evt.preventDefault();
        }
      }
  };
  keyHandlers[[68, 68] /*[d, d]*/] = function(evt) {
    cmdSel = $('.' + classes.commandSelection);
    if (cmdSel.length > 0) {
      var nextCell = getNextCell(cmdSel[0]);
      if (typeof nextCell !== 'undefined') {
        selectInCommandMode(nextCell);
        scrollDownTo(nextCell);
      } else {
        var prevCell = getPreviousCell(cmdSel[0]);
        if (typeof prevCell !== 'undefined') {
          selectInCommandMode(prevCell);
          scrollUpTo(prevCell);
        }
      }
      $(cmdSel[0]).remove();
    }
  }
  
  // initialize DOM
  var lastKey = null;
  $('body').keydown(function(evt) {
    if (evt.which in keyHandlers) {
      keyHandlers[evt.which](evt);
    } else if ([lastKey, evt.which] in keyHandlers) {
      keyHandlers[[lastKey, evt.which]](evt);
    }
    lastKey = evt.which;
  });
  
  return {
    loadFromDom: loadFromDom,
    loadFromBase64: loadFromBase64,
    clearPad: clearPad,
    __: {
      getCell: getCell,
      getNextEditor: getNextEditor,
      classes: classes
    }
  }
})(ace, jQuery);