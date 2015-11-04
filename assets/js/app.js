var arithmepad = (function(ace, $) {
  
  var classes = {
    input: 'arithmepad-input',
    output: 'arithmepad-output',
    cell: 'arithmepad-cell',
    markdown: 'arithmepad-markdown',
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
    showGutter: false,
    maxLines: 30,
    autoScrollEditorIntoView: true
  };
  
  var getOptionsForCell = function(cell) {
    var options = _.clone(editorOptions);
    if ($(cell).hasClass(classes.markdown)) {
      options.mode = 'ace/mode/markdown';
    }
    return options;
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
  
  var setResultForCell = function(editor, result, setHtml) {
    var output = getCell(editor).find('.' + classes.output);
    if (setHtml) {
      output.html(result);
    } else {
      output.text(result);
    }
  };
  
  var getPreviousEditor = function(editor) {
    var previous = getCell(editor).prevAll('.' + classes.cell);
    if (previous.length > 0) {
      var input = getEditor(previous);
      if (typeof input !== 'undefined') {
        return ace.edit(input);
      }
    }
  };
  
  var getNextEditor = function(editor) {
    var next = getCell(editor).nextAll('.' + classes.cell);
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
    return firstOrUndefined($(cell).nextAll('.' + classes.cell));
  };
  
  var getPreviousCell = function(cell) {
    return firstOrUndefined($(cell).prevAll('.' + classes.cell));
  };
  
  var scrollUpTo = function(cell) {
    cell.scrollIntoView(true);
    window.scrollBy(0, -90);
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
    var el = div.cell();
    el.insertAfter(getCell(editor));
    insertEditorAndOutputInto(el, code, result);
  };
  
  var insertEditorAndOutputInto = function(cell, code, result) {
    var input = div.input();
    cell.append(input);
    cell.append(div.output().text('---'));

    editor = ace.edit(input[0]);
    editor.setOptions(getOptionsForCell(cell));
    setupEditor(editor);
    editor.focus();
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      setResultForCell(editor, result);
    getCell(editor)[0].scrollIntoView(false);
  };
  
  var appendCodeCell = function(code, result) {
    var cell = div.cell();
    cell.appendTo($('#arithmepad-cells'));
    insertEditorAndOutputInto(cell, code, result);
  };
  
  var appendMarkdownCell = function(code, result) {
    var cell = div.cell();
    cell.addClass(classes.markdown);
    cell.appendTo($('#arithmepad-cells'));
    insertEditorAndOutputInto(cell, code, result);
  };
  
  var evaluate = function(editor) {
    try {
      var isMarkdownCell = editor.getOption('mode') == 'ace/mode/markdown';
      var res = '';
      var resultDiv = getCell(editor).find('.' + classes.output);
      if (isMarkdownCell) {
        res = marked(editor.getValue());
        $(editor.container).hide();
        editor.blur();
      } else {
        res = eval(editor.getValue());
      }
      resultDiv.removeClass('text-danger');
    }
    catch(e) {
      res = e;
      resultDiv.addClass('text-danger');
    }
    if (typeof res === 'undefined') {
      res = '---';
    }
    setResultForCell(editor, res, isMarkdownCell);
    resultDiv.show();
    updatePermalink();
  };
  
  var evaluateAllCells = function() {
    $('.ace_editor').each(function() {
      evaluate(ace.edit(this));
    })
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
      getCell(editor).addClass(classes.commandSelection);
    });
    editor.on('focus', function() {
      getCell(editor).addClass(classes.editSelection);
      $('.' + classes.commandSelection).removeClass(classes.commandSelection);
      if (editor.getOption('mode') == 'ace/mode/markdown') {
        getCell(editor).find('.' + classes.output).hide();
      }
    });
    editor.commands.addCommand({
      name: 'arrowKeyDown',
      bindKey: {win: 'Down'},
      exec: function(editor) {
        if (editor.getCursorPosition().row + 1 == editor.getSession().getDocument().getLength()) {
          var next = getNextEditor(editor);
          if (typeof next !== 'undefined') {
            $(next.container).show();
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
            $(previous.container).show();
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
    $('#arithmepad-cells .' + classes.cell).each(function() {
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
      cellsNode.append(div.cell().append(cellNode).append(div.output().text('---')));
      var editor = ace.edit(cellNode[0]);
      editor.setOptions(editorOptions);
      setupEditor(editor);
    }
  }
  
  var loadFromDom = function() {
    $('#arithmepad-cells .' + classes.cell).each(function() {
      var editor = ace.edit(getEditor(this));
      //editor.setTheme("ace/theme/twilight");
      editor.setOptions(getOptionsForCell(this));
      setupEditor(editor);
      editor.focus();
    });
  };
  
  var loadFromJSFile = function(code) {
    clearPad();
    var lines = code.split('\n'); //todo: support \r\n
    var currentCell = [];
    _(lines).each(function(line) {
      var cmd = line.trimLeft().slice(2).trimLeft();
      if (line.trimLeft().startsWith('//') && cmd.startsWith('!arithmepad-cell')) {
        if (currentCell.length > 0) {
          appendCodeCell(currentCell.join('\n'));
        }
        currentCell = [];
      } else {
        currentCell.push(line);
      }
    });
    if (currentCell.length > 0) {
      appendCodeCell(currentCell.join('\n'));
    }
  };
  
  var saveToJSFile = function() {
    var code = [];
    $('#arithmepad-cells .' + classes.cell).each(function() {
      code.push('// !arithmepad-cell\n' + ace.edit(getEditor(this)).getValue());
    });
    return code.join('\n');
  };
  
  var clearPad = function() {
    $('#arithmepad-cells').empty();
  };
  
  var keyHandlers = {
    13: /* enter */ function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = ace.edit(getEditor(cmdSel));
          $(editor.container).show();
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
      },
    76: /* l */ function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = ace.edit(getEditor(cmdSel));
          editor.renderer.setShowGutter(!editor.renderer.getShowGutter());
        }
      },
    77: /* m */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = ace.edit(getEditor(cmdSel));
          editor.setOption('mode', 'ace/mode/markdown');
          cmdSel.addClass(classes.markdown);
        }
      },
    89: /* y */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = ace.edit(getEditor(cmdSel));
          editor.setOption('mode', 'ace/mode/javascript');
          cmdSel.removeClass(classes.markdown);
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
      lastKey = evt.which;
    } else if ([lastKey, evt.which] in keyHandlers) {
      keyHandlers[[lastKey, evt.which]](evt);
      lastKey = null;
    } else {
      lastKey = evt.which;
    }
  });
  // setup buttons in navbar
  $('#arithmepad-run-all-button').click(function(e) {
    evaluateAllCells();
    e.preventDefault();
  });
  $('#arithmepad-download-js').click(function() {
    var d = (new Date()).toISOString().replace(':', '-', 'g');
    $(this).attr('href', 'data:application/javascript;charset=utf-8,' + encodeURIComponent(saveToJSFile()));
    $(this).attr('download', 'My Pad ' + d + '.js');
  });
  
  $('#arithmepad-open-js-file-button').on('change', function(evt) {
    var f = evt.target.files[0];
    try {
      var r = new FileReader();
      r.onload = function(l){
        loadFromJSFile(l.target.result);
      };
      r.readAsText(f);
    } catch (e) {
      alert('Could not open file: ' + e);
    }
  });
  $('#arithmepad-open-js').click(function(e) {
    $('#arithmepad-open-js-file-button').click();
    e.preventDefault();
  });
  
  return {
    loadFromDom: loadFromDom,
    loadFromBase64: loadFromBase64,
    appendCodeCell: appendCodeCell,
    appendMarkdownCell: appendMarkdownCell,
    clearPad: clearPad,
    loadFromJSFile: loadFromJSFile,
    saveToJSFile: saveToJSFile,
    evaluateAllCells: evaluateAllCells,
    __: {
      getCell: getCell,
      getNextEditor: getNextEditor,
      classes: classes
    }
  }
})(ace, jQuery);