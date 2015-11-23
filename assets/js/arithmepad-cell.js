var arithmepad = (function(ace, $) {

  var classes = {
    fullWidth: 'col-md-12',
    halfWidth: 'col-md-6',
    input: 'arithmepad-input',
    output: 'arithmepad-output',
    plot: 'arithmepad-plot',
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
  
  div.cell = function() {
    return $('<div>').addClass(classes.cell).addClass('row');
  };
  
  // Cell object creation
  
  var Cell = function(domNode) {
    if (typeof domNode === 'undefined') {
      throw 'A DOM node is required for a cell';
    }
    this.$node = $(domNode);
    if (this.$node.length != 1) {
      throw 'Cannot create cell: domNode has a length of ' + this.$node.length;
    }
  };
  
  Cell.fromEditor = function(editor) {
    return new Cell($(editor.container).parent());
  };
  
  Cell.getSelected = function() {
    sel = $('.' + classes.commandSelection + ', .' + classes.editSelection);
    if (sel.length > 0) {
      return new Cell(sel[0]);
    }
  };
  
  // Cell deletion
  
  Cell.prototype.remove = function() {
    var nextCell = this.getNext();
    if (typeof nextCell !== 'undefined') {
      nextCell.selectInCommandMode();
      nextCell.scrollDownTo();
    } else {
      var prevCell = this.getPrevious();
      if (typeof prevCell !== 'undefined') {
        prevCell.selectInCommandMode();
        prevCell.scrollUpTo();
      }
    }
    this.$node.remove();
  }
  
  // Cell components (input/output)
  
  Cell.prototype.getInput = function() {
    return this.$node.find('.' + classes.input);
  };
  
  Cell.prototype.getEditor = function() {
    var sel = this.$node.find('.' + classes.input);
    if (sel.length > 0) {
      return ace.edit(sel[0]);
    }
  };
  
  // Cell editor options
  
  Cell.editorOptions = {
    mode: "ace/mode/javascript",
    tabSize: 2,
    //theme: theme,
    showGutter: false,
    maxLines: 10000,
    autoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: false
  };
  
  Cell.prototype.getAceOptions = function() {
    var options = _.clone(Cell.editorOptions);
    if (this.$node.hasClass(classes.markdown)) {
      options.mode = 'ace/mode/markdown';
    }
    return options;
  };
  
  // Cell navigation (previous/next, scrolling)
  
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
  
  Cell.prototype.scrollUpTo = function() {
    this.$node[0].scrollIntoView(true);
    window.scrollBy(0, -90);
  };
  
  Cell.prototype.scrollDownTo = function() {
    this.$node[0].scrollIntoView(false);
    window.scrollBy(0, 75);
  };
  
  // Cell movement
  
  Cell.prototype.moveUp = function() {
    var prevCell = this.getPrevious();
    if (typeof prevCell !== 'undefined') {
      this.$node.remove();
      this.$node.insertBefore(prevCell.$node);
      this.scrollUpTo();
    }
  };
  
  Cell.prototype.moveDown = function() {
    var nextCell = this.getNext();
    if (typeof nextCell !== 'undefined') {
      this.$node.remove();
      this.$node.insertAfter(nextCell.$node);
      this.scrollDownTo();
    }
  };
  
  // copy / cut / paste
  
  Cell.prototype.copy = function() {
    Cell.clipboard = this.getJSValue();
  };
  
  Cell.prototype.cut = function() {
    this.copy();
    this.remove();
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
  
  // Cell selection
  
  Cell.emptyEditAndCommandSelection = function() {
    $('.' + classes.editSelection).removeClass(classes.editSelection);
    $('.' + classes.commandSelection).removeClass(classes.commandSelection);
  };
  
  Cell.prototype.selectInCommandMode = function() {
    Cell.emptyEditAndCommandSelection();
    this.$node.addClass(classes.commandSelection);
  };
  
  // Cell set content
  
  Cell.prototype.setResult = function(result, setHtml) {
    var output = this.$node.find('.' + classes.output);
    if (setHtml) {
      output.html(result);
    } else {
      output.text(result);
    }
  };
  
  // Cell saving and loading
  
  Cell.prototype.getJSValue = function() {
    var isMarkdownCell = this.getEditor().getOption('mode') == 'ace/mode/markdown';
    var code = [];
    code.push('// !arithmepad-cell');
    var value = this.getEditor().getValue();
    if (isMarkdownCell) {
      value = _(value.split('\n')).map(function(line) {
        return '// ' + line;
      }).join('\n');
    }
    code.push(value);
    return code.join('\n');
  };
  
  return {
    Cell: Cell,
    __: {
      classes: classes,
      div: div
    }
  };
})(ace, jQuery);