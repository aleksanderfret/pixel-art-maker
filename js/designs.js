$(document).ready(pixelArtMaker);

function pixelArtMaker() {
  // Gets DOM elements
  const pixelCanvas = $('#pixel-canvas');
  const pixelCanvasInputHeight = $('#input-height');
  const pixelCanvasInputWidth = $('#input-width');
  const wrapper = $('#artboard-wrapper');
  const artboard = $('#artboard');
  const undo = $('#undo');
  const redo = $('#redo');
  const brushTool = $('#brush');
  const eraseTool = $('#erase');
  const eyedropperTool = $('#eyedropper');
  const appLayout = $('#general, .toolbar, #artboard-wrapper');
  const mainColorPicker = $('#color-picker');
  const colorborders = $('#color-borders');
  const bgColor = $('#bg-color');
  const bdColor = $('#bd-color');
  const brColor = $('#br-color');

  // Captures initial values from DOM elements
  const initialBrushColor = mainColorPicker.val();
  const initialBackgroundColor = '#ffffff';
  const initialBorderColor = '#d3d3d3';
  const initialColsNumber = pixelCanvasInputWidth.val();
  const initialRowsNumber = pixelCanvasInputHeight.val();
  const initialCellDimension = 20;
  const initialColor = mainColorPicker.val();

  // Sets current values based on initial values
  let colsNumber = initialColsNumber;
  let rowsNumber = initialRowsNumber;
  let cellDimension = initialCellDimension;
  let brushColor = initialColor;
  let backgroundColor = initialBackgroundColor;
  let borderColor = initialBorderColor;
  let mainColor = initialColor;
  let displayBorders = true;

  // Variables to redo and undo features
  const numberOfUndos = 20;
  const modyfiedCells = [];
  const actionsUndoHistory = [];
  const actionsRedoHistory = [];
  let redoEnabled = false;
  let undoEnabled = false;

  // Variables
  let dispalyLabels = false;
  let originalCellColor;
  let currentTool = '';
  const toolToggles = {
    brush: toggleBrushTool,
    erase: toggleEraseTool,
    eyedropper: toggleEyedropperTool,
    fill: toggleFillTool
  }

  // Draws initial grid
  makeGrid(rowsNumber, colsNumber);



  //////////////////// NEW CANVAS FEATURE ////////////////////
  // Resets canvas to initial state
  $('#new-canvas').on('click', function resetPainter() {
    backgroundColor = initialBackgroundColor;
    brushColor = initialBrushColor;
    borderColor = initialBorderColor;
    mainColor = initialColor;
    displayBorders = true;
    colsNumber = initialColsNumber;
    rowsNumber = initialRowsNumber;

    mainColorPicker[0].value = mainColor;
    pixelCanvasInputHeight.val(rowsNumber);
    pixelCanvasInputWidth.val(colsNumber);

    makeGrid(rowsNumber, colsNumber);
    resetActionsHistory();
    bgColor.css('background-color', backgroundColor);
    bdColor.css('background-color', borderColor);
    brColor.css('background-color', brushColor);
  });



  //////////////////// PRINT FEATURE ////////////////////
  // Open print dialog
  $('#print').on('click', function printPainting(event){
    event.preventDefault();
    createTemporaryImage('print');
  });



  //////////////////// SAVE FEATURE ////////////////////
  // Saves painting as png
  $('#save').on('click', function saveImageHandler(event) {
    event.preventDefault();
    createTemporaryImage('save');
  });



  //////////////////// SAVE AND PRINT COMMON FEATURE ////////////////////
  /**
   * @description Prepares image with svg data for canvas (needed for printing and saving)
   * @param {string} feature - name of feature that requests the image; available values: 'print' and 'save
   */
  function createTemporaryImage(feature) {
    const strokeWidth = displayBorders ? 1 : 0;
    // Helper variables (when using HTML inside svg there are strange problems with cell borders)
    const correctedCellDimensionWidth = cellDimension - strokeWidth*3;
    const correctedCellDimensionHeight  = displayBorders ? cellDimension - strokeWidth*3 : cellDimension - 2;
    const correctedCanvasWidth = cellDimension*colsNumber+strokeWidth;
    const correctedCanvasHeight = cellDimension*rowsNumber+strokeWidth;

    const canvas = createTempCanvas(correctedCanvasWidth, correctedCanvasHeight);
    const pixelCanvasCopy = createPixelCanvasCopy(correctedCellDimensionWidth, correctedCellDimensionHeight);
    const svgData = prepareSvgData(pixelCanvasCopy.prop('outerHTML'), correctedCanvasWidth, correctedCanvasHeight);
    const canvasContext = canvas.getContext('2d');
    const saveLink = document.getElementById('save-link');

    const img = new Image();
    img.onload = function() {
      canvasContext.drawImage(img, 0, 0);
      if (feature === 'print') {
        $('#forPrint').html(img);
        window.print();
        $('body').one('click', function (){
          $('#forPrint').html('');
        });
      } else if (feature === 'save') {
        saveLink.setAttribute('href', canvas.toDataURL('image/png'));
        saveLink.click();
      }
    };

    img.src = svgData;
  }

  /**
   * @description Prepares svg data with canvas (needed for saving as image)
   * @param {string} canvasHTML
   * @param {number} width
   * @param {number} height
   * @return {string}
   */
  function prepareSvgData(canvasHTML, width, height) {
    const data = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="'+ width +'" height="'+ height +'">' +
         '<foreignObject width="100%" height="100%">' +
         '<div xmlns="http://www.w3.org/1999/xhtml">' +
         canvasHTML +
         '</div>' +
         '</foreignObject>' +
         '</svg>';
    return data;
  }

  /**
   * @description Creates pixelCanvas copy with inline styles
   * @param {number} cellWidth
   * @param {number} cellHeight
   * @return {object}
   */
  function createPixelCanvasCopy(cellWidth, cellHeight) {
    const pixelCanvasCopy =  pixelCanvas.clone(true);
    pixelCanvasCopy.css('border-collapse','collapse');
    pixelCanvasCopy.find('td').css({
      'width': cellWidth,
      'height': cellHeight
    });
    if(displayBorders) {
      pixelCanvasCopy.find('td').css('border', '1px solid '+ borderColor);
    }
    return pixelCanvasCopy;
  }

  /**
   * @description Creates temporary canvas needed for saving as image
   * @param {number} width
   * @param {number} height
   * @return {object}
   */
  function createTempCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    return canvas;
  }



  //////////////////// HELP FEATURES ////////////////////
  // Toggle toolbar labels
  $('#help').on('click', function toggleToolbarLabels(){
    if(!dispalyLabels) {
      $(this).addClass('active_tool ');
      appLabels.addClass('show_labels');
      appLayout.addClass('labelsShowed');
    } else {
      $(this).removeClass('active_tool ');
      appLabels.removeClass('show_labels');
      appLayout.removeClass('labelsShowed');
    }
    dispalyLabels = !dispalyLabels;
  });



  //////////////////// UNDO REDO FEATURES ////////////////////
  // Undo last painting action
  undo.on('click', function undoLastActionHandler() {
    const lastAction = actionsUndoHistory.pop();
    for (let i = 0; i < lastAction.changedCells.length; i++) {
      const tdSelector = '#' + lastAction.changedCells[i].id;
      const cell = pixelCanvas.find(tdSelector);
      const newBackgroundColor = lastAction.changedCells[i].oldBackground;
      cellPainter(cell[0], newBackgroundColor);
    }
    if (lastAction.action === 'background') {
      backgroundColor = lastAction.changedCells[0].oldBackground;
    }
    actionsRedoHistory.push(lastAction);
    setRedo(true);
    if (actionsUndoHistory.length == 0) {
      setUndo(false);
    }
  });

  // Redo last undo actions
  redo.on('click', function redoLastActionHandler() {
    const lastAction = actionsRedoHistory.pop();
    for (let i = 0; i < lastAction.changedCells.length; i++) {
      const tdSelector = '#' + lastAction.changedCells[i].id;
      const cell = pixelCanvas.find(tdSelector);
      const newBackgroundColor = lastAction.changedCells[i].newBackground;
      cellPainter(cell[0], newBackgroundColor);
    }
    if (lastAction.action === 'background') {
      backgroundColor = lastAction.changedCells[0].newBackground;
    }
    actionsUndoHistory.push(lastAction);
    setUndo(true);
    if (actionsRedoHistory.length == 0) {
      setRedo(false);
    }
  });

  /**
   * @description Sets redoEnabled variable and toogles disable attribiute on redo button
   * @param {boolean} value
   */
  function setRedo(value) {
    if (value !== redoEnabled) {
      redoEnabled = value;
      redo.prop('disabled', !redoEnabled);
    }
  }

  /**
   * @description Sets undoEnabled variable and toogles disable attribiute on undo button
   * @param {boolean} value
   */
  function setUndo(value) {
    if (value !== undoEnabled) {
      undoEnabled = value;
      undo.prop('disabled', !undoEnabled);
    }
  }

  /**
   * @description Checks if cell was registered in this actions
   * @param {boolean} cellId
   * @return {boolean}
   */
  function isNotRegistered(cellId) {
    let registerCell = true;
    if (modyfiedCells.length > 0) {
      modyfiedCells.find(function findIfCellIsRegistered(element) {
        if (element.id === cellId) {
          registerCell = false;
        }
      });
    }
    return registerCell
  }

  /**
   * @description Saves id and background color of modyfied cells
   */
  function startRegisterCell(coloredCell, newColor) {
    const currentCell = $(coloredCell);
    const currentCellId = currentCell.attr('id');
    const backgroundToRegister = currentCell.css('background-color');

    // Clear redo history
    actionsRedoHistory.length = 0;
    setRedo(false);
    if (isNotRegistered(currentCellId)) {
      const cellData = {
        id: currentCell.attr('id'),
        oldBackground: backgroundToRegister,
        newBackground: newColor
      };

      modyfiedCells.push(cellData);
    }
  }

  /**
   * @description Saves as an object modyfied cells and curret brush color
   * @param {string} currentAction - checks kind of modyfication
   */
  function registerAction(currentAction) {
    const action = {
      changedCells: modyfiedCells.slice(0),
      action: currentAction
    };
    if(actionsUndoHistory.length >= numberOfUndos) {
      actionsUndoHistory.shift();
    }
    actionsUndoHistory.push(action);
    modyfiedCells.length = 0;
    setUndo(true);
  }

  /**
   * @description Resets undo and redo features
   */
  function resetActionsHistory() {
    actionsUndoHistory.length = 0;
    actionsRedoHistory.length = 0;
    setUndo(false);
    setRedo(false);
  }

  // Registers modyfying cell on register event
  pixelCanvas.on('register', function(event, newColor){
    startRegisterCell(event.target, newColor);
  });

  // Saves firs action on actionStop event
  pixelCanvas.on('actionStop', function(event, action){
    if (modyfiedCells.length>0) {
      registerAction(action);
    }
  });



  //////////////////// DRAW GRID FEATURES ////////////////////
  /**
   * @description Calculates cell dimension to fit square grid to screen
   * @param {number} colNumber - number of columns
   * @return {number}
   */
  function calculateCellDimension(colNumber) {
    const boardWidth = wrapper.width();
    const cellWidthCalculated = Math.floor(boardWidth/colNumber);
    cellDimension = Math.min(cellWidthCalculated, initialCellDimension);
    return cellDimension;
  }

  /**
   * @description Sets size of pixel-art's square cells
   * @param {object} cellContainer
   * @param {number} cellDimension
   */
  function setCellSize(cellContainer, cellDimension) {
    cellContainer.find('td').css({
      'width': cellDimension,
      'height': cellDimension
    });
   cellContainer.find('tr').css({
      'height': cellDimension
    });
  }

  /**
   * @description Draws grid
   * @param {number} height - number of rows
   * @param {number} width - number of columns
   */
  function makeGrid(height, width) {
    let grid = '';
    let cellId = '';
    for (let row = 1; row <= height; row++) {
      grid += '<tr>';
      cellId = 'y'+row;
      for (let col = 1; col <= width; col++) {
        cellId = cellId + 'x'+col;
        grid += '<td id="'+cellId+'" data-y="'+row+'" data-x="'+col+'"></td>';
        cellId = 'y'+row;
      }
      grid += '</tr>';
    }
    pixelCanvas.html(grid);
    pixelCanvas.find('td').addClass('bordered-cells').css({
      'border-color': borderColor,
      'background-color': backgroundColor
    });

    artboard.mCustomScrollbar('destroy');
    turnOnScrollbars();
    centerVerticallyOrScrollbarY();
    //setCellSize(pixelCanvas, calculateCellDimension(width));
  }

  // Ensures that height and width will match the min and max attributes
  $('#input-width, #input-height').on('blur', function dimensionValidatorHandler() {
    const min = Number($(this).attr('min'));
    const max = Number($(this).attr('max'));

    if (Number($(this).val()) < min) {
      $(this).val(min);
    }
    if (Number($(this).val()) > max) {
      $(this).val(max);
    }
  });

  // Creates the grid based on entered values, when grid size is submitted
  $('#draw-grid').on('click', function setDimensionsHandler(event) {
    event.preventDefault();
    colsNumber = pixelCanvasInputWidth.val();
    rowsNumber = pixelCanvasInputHeight.val();
    resetActionsHistory();
    makeGrid(rowsNumber, colsNumber);
  });

  /**
   * @description Centers canvas vertically
   */
  function centerVerticallyOrScrollbarY() {
    const artboardHeight = artboard.height();
    const canvasHeight = pixelCanvas.height();
    //debugger;
    if (artboardHeight > canvasHeight ) {
      $('.mCSB_container').addClass('vertical-aligner');
    } else {
      $('.mCSB_container').removeClass('vertical-aligner');
    }
  }

  // Aligns canvas vertically on window resize event
  $(window).on('resize', function() {
    centerVerticallyOrScrollbarY();
  });

  // Aligns canvas vertically on canvas resize event
  pixelCanvas.on('resize', function() {
    centerVerticallyOrScrollbarY();
  });

  // Sets cell size when window size changed
  // $(window).on('resize', function cellSizeChangeHandler() {
  //   setCellSize(pixelCanvas, calculateCellDimension(colsNumber));
  // })



  //////////////////// CELL BORDERS FEATURES ////////////////////
  // Sets border color on button color borders
  colorborders.on('click', function borderColorChangeHandler() {
    borderColor = mainColorPicker.val();
    pixelCanvas.find('td').css('border-color', borderColor);
    bdColor.css('background-color', borderColor);
  });

   // Hides or shows cell borders
   $('#switch-borders').on('click', function cellBorderSwitchHandler() {
    pixelCanvas.find('td').toggleClass('bordered-cells');
    if (displayBorders) {
      $(this).attr('title', 'Show borders.');
      $(this).find('img').attr('src', 'img/icons/borders_on.png');
    } else {
      $(this).attr('title', 'Hide borders.');
      $(this).find('img').attr('src', 'img/icons/borders_off.png');
    }
    displayBorders = !displayBorders;
  });



  //////////////////// BACKGROUND COLOR FEATURES ////////////////////
  // Changes cell background color on fill button click
  $('#color-background').on('click', function canvasBbackgroundColorChangeHandler() {
    cellBackgroundChanger(backgroundColor, mainColorPicker.val());
  });

  // Clean background color on button click
  $('#clean-background').on('click', function cellBackgroundCleanHandler() {
    cellBackgroundChanger(backgroundColor, initialBackgroundColor);
    mainColor = initialBackgroundColor;
  });

  /**
   * @description Changes color of cells from one to another
   * @param {string} oldColor
   * @param {string} newColor
   */
  function cellBackgroundChanger(oldColor, newColor){
    pixelCanvas.trigger('actionStart');
    let counter = 0;
    pixelCanvas.find('td').each(function filterCellsWithOldBackground(index, el) {
      if (rgb2hex($(el).css('background-color')) === oldColor) {
        $(el).trigger('register',[newColor]);
        cellPainter(el, newColor);
        counter++;
      }
    });
    if (counter > 0) {
      backgroundColor = newColor;
      bgColor.css('background-color', backgroundColor);
    }

    pixelCanvas.trigger('actionStop',['background']);
  }



  //////////////////// TOOLS GENERAL AND COMMON FEATURES ////////////////////
  // Sets main color value on colorPicker change
  mainColorPicker.on('change', function colorChangeHandler() {
    mainColor = $(this).val();
  });

  // Sets swatch color as a main color
  $('.swatch').on('click', function setSwatchColorAsMainColor() {
    const newColor = rgb2hex($(this).css('background-color'));
    mainColorPicker.val(newColor);
    mainColor = newColor;
  })

  // Runs tools: brush, erase, fill or eyedropper
  $('.tool').on('click', function onToolClickHandler(event) {
    // Stop current tool
    if (currentTool) {
      wrapper.removeClass(currentTool + '-cursor');
      $('#'+currentTool).removeClass('active-tool');
      toolToggles[currentTool](false);
    }

    // Sets and runs requested tool
    currentTool = $(event.currentTarget).attr('id');
    if (currentTool) {
      if (toolToggles[currentTool] !== undefined) {
        wrapper.addClass(currentTool + '-cursor');
        $(this).addClass('active-tool');
        toolToggles[currentTool](true);
      } else {
        currentTool = '';
      }
    }
  });

  /**
   * @description paints cell
   * @param {string} cellToPaint - cell
   * @param {string} color - new color
   */
  function cellPainter(cellToPaint, color) {
    $(cellToPaint).css('background-color', color);
  }

  /**
   * @description Changes color of the grid cell
   * @param {object} event
   */
  function paintHandler(event) {
    event.preventDefault();
    const newColor = (currentTool === 'erase') ? backgroundColor : mainColor;
    $(event.target).trigger('register', [newColor]);
    cellPainter(event.target, newColor);
  }

  // Starts painting
  function startPaintingHandler(event) {
    if (currentTool === 'brush') {
      brColor.css('background-color', mainColor);
    }
    event.preventDefault();
    $(event.target).trigger('actionStart');

    // Paints current cell and additionally starts handling painting on mouseover event
    paintHandler(event);
    pixelCanvas.on('mouseover', 'td', paintHandler);

    // Stops painting on mouseup event
    $('body').one('mouseup mouseleave', function stopPaintingHandler(event) {
      event.preventDefault();
      pixelCanvas.off('mouseover', 'td', paintHandler);
      $(event.target).trigger('actionStop',['brush']);
    });
  }



  //////////////////// FILL FEATURE ////////////////////
  /**
   * @description Toggles fill tool
   * @param {boolean} toolState
   */
  function toggleFillTool(toolState) {
    const toggleMethod = (toolState) ? 'on' : 'off';
    pixelCanvas[toggleMethod]('click', 'td', fillHandler);
  }

  /**
   * @description fills the same cells in the neighborhood
   * @param {boolean} toolState
   */
  function fillHandler(event) {
    event.preventDefault();
    $(event.target).trigger('actionStart');
    const newColor = mainColor;
    const cells = findCells(event.target);
    cells.forEach(function fillSameCells(cell, index) {
      $(cell).trigger('register', [newColor]);
      cellPainter(cell, newColor);
    });
    $(event.target).trigger('actionStop');
  }

  /**
   * @description finds the same cells in the neighborhood
   * @param {string} cell
   * @return {array}
   */
   function findCells(cell) {
    const currentCell = $(cell);
    const currentBackgroundColor = currentCell.css('background-color');
    const checkedCells = [];
    const finalArea = [];

    function findNewSameColoredCell(currentCell) {
      const lastAddedCells = [];
      const neighbors = findNeighbors(currentCell);
      neighbors.forEach(function addSameNeighbors(neighbor, index) {
        if (!(checkedCells.includes(neighbor[0]))) {
          if (neighbor.css('background-color') === currentBackgroundColor) {
            lastAddedCells.push(neighbor);
            finalArea.push(neighbor[0]);
          }
          checkedCells.push(neighbor[0]);
        }
        lastAddedCells.forEach(function findSameForLastAddedCells(lastAddedCell, index){
          findNewSameColoredCell(lastAddedCell);
        });
      });
    }

    finalArea.push(cell);
    checkedCells.push(cell);
    findNewSameColoredCell(currentCell);

    return finalArea;
  }

  /**
   * @description finds immediate cell neighbors
   * @param {string} currentCell
   * @return {array}
   * Source: inspired by https://alexandruvoica.github.io/
   */
  function findNeighbors(currentCell) {
    const xCoord = currentCell.attr('data-x');
    const yCoord = currentCell.attr('data-y');
    const neighbors = [];
    neighbors[0] = currentCell.parent('tr').prev('tr').children('td').eq(xCoord-1);
    neighbors[1] = currentCell.next('td');
    neighbors[2] = currentCell.parent('tr').next('tr').children('td').eq(xCoord-1);
    neighbors[3] = currentCell.prev('td');
    return neighbors;
  }



  //////////////////// BRUSH FEATURE ////////////////////
  // Clears painting
  $('#paint-cleaner').on('click', function cellBrushCleanHandler() {
    pixelCanvas.trigger('actionStart');
    pixelCanvas.find('td').each(function paintingCleaner(index, el) {
      if (rgb2hex($(el).css('background-color')) !== backgroundColor) {
        $(el).trigger('register',[backgroundColor]);
        cellPainter(el, backgroundColor);
      }
    });
    pixelCanvas.trigger('actionStop',['brush']);
  });

  /**
   * @description Toggles brush tool
   * @param {boolean} toolState
   */
  function toggleBrushTool(toolState) {
    const toggleMethod = (toolState) ? 'on' : 'off';
    pixelCanvas[toggleMethod]('mousedown', 'td', startPaintingHandler);
    pixelCanvas[toggleMethod]('mouseenter mouseleave', 'td', brushPreviewHandler);
    pixelCanvas[toggleMethod]('actionStart actionStop', 'td', toggleBrushPreviewHandler);
  }

  /**
   * @description Toggles brush preview
   */
  function toggleBrushPreviewHandler(event) {
    if (event.type === 'actionStart') {
      // we have to restore true (original) background color of the cell,
      // because in this moment it's changed by preview feature
      $(this).css({
        'background-color': originalCellColor
      });
      pixelCanvas.off('mouseenter mouseleave', 'td', brushPreviewHandler);
    } else if (event.type === 'actionStop') {
      // we have to manually set originalCellColor, because until now
      // preview feature was off and this variable is outdated
      originalCellColor = mainColor;
      pixelCanvas.on('mouseenter mouseleave', 'td', brushPreviewHandler);
    }
  }

  /**
   * @description Turns on brush preview
   * @param {object} event
   */
  function brushPreviewHandler(event) {
    let color = originalCellColor;
    if(event.type === 'mouseenter') {
      originalCellColor = $(this).css('background-color');
      color = mainColor;
    }
    $(this).css({
      'background-color': color
    });
  }



  //////////////////// ERASE FEATURE ////////////////////
  /**
   * @description Toggles erase tool
   * @param {boolean} toolState
   */
  function toggleEraseTool(toolState) {
    const toggleMethod = (toolState) ? 'on' : 'off';
    pixelCanvas[toggleMethod]('mousedown', 'td', startPaintingHandler);
    pixelCanvas[toggleMethod]('mouseenter mouseleave', 'td', erasePreviewHandler);
    pixelCanvas[toggleMethod]('actionStart actionStop', 'td', toggleErasePreviewHandler);
  }

  /**
   * @description Toggles erase preview
   */
  function toggleErasePreviewHandler(event) {
    if (event.type === 'actionStart') {
      pixelCanvas.off('mouseenter mouseleave', 'td', erasePreviewHandler);
      $(this).css({
        'opacity': 1
      });
    } else if (event.type === 'actionStop') {
      pixelCanvas.on('mouseenter mouseleave', 'td', erasePreviewHandler);
    }
  }

  /**
   * @description Turns on erase preview
   * @param {object} event
   */
  function erasePreviewHandler(event){
    const currentColor = rgb2hex($(event.target).css('background-color'));
    if (currentColor !== backgroundColor) {
      const opacity = (event.type === 'mouseenter') ? 0.5 : 1;
      $(this).css({
        'opacity': opacity
      });
    }
  }



  //////////////////// EYEDROPPER FEATURE ////////////////////
  /**
   * @description Toggles eyedropper tool
   * @param {object} toolState
   */
  function toggleEyedropperTool(toolState) {
    const toggleMethod = (toolState) ? 'on' : 'off';
    pixelCanvas[toggleMethod]('click', 'td', getColorHandler);
  }

  /**
   * @description Turns on brush preview
   * @param {object} event
   */
  function getColorHandler(event) {
    const gottenColor = $(event.target).css('background-color');
    mainColorPicker.val(rgb2hex(gottenColor));
    mainColor = gottenColor;
  }



  //////////////////// STATUS BAR FEATURES ////////////////////
  // Displays hoovered cell position
  pixelCanvas.on('mouseover', 'td', function getCellPosition() {
    const xCoord = $(this).attr('data-x');
    const yCoord = $(this).attr('data-y');
    $('#coordinates').html('X: ' + xCoord + ' Y: ' + yCoord);
  });



  //////////////////// HELPERS ////////////////////
  /**
   * @description Converts rgb color to hex color
   * @param {string} rgb - rgb color
   * @return {string}
   * Source: taken from https://jsfiddle.net/Mottie/xcqpF/1/light/
   */
  function rgb2hex(rgb) {
    const rgbValues = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgbValues.length === 4) ? '#' +
      ('0' + parseInt(rgbValues[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgbValues[2], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgbValues[3], 10).toString(16)).slice(-2) : '';
  }

  /**
   * @description Turns on custom scrollbars
   * Source: jQuery custom content scroller from http://manos.malihu.gr/jquery-custom-content-scroller/
   */
  function turnOnScrollbars(){
    artboard.mCustomScrollbar({
      axis:'xy',
      theme: 'light-3',
      scrollbarPosition: 'outside'
    });
  }
}
// TODO vertical align
// TODO fix fill recursive overstacking
// TODO wand (the same tool)
// TODO wand (all the same tool)
// TODO colors history
// TODO change table, tr, td to divs
// TODO RWD