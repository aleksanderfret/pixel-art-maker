$( document ).ready(function() {
  // iife for encapsulation
  (function pixelArtMaker() {
    // Gets DOM elements
    const pixelCanvas = $('#pixel_canvas');
    const colorPicker = $('#color_picker');
    const backgroundColorPicker = $('#background_color_picker');
    const borderColorPicker = $('#border_color_picker');
    const pixelCanvasInputHeight = $('#input_height');
    const pixelCanvasInputWidth = $('#input_width');
    const undo = $('#undo');
    const redo = $('#redo');

    // Captures initial values from DOM elements
    const initialBrushColor = colorPicker.val();
    const initialBackgroundColor = backgroundColorPicker.val();
    const initialBorderColor = borderColorPicker.val();
    const initialColsNumber = pixelCanvasInputWidth.val();
    const initialRowsNumber = pixelCanvasInputHeight.val();
    const initialCellDimension = 20;

    // Sets current values based on initial values
    let colsNumber = initialColsNumber;
    let rowsNumber = initialRowsNumber;
    let cellDimension = initialCellDimension;
    let brushColor = initialBrushColor;
    let backgroundColor = initialBackgroundColor;
    let borderColor = initialBorderColor;
    let displayBorders = true;

    // Variables to redo and undo features
    const numberOfUndos = 20;
    const modyfiedCells = [];
    const actionsUndoHistory = [];
    const actionsRedoHistory = [];
    let redoEnabled = false;
    let undoEnabled = false;

    let currentTool = '';
    let previousColor;

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
     * @param {boolean} cellClasses
     * @return {boolean}
     */
    function isNotRegistered(cellClasses) {
      let registerCell = true;
      if (modyfiedCells.length > 0) {
        modyfiedCells.find(function findIfCellIsRegistered(element) {
          if (element.class === cellClasses) {
            registerCell = false;
          }
        });
      }
      return registerCell
    }

    /**
     * @description Saves classes and background color of modyfied cells
     */
    function registerModyfyingCells(event) {
      const currentCell = $(event.target);
      const currentCellClass = currentCell.attr('class');
      const currentBackgroundColor = currentCell.css('background-color');
      const backgroundToRegister = (rgb2hex(currentBackgroundColor) === backgroundColor) ? null : currentBackgroundColor;

      if (isNotRegistered(currentCellClass)) {
        const cellData = {
          class: currentCell.attr('class'),
          oldBackground: backgroundToRegister
        };
        modyfiedCells.push(cellData);
      }
    }

    /**
     * @description Saves as an object modyfied cells and curret brush color
     */
    function registerAction() {
      const action = {
        changedCells: modyfiedCells.slice(0),
        newBackgroundColor: brushColor
      };

      if(actionsUndoHistory.length >= numberOfUndos) {
        actionsUndoHistory.shift();
      }
      actionsUndoHistory.push(action);

      modyfiedCells.length = 0
      setUndo(true);
    }

    /**
     * @description Calculates cell dimension to fit square grid to screen
     * @param {number} colNumber - number of columns
     * @return {number}
     */
    function calculateCellDimension(colNumber) {
      const boardWidth = $('#board').width();
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
      let cellClass = '';
      for (let row = 1; row <= height; row++) {
        grid += '<tr>';
        cellClass = 'y'+row;
        for (let col = 1; col <= width; col++) {
          cellClass = cellClass + ' x'+col;
          grid += '<td class="'+cellClass+'"></td>';
          cellClass = 'y'+row;
        }
        grid += '</tr>';
      }
      pixelCanvas.html(grid);
      pixelCanvas.find('td').addClass('bordered_cells').css({
        'border-color': borderColor,
        'background-color': backgroundColor
      });
      setCellSize(pixelCanvas, calculateCellDimension(width));
    }

    /**
     * @description Converts rgb color to hex color
     * @param {string} rgb - rgb color
     * @return {string}
     */
    function rgb2hex(rgb) {
      const rgbValues = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgb && rgbValues.length === 4) ? '#' +
        ('0' + parseInt(rgbValues[1], 10).toString(16)).slice(-2) +
        ('0' + parseInt(rgbValues[2], 10).toString(16)).slice(-2) +
        ('0' + parseInt(rgbValues[3], 10).toString(16)).slice(-2) : '';
    }

    /**
     * @description Changes color of cells from one to another
     * @param {string} oldColor
     * @param {string} newColor
     */
    function cellBackgroundChanger(oldColor, newColor) {
      pixelCanvas.find('td').each(function filterCellsWithOldBackground(index, el) {
        if (rgb2hex($(el).css('background-color')) === oldColor) {
          $(el).css('background-color', newColor);
        }
      });
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

    // ----- EVENTS HANDLING -----
    // Sets cell size when window size changed
    $(window).on('resize', function cellSizeChangeHandler() {
      setCellSize(pixelCanvas, calculateCellDimension(colsNumber));
    })

    // Sets brush color value on colorPicker change
    colorPicker.on('change', function colorChangeHandler() {
      brushColor = $(this).val();
    });

    // Hides or shows cell borders
    $('#borders_switcher').on('click', function cellBorderSwitchHandler() {
      pixelCanvas.find('td').toggleClass('bordered_cells');
      $(this).attr('title', (displayBorders) ? 'Show borders.' : 'Hide borders.');
      $(this).find('img').attr('src', (displayBorders) ? 'img/borders_on.png' : 'img/borders_off.png');
      displayBorders = !displayBorders;
    });

    // Sets border color on borderColorPicker change
    borderColorPicker.on('change', function borderColorChangeHandler() {
      borderColor = $(this).val();
      pixelCanvas.find('td').css('border-color', borderColor);
    });

    // Changes cell background color on fill button click
    $('#fill').on('click', function canvasBbackgroundColorChangeHandler() {
      cellBackgroundChanger(backgroundColor, backgroundColorPicker.val());
      backgroundColor = backgroundColorPicker.val();
    });

    // Clean background color on button click
    $('#background_cleaner').on('click', function cellBackgroundCleanHandler() {
      cellBackgroundChanger(backgroundColor, initialBackgroundColor);
      backgroundColor = initialBackgroundColor;
      backgroundColorPicker[0].value = backgroundColor;
    });

    // Clears painting
    $('#clear_painting').on('click', function cellBrushCleanHandler() {
      pixelCanvas.find('td').css('background-color', backgroundColor);
    });

    // Resets canvas to initial state except of grid size
    $('#clear_canvas').on('click', function resetPainter() {
      backgroundColor = initialBackgroundColor;
      brushColor = initialBrushColor;
      borderColor = initialBorderColor;
      displayBorders = true;

      colorPicker[0].value = brushColor;
      backgroundColorPicker[0].value = backgroundColor;
      borderColorPicker[0].value = borderColor;
      pixelCanvas.find('td').addClass('bordered_cells');
      $('#borders_switcher').attr('value', 'Hide');
      pixelCanvas.find('td').css({
        'background-color': backgroundColor,
        'border-color': borderColor
      });
    });

    // Ensures that height and width will match the min and max attributes
    $('#input_width, #input_height').on('blur', function dimensionValidatorHandler() {
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
    $('#draw_grid').on('click', function setDimensionsHandler(event) {
      event.preventDefault();
      colsNumber = pixelCanvasInputWidth.val();
      rowsNumber = pixelCanvasInputHeight.val();

      makeGrid(rowsNumber, colsNumber);
    });










    $('#erase, #brush, #eyedropper').on('click', function onToolClickHandler(event) {
      // Resets current tool
      // TODO icon styles reset
      // TODO reset current tool function
      // pixelCanvas.find('td').off( "mouseenter mouseleave" );

      // Runs proper tool
      currentTool = $(event.currentTarget).attr('id');
      switch (currentTool) {
        case 'erase':
          runEraseTool();
          break;
        case 'eyedropper':
          runEyedropperTool();
          break;
        case 'brush':
          runBrushTool();
          break;
        default:
          null;
      }
    });

    function runEraseTool() {
      pixelCanvas.find('td').hover(function toggleOpacityHandler(event){
        const currentColor = rgb2hex($(event.target).css('background-color'));
        if (currentColor !== backgroundColor) {
          const opacity = (event.type === 'mouseenter') ? 0.5 : 1;
          $(this).css({
            'opacity': opacity
          });
        }
      });
      pixelCanvas.find('td').on('cellColorChanged', function resetOpacityHandler(event){
        $(this).css({
          'opacity': 1
        });
      });
    }

    function runBrushTool() {
      pixelCanvas.find('td').hover(function(event) {
        previousColor = $(this).css('background-color');
        //TODO
        // if(event.type === 'mouseenter') {
        //   previousColor = $(this).css('background-color');
        // }
        // const color = (event.type === 'mouseenter') ? brushColor : previousColor;
        // $(this).css({
        //   'background-color': brushColor
        // });
      });
    }
    function runEyedropperTool() {
      //TODO
    }










    /**
     * @description Changes color of the grid cell
     * @param {object} event
     */
    function paintHandler(event) {
      event.preventDefault();
      registerModyfyingCells(event);
      const newColor = (currentTool === 'erase') ? backgroundColor : brushColor;
      $(event.target).css('background-color', newColor);
      $(event.target).trigger('cellColorChanged');
    }

    // Starts painting
    pixelCanvas.on('mousedown', 'td', function startPaintingHandler(event) {
      event.preventDefault();

      actionsRedoHistory.length = 0;
      setRedo(false);

      // Paints current cell and additionally starts handling painting on mouseover event
      paintHandler(event);
      pixelCanvas.on('mouseover', 'td', paintHandler);

      // Stops painting on mouseup event
      $('body').one('mouseup', function stopPaintingHandler(event) {
        event.preventDefault();
        pixelCanvas.off('mouseover', 'td', paintHandler);
        registerAction();
      });
    });

    // Undo last painting action
    undo.on('click', function undoLastActionHandler() {
      const lastAction = actionsUndoHistory.pop();
      for (let i = 0; i < lastAction.changedCells.length; i++) {
        const tdSelector = 'td.' + lastAction.changedCells[i].class.replace(/\s/g, '.');
        const cell = pixelCanvas.find(tdSelector);
        const registerBackgroundColor = lastAction.changedCells[i].oldBackground;
        const newBackgroundColor = registerBackgroundColor || backgroundColor;

        cell.css({
          'background-color': newBackgroundColor
        });
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
        const tdSelector = 'td.' + lastAction.changedCells[i].class.replace(/\s/g, '.');
        const cell = pixelCanvas.find(tdSelector);
        cell.css({
          'background-color': lastAction.newBackgroundColor
        });
      }
      actionsUndoHistory.push(lastAction);
      setUndo(true);
      if (actionsRedoHistory.length == 0) {
        setRedo(false);
      }
    });

    // Saves painting as png
    $('#save_image').on('click', function saveImageHandler(event) {
      event.preventDefault();

      // Helper variables (when using HTML inside svg there are strange problems with cell borders)
      const strokeWidth = displayBorders ? 1 : 0;
      const correctedCellDimensionWidth = cellDimension - strokeWidth*3;
      const correctedCellDimensionHeight  = displayBorders ? cellDimension - strokeWidth*3 : cellDimension - 2;
      const correctedCanvasWidth = cellDimension*colsNumber+strokeWidth;
      const correctedCanvasHeight = cellDimension*rowsNumber+strokeWidth;

      const canvas = createTempCanvas(correctedCanvasWidth, correctedCanvasHeight);
      const pixelCanvasCopy = createPixelCanvasCopy(correctedCellDimensionWidth, correctedCellDimensionHeight);
      const svgData = prepareSvgData(pixelCanvasCopy.prop('outerHTML'), correctedCanvasWidth, correctedCanvasHeight);
      const canvasContext = canvas.getContext('2d');
      const saveLink = document.getElementById('save');

      const img = new Image();
      img.onload = function() {
        canvasContext.drawImage(img, 0, 0);
        saveLink.setAttribute('href', canvas.toDataURL('image/png'));
        saveLink.click();
      };
      img.src = svgData;
    });

    // Draws initial grid
    makeGrid(rowsNumber, colsNumber);
  })();
});
