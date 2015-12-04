var arithmepadInitializeDom = function(ace, $, Cell, classes, evaluate, evaluateAllCells, setTitle, div, loadFromJSFile, saveToJSFile, add) {
  // initialize DOM event handlers
  
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
        window.location.hash = '';
      }
    });
    e.preventDefault();
  });
  $('#arithmepad-run-all-button, #arithmepad-toolbar-run-all-cells').click(function(e) {
    evaluateAllCells();
    e.preventDefault();
  });
  $('#arithmepad-to-markdown').click(function(e) {
    Cell.getSelectedOrNoOp().toMarkdown();
    e.preventDefault();
  });
  $('#arithmepad-to-code').click(function(e) {
    Cell.getSelectedOrNoOp().toCode();
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
    Cell.getSelectedOrNoOp().moveUp();
    e.preventDefault();
  });
  $('#arithmepad-toolbar-move-cell-down').click(function(e) {
    Cell.getSelectedOrNoOp().moveDown();
    e.preventDefault();
  });
  $('#arithmepad-copy-cell, #arithmepad-toolbar-copy-cell').click(function(e) {
    Cell.getSelectedOrNoOp().copy();
    e.preventDefault();
  });
  $('#arithmepad-cut-cell, #arithmepad-toolbar-cut-cell').click(function(e) {
    Cell.getSelectedOrNoOp().cut();
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
    Cell.getSelectedOrNoOp().remove();
    e.preventDefault();
  });
};