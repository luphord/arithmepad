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
  
  // Cell constructor
  
  var Cell = function(domNode) {
    if (typeof domNode === 'undefined') {
      throw 'A DOM node is required for a cell';
    }
    this.$node = $(domNode);
    if (this.$node.length != 1) {
      throw 'Cannot create cell: domNode has a length of ' + this.$node.length;
    }
  };
  
  Cell.prototype.getInput = function() {
    return this.$node.find('.' + classes.input);
  };
  
  Cell.prototype.getEditor = function() {
    var sel = this.$node.find('.' + classes.input);
    if (sel.length > 0) {
      return ace.edit(sel[0]);
    }
  };
  
  Cell.prototype.getAceOptions = function() {
    var options = _.clone(editorOptions);
    if (this.$node.hasClass(classes.markdown)) {
      options.mode = 'ace/mode/markdown';
    }
    return options;
  };
  
  Cell.prototype.getPrevious = function() {
    var previous = this.$node.prevAll('.' + classes.cell);
    if (previous.length > 0) {
      return new Cell(previous[0]);
    }
  };
  
  Cell.prototype.getNext = function() {
    var next = this.$node.nextAll('.' + classes.cell);
    if (next.length > 0) {
      return new Cell(next[0]);
    }
  };
  
  Cell.prototype.setResult = function(result, setHtml) {
    var output = this.$node.find('.' + classes.output);
    if (setHtml) {
      output.html(result);
    } else {
      output.text(result);
    }
  };
  
  Cell.fromEditor = function(editor) {
    return new Cell($(editor.container).parent());
  };
  
  // ace editor related functionality

  var editorOptions = {
    mode: "ace/mode/javascript",
    tabSize: 2,
    //theme: theme,
    showGutter: false,
    maxLines: 30,
    autoScrollEditorIntoView: true
  };
  
  var firstOrUndefined = function(selection) {
    if ($(selection).length > 0) {
      return $(selection)[0];
    }
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
    el.insertAfter(Cell.fromEditor(editor).$node);
    insertEditorAndOutputInto(el, code, result);
  };
  
  var insertEditorAndOutputInto = function(cell, code, result) {
    var input = div.input();
    cell.append(input);
    cell.append(div.output().text('---'));

    editor = ace.edit(input[0]);
    editor.setOptions((new Cell(cell)).getAceOptions());
    setupEditor(editor);
    editor.focus();
    
    if (typeof code !== 'undefined')
      editor.setValue(code, 1);
    if (typeof result !== 'undefined')
      Cell.fromEditor(editor).setResult(result);
    Cell.fromEditor(editor).$node[0].scrollIntoView(false);
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
      var resultDiv = Cell.fromEditor(editor).$node.find('.' + classes.output);
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
      name: 'evaluateCreateNew',
      bindKey: {win: 'Shift-Enter'},
      exec: function(editor) {
        evaluate(editor);
        add(editor, "// cell number: " + count++ + "\n", 'result for cell ' + count);
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
            scrollDownTo(nextCell.$node[0]);
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
            scrollUpTo(previousCell.$node[0]);
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
        selectInCommandMode(Cell.fromEditor(editor).$node);
      }
    });
    // disable warning
    editor.$blockScrolling = Infinity;
  };
  
  var readJSONFromDom = function() {
    var cells = []
    $('#arithmepad-cells .' + classes.cell).each(function() {
      cells.push({type: 'code', content: new Cell(this).getEditor().getValue()});
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
      var editor = new Cell(this).getEditor();
      //editor.setTheme("ace/theme/twilight");
      editor.setOptions((new Cell(this)).getAceOptions());
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
      code.push('// !arithmepad-cell\n' + new Cell(this).getEditor().getValue());
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
          var nextCell = new Cell(cmdSel[0]).getNext();
          if (typeof nextCell !== 'undefined') {
            selectInCommandMode(nextCell.$node[0]);
            scrollDownTo(nextCell.$node[0]);
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
      var nextCell = new Cell(cmdSel[0]).getNext();
      if (typeof nextCell !== 'undefined') {
        selectInCommandMode(nextCell.$node[0]);
        scrollDownTo(nextCell.$node[0]);
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
})(ace, jQuery);