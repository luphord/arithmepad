arithmepad = (function(ace, $, _, numeric, Cell, classes) {
  
  var div = {};
  _(classes).each(function(cls, clsName) {
    div[clsName] = function() {
      return $('<div>').attr('class', cls);
    };
  });
  
  // Cell functions
  
  Cell.prototype.insertEditorAndOutput = function(code, result) {
    var input = div.input();
    if (this.$node.find('.' + classes.input).length > 0) {
      input = this.$node.find('.' + classes.input)
    } else {
      this.$node.append(input);
    }
    if (this.$node.find('.' + classes.output).length == 0) {
      this.$node.append(div.output().text('---'));
    }
    if (this.$node.find('.' + classes.plot).length == 0) {
      this.$node.append(div.plot().attr('id', 'plot' + _.uniqueId()));
    }

    editor = ace.edit(input[0]);
    editor.setOptions(this.getAceOptions());
    setupEditor(editor);
    editor.focus();
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      this.setResult(result);
    this.scrollDownTo();
  };
  
  Cell.prototype.pasteAfter = function() {
    if (typeof Cell.clipboard !== 'undefined') {
      var lines = Cell.clipboard.split('\n'); //todo: support \r\n
      if (lines.length > 1) {
        lines = lines.slice(1);
        var el = div.cell();
        el.insertAfter(this.$node);
        var code = '';
        if (_(lines).all(function(line) {return line.trimLeft().startsWith('// ')})) {
          el.addClass(classes.markdown);
          code = _(lines).map(function(line) {return line.trimLeft().slice(3)}).join('\n');
        } else {
          code = lines.join('\n');
        }
        new Cell(el).insertEditorAndOutput(code);
      }
    }
  };
  
  // end of Cell functions

  var add = function(editor, code, result) {
    var el = div.cell();
    el.insertAfter(Cell.fromEditor(editor).$node);
    var cell = new Cell(el);
    cell.insertEditorAndOutput(code, result);
    return cell;
  };
  
  var appendCodeCell = function(code, result) {
    var cell = div.cell();
    cell.appendTo($('#arithmepad-cells'));
    new Cell(cell).insertEditorAndOutput(code, result);
  };
  
  var appendMarkdownCell = function(code, result) {
    var cell = div.cell();
    cell.addClass(classes.markdown);
    cell.appendTo($('#arithmepad-cells'));
    new Cell(cell).insertEditorAndOutput(code, result);
  };
  
  var evaluate = function(editor) {
    try {
      var isMarkdownCell = editor.getOption('mode') == 'ace/mode/markdown';
      var res = '';
      var resultDiv = Cell.fromEditor(editor).$node.find('.' + classes.output);
      if (isMarkdownCell) {
        res = marked(editor.getValue());
        $(editor.container).hide();
        editor.blur();
      } else {
        var plotId = '#' + Cell.fromEditor(editor).$node.find('.' + classes.plot).attr('id');
        res = eval(editor.getValue());
        if (typeof numeric !== 'undefined') {
          resBackup = res;
          try {
            numeric.precision = 10;
            res = numeric.prettyPrint(res).trim();
          } catch(e) {
            res = resBackup;
          }          
        }
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
    Cell.fromEditor(editor).setResult(res, isMarkdownCell);
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
      name: 'evaluateSelectBelowOrCreateNew',
      bindKey: {win: 'Shift-Enter'},
      exec: function(editor) {
        evaluate(editor);
        var nextCell = Cell.fromEditor(editor).getNext();
        if (typeof nextCell === 'undefined') {
          nextCell = add(editor);
        }
        nextCell.scrollDownTo();
        nextCell.getEditor().focus();
      }
    });
    editor.commands.addCommand({
      name: 'evaluateCreateNew',
      bindKey: {win: 'Alt-Enter'},
      exec: function(editor) {
        evaluate(editor);
        add(editor);
      }
    });
    editor.on('blur', function() {
      Cell.fromEditor(editor).$node.removeClass(classes.editSelection);
      Cell.fromEditor(editor).$node.addClass(classes.commandSelection);
    });
    editor.on('focus', function() {
      Cell.fromEditor(editor).$node.addClass(classes.editSelection);
      $('.' + classes.commandSelection).removeClass(classes.commandSelection);
      if (editor.getOption('mode') == 'ace/mode/markdown') {
        Cell.fromEditor(editor).$node.find('.' + classes.output).hide();
      }
    });
    editor.commands.addCommand({
      name: 'arrowKeyDown',
      bindKey: {win: 'Down'},
      exec: function(editor) {
        if (editor.getCursorPosition().row + 1 == editor.getSession().getDocument().getLength()) {
          var nextCell = Cell.fromEditor(editor).getNext();
          if (typeof nextCell !== 'undefined') {
            nextCell.getInput().show();
            nextCell.getEditor().focus();
            nextCell.getEditor().navigateFileStart();
            nextCell.scrollDownTo();
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
          var previousCell = Cell.fromEditor(editor).getPrevious();
          if (typeof previousCell !== 'undefined') {
            previousCell.getInput().show();
            previousCell.getEditor().focus();
            previousCell.getEditor().navigateFileEnd();
            previousCell.scrollUpTo();
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
        Cell.fromEditor(editor).selectInCommandMode();
      }
    });
    // disable warning
    editor.$blockScrolling = Infinity;
  };
  
  var updatePermalink = function() {
    $('#arithmepad-permalink').attr('href', '#' + base64.encode(saveToJSFile()));
  };
  
  var loadFromBase64 = function(base64string) {
    loadFromJSFile(base64.decode(base64string));
  };
  
  var loadFromDom = function() {
    $('#arithmepad-cells .' + classes.cell).each(function() {
      new Cell(this).insertEditorAndOutput();
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
          if (_(currentCell).all(function(line) {return line.trimLeft().startsWith('// ')})) {
            appendMarkdownCell(_(currentCell).map(function(line) {return line.trimLeft().slice(3)}).join('\n'));
          } else {
            appendCodeCell(currentCell.join('\n'));
          }
        }
        currentCell = [];
      } else {
        currentCell.push(line);
      }
    });
    if (currentCell.length > 0) {
      if (_(currentCell).all(function(line) {return line.trimLeft().startsWith('// ')})) {
        appendMarkdownCell(_(currentCell).map(function(line) {return line.trimLeft().slice(3)}).join('\n'));
      } else {
        appendCodeCell(currentCell.join('\n'));
      }
    }
  };
  
  var saveToJSFile = function() {
    var code = [];
    $('#arithmepad-cells .' + classes.cell).each(function() {
      code.push(new Cell(this).getJSValue());
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
          var editor = new Cell(cmdSel[0]).getEditor();
          $(editor.container).show();
          editor.focus();
          evt.preventDefault();
        }
        cmdSel.removeClass(classes.commandSelection);
      },
    38: /* arrow up */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var prevCell = new Cell(cmdSel[0]).getPrevious();
          if (typeof prevCell !== 'undefined') {
            prevCell.selectInCommandMode();
            prevCell.scrollUpTo();
          }
          evt.preventDefault();
        }
      },
    40: /* arrow down */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var nextCell = new Cell(cmdSel[0]).getNext();
          if (typeof nextCell !== 'undefined') {
            nextCell.selectInCommandMode();
            nextCell.scrollDownTo();
          }
          evt.preventDefault();
        }
      },
    76: /* l */ function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = new Cell(cmdSel[0]).getEditor();
          editor.renderer.setShowGutter(!editor.renderer.getShowGutter());
        }
      },
    77: /* m */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = new Cell(cmdSel[0]).getEditor();
          editor.setOption('mode', 'ace/mode/markdown');
          cmdSel.addClass(classes.markdown);
        }
      },
    89: /* y */function(evt) {
        cmdSel = $('.' + classes.commandSelection);
        if (cmdSel.length > 0) {
          var editor = new Cell(cmdSel[0]).getEditor();
          editor.setOption('mode', 'ace/mode/javascript');
          cmdSel.removeClass(classes.markdown);
        }
      }
  };
  keyHandlers[[68, 68] /*[d, d]*/] = function(evt) {
    cmdSel = $('.' + classes.commandSelection);
    if (cmdSel.length > 0) {
      new Cell(cmdSel[0]).remove();
    }
  }
  
  // initialize DOM
  ace.require("ace/ext/language_tools");
  
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
  
  $('#arithmepad-cells').on('dblclick', '.' + classes.markdown + ' .' + classes.output, function(e) {
    var $node = $(this).parent();
    if ($node.length > 0) {
      var editor = new Cell($node).getEditor();
      $(editor.container).show();
      editor.focus();
    }
    e.preventDefault();
  });
  
  // setup buttons in navbar
  $('#arithmepad-run-all-button, #arithmepad-toolbar-run-all-cells').click(function(e) {
    evaluateAllCells();
    e.preventDefault();
  });
  $('#arithmepad-download-js, #arithmepad-toolbar-save-js').click(function() {
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
  $('#arithmepad-open-js, #arithmepad-toolbar-open-js').click(function(e) {
    $('#arithmepad-open-js-file-button').click();
    e.preventDefault();
  });
  $('#arithmepad-toolbar-add-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      add(sel.getEditor());
    }
    e.preventDefault();
  });
  $('#arithmepad-toolbar-move-cell-up').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.moveUp();
    }
    e.preventDefault();
  });
  $('#arithmepad-toolbar-move-cell-down').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.moveDown();
    }
    e.preventDefault();
  });
  $('#arithmepad-copy-cell, #arithmepad-toolbar-copy-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.copy();
    }
    e.preventDefault();
  });
  $('#arithmepad-cut-cell, #arithmepad-toolbar-cut-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.cut();
    }
    e.preventDefault();
  });
  $('#arithmepad-toolbar-paste-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.pasteAfter();
    } else {
      var el = div.cell();
      el.appendTo($('#arithmepad-cells'));
      var fakeCell = new Cell(el);
      fakeCell.pasteAfter();
      fakeCell.remove();
    }
    e.preventDefault();
  });
  $('#arithmepad-run-cell, #arithmepad-toolbar-run-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      evaluate(sel.getEditor());
    }
    e.preventDefault();
  });
  $('#arithmepad-delete-cell').click(function(e) {
    sel = Cell.getSelected();
    if (typeof sel !== 'undefined') {
      sel.remove();
    }
    e.preventDefault();
  });
  
  return {
    loadFromDom: loadFromDom,
    loadFromBase64: loadFromBase64,
    Cell: Cell,
    appendCodeCell: appendCodeCell,
    appendMarkdownCell: appendMarkdownCell,
    clearPad: clearPad,
    loadFromJSFile: loadFromJSFile,
    saveToJSFile: saveToJSFile,
    evaluateAllCells: evaluateAllCells,
    __: {
      getCell: function(editor){return Cell.fromEditor(editor).$node;},
      classes: classes
    }
  }
})(ace, jQuery, _, numeric, arithmepad.Cell, arithmepad.__.classes);