arithmepad = (function(ace, $, _, numeric, Cell, classes, div) {
  
  // Cell functions
  
  Cell.prototype.insertEditorAndOutput = function(code, result) {
    var inMarker = div.inMarker();
    if (this.getInMarker().length > 0) {
      inMarker = this.getInMarker();
    } else {
      inMarker.prependTo(this.$node);
    }
    inMarker.text('In []');
    
    var input = div.input();
    if (this.getInput().length > 0) {
      input = this.getInput();
    } else {
      this.$node.append(input);
    }
    input.addClass('col-md-11');
    
    var plot = this.$node.append(div.plot().attr('id', 'plot' + _.uniqueId()));
    if (this.getPlot().length > 0) {
      plot = this.getPlot();
    }
    plot.addClass('col-md-5');
    plot.hide();
    
    var outMarker = div.outMarker();
    if (this.getOutMarker().length > 0) {
      outMarker = this.getOutMarker();
    } else {
      outMarker.insertAfter(plot);
    }
    outMarker.text('Out []');
    
    var output = this.getOutput();
    if (output.length == 0) {
      this.$node.append(div.output().text('---'));
      output = this.getOutput();
    }
    output.addClass('col-md-11');

    editor = ace.edit(input[0]);
    editor.setOptions(this.getAceOptions());
    setupEditor(editor);
    editor.focus();
    if (this.isMarkdownCell()) {
      inMarker.text('');
      outMarker.text('');
    }
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      this.setResult(result);
    this.scrollDownTo();
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
    var cellDiv = div.cell();
    cellDiv.addClass(classes.markdown);
    cellDiv.appendTo($('#arithmepad-cells'));
    new Cell(cellDiv).insertEditorAndOutput(code, result);
  };
  
  _([[5,11], [11,5]]).each(function(pair) {
    $.fn['col_md_'+pair[0]+'_to_'+pair[1]] = function() {
      return this.removeClass('col-md-'+pair[0]).addClass('col-md-'+pair[1]);
    };
  });
  
  var evalCounter = 0;
  var evaluate = function(editor) {
    try {
      var isMarkdownCell = editor.getOption('mode') == 'ace/mode/markdown';
      var res = '';
      var resultDiv = Cell.fromEditor(editor).getOutput();
      var plotDiv = Cell.fromEditor(editor).getPlot();
      plotDiv.empty();
      if (isMarkdownCell) {
        res = marked(editor.getValue());
        $(editor.container).hide();
        Cell.fromEditor(editor).getInMarker().text('');
        Cell.fromEditor(editor).getOutMarker().text('');
        editor.blur();
      } else {
        plotDiv.show();
        var plotId = '#' + plotDiv.attr('id');
        Cell.fromEditor(editor).getInMarker().text('In [' + evalCounter + ']');
        Cell.fromEditor(editor).getOutMarker().text('Out [' + evalCounter + ']');
        evalCounter++;
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
    setTimeout(function() {
      if (plotDiv.find('svg').length > 0) {
        plotDiv.show();
        $(editor.container).col_md_11_to_5();
      } else {
        plotDiv.hide();
        $(editor.container).col_md_5_to_11();
      }
    }, 1);
  };
  
  var evaluateAllCells = function() {
    $('.ace_editor.' + classes.input).each(function() {
      evaluate(ace.edit(this));
    })
  };
  
  // editor autocomplete
  var alphaNum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789$';
  var getTokens = function(session, pos) {
    var line = session.getLine(pos.row).slice(0, pos.column);
    var noObject = false;
    for (var i=line.length-1; i>=0; i--) {
      if (line[i] == '.') {
        break;
      } else if (alphaNum.indexOf(line[i]) < 0) {
        noObject = true;
        break;
      }
    }
    if (noObject) {
      return [];
    }
    line = line.slice(0, i);
    tokens = [];
    current = '';
    var last = i+1;
    for (var i=line.length-1; i>=0; i--) {
      if (alphaNum.indexOf(line[i]) < 0) {
        if (i < last) {
          tokens.push(line.slice(i+1, last));
          last = i;
        }
        if (line[i] != '.') {
          break;
        }
      }
    }
    if (i < last) {
      tokens.push(line.slice(i+1, last));
      last = i;
    }
    return tokens;
  };
  
  var getProperties = function(tokens) {
    var obj = window;
    while(tokens.length > 0) {
      obj = obj[tokens.pop()];
      if (typeof obj === 'undefined') {
        return [];
      }
    }
    return _.allKeys(obj);
  };

  var aceLangTools = ace.require("ace/ext/language_tools");  
  aceLangTools.addCompleter({
    getCompletions: function(editor, session, pos, prefix, callback) {
      var tokens = getTokens(session, pos);
      var properties = getProperties(_.clone(tokens)).sort();
      var obj = tokens.reverse().join('.')
      callback(null, _(properties).map(function(token) {
        return {name: token, value: token, score: 300, meta: obj};
      }));
    }
  });
  
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
        Cell.fromEditor(editor).getOutput().hide();
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
  
  var loadFromBase64 = function(base64string) {
    loadFromJSFile(base64.decode(base64string));
  };
  
  var loadFromDom = function() {
    $('#arithmepad-cells .' + classes.cell).each(function() {
      $(this).addClass('row');
      new Cell(this).insertEditorAndOutput();
    });
  };
  
  var loadFromJSFile = function(code) {
    clearPad();
    var lines = code.split('\n'); //todo: support \r\n
    if (lines.length > 0) {
      var cmd = lines[0].trimLeft().slice(2).trimLeft();
      if (lines[0].trimLeft().startsWith('//') && cmd.startsWith('!arithmepad-properties')) {
        setPadProperties(JSON.parse(cmd.slice(23)));
        lines.shift();
      }
    }
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
  
  var getPadProperties = function() {
    return {
      title: $('#arithmepad-title').text()
    }
  };
  
  var setPadProperties = function(properties) {
    if (typeof properties.title !== 'undefined') {
      setTitle(properties.title);
    }
  };
  
  var saveToJSFile = function() {
    var code = [];
    code.push('// !arithmepad-properties ' + JSON.stringify(getPadProperties()));
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
  
  $('#arithmepad-permalink').click(function() {
    $(this).attr('href', '#' + base64.encode(saveToJSFile()));
  });
  
  // setup buttons in navbar
  var setTitle = function(title) {
    $('#arithmepad-title').text(title);
    document.title = 'arithmepad - ' + title;
  };
  setTitle($('#arithmepad-title').text());
  
  $('#arithmepad-title').click(function(e) {
    var $this = $(this);
    bootbox.prompt({
      title: "Pad Title",
      value: $this.text(),
      callback: function(result) {
        if (result !== null) {
          setTitle(result);
        }
      }
    });
    e.preventDefault();
  });
  $('#arithmepad-new-pad').click(function(e) {
    $(this).attr('href', window.location);
  });
  $('#arithmepad-close-pad').click(function(e) {
    bootbox.confirm('Do you really want to close the current pad?', function(ok) {
      if (ok) {
        $('#arithmepad-cells').empty();
        setTitle('Untitled');
      }
    });
    e.preventDefault();
  });
  $('#arithmepad-run-all-button, #arithmepad-toolbar-run-all-cells').click(function(e) {
    evaluateAllCells();
    e.preventDefault();
  });
  $('#arithmepad-download-js, #arithmepad-toolbar-save-js').click(function() {
    var d = (new Date()).toISOString().replace(':', '-', 'g');
    $(this).attr('href', 'data:application/javascript;charset=utf-8,' + encodeURIComponent(saveToJSFile()));
    $(this).attr('download', $('#arithmepad-title').text() + '__' + d + '.js');
  });
  
  $('#arithmepad-open-js-file-button').on('change', function(evt) {
    var f = evt.target.files[0];
    try {
      var r = new FileReader();
      r.onload = function(l){
        loadFromJSFile(l.target.result);
      };
      r.readAsText(f);
      var title = f.name.split('__')[0];
      if (title.length >= f.name.length) { // did not contain a '__'
        title = f.name.split('.js')[0];
      }
      setTitle(title);
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
    } else {
      appendCodeCell();
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
  $('#arithmepad-paste-cell, #arithmepad-toolbar-paste-cell').click(function(e) {
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
    getPadProperties: getPadProperties,
    evaluateAllCells: evaluateAllCells,
    __: {
      getCell: function(editor){return Cell.fromEditor(editor).$node;},
      classes: classes,
      evaluate: evaluate,
      resetEvalCounter: function() {evalCounter = 0;}
    }
  }
})(ace, jQuery, _, numeric, arithmepad.Cell, arithmepad.__.classes, arithmepad.__.div);