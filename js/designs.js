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

    // Captures initial values from DOM elements
    const initialBrushColor = colorPicker.val();
    const initialBackgroundColor = backgroundColorPicker.val();
    const initialBorderColor = borderColorPicker.val();
    const initialColsNumber = pixelCanvasInputWidth.val();
    const initialRowsNumber = pixelCanvasInputHeight.val();
    const initialCellSize = 20;

    // Sets current values based on initial values
    let colsNumber = initialColsNumber;
    let rowsNumber = initialRowsNumber;
    let cellSize = initialCellSize;
    let brushColor = initialBrushColor;
    let backgroundColor = initialBackgroundColor;
    let borderColor = initialBorderColor;
    let displayBorders = true;
    

    function calculateCellSize(colNumber) {
      const canvasWidth = $('#board').width();
      const cellWidthCalculation = Math.round(canvasWidth/colNumber);
      cellSize = ( cellWidthCalculation < initialCellSize ) ? cellWidthCalculation : initialCellSize;
      console.log(cellSize);
      return cellSize;      
    }
    
    function setCellSize(cellContainer, cellDimension) {
      cellContainer.find('td').css({        
        'width': cellDimension,
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

      for (let row = 1; row <= height; row++) {
        grid += '<tr>';
        for (let col = 1; col <= width; col++) {
          grid += '<td></td>';
        }
        grid += '</tr>';
      }      
      pixelCanvas.html(grid);       
      pixelCanvas.find('td').addClass('bordered_cells').css({
        'border-color': borderColor,
        'background-color': backgroundColor
      });      
      setCellSize(pixelCanvas, calculateCellSize(width));
    }
    
    
    
    $(window).on('resize', function cellSizeChangeHandler() {
      setCellSize(pixelCanvas, calculateCellSize(colsNumber));
    })
    
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
     * @description Changes color of the grid cell
     * @param {object} event
     */
    function paintHandler(event) {
      event.preventDefault();
      $(event.target).css('background-color', brushColor);
    }

    // ----- EVENTS HANDLING -----
    // Sets brush color value on colorPicker change
    colorPicker.on('change', function colorChangeHandler() {
      brushColor = $(this).val();
    });

    // Hides or shows cell borders
    $('#border_switcher').on('click', function cellBorderSwitchHandler() {
      pixelCanvas.find('td').toggleClass('bordered_cells');
      $(this).attr('value', (displayBorders) ? 'Show' : 'Hide');
      displayBorders = !displayBorders;
    });

    // Sets border color on borderColorPicker change
    borderColorPicker.on('change', function borderColorChangeHandler() {
      borderColor = $(this).val();
      pixelCanvas.find('td').css('border-color', borderColor);
    });

    // Changes cell background color on backgroundColorPicker change
    backgroundColorPicker.on('change', function backgroundColorChangeHandler() {
      cellBackgroundChanger(backgroundColor, $(this).val());
      backgroundColor = $(this).val();
    });

    // Clean background color on button click
    $('#background_cleaner').on('click', function cellBackgroundCleanHandler() {
      cellBackgroundChanger(backgroundColor, initialBackgroundColor);
      backgroundColor = initialBackgroundColor;
      backgroundColorPicker[0].value = backgroundColor;
    });

    // Clears paintig
    $('#brush_cleaner').on('click', function cellBrushCleanHandler() {
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
      $('#border_switcher').attr('value', 'Hide');
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
    $('.submit').on('click', function setDimensionsHandler(event) {
      event.preventDefault();     
      colsNumber = pixelCanvasInputWidth.val();
      rowsNumber = pixelCanvasInputHeight.val();

      makeGrid(rowsNumber, colsNumber);
    });

    // Starts painting
    pixelCanvas.on('mousedown', 'td', function startPaintingHandler(event) {
      event.preventDefault();

      // Paints current cell and additionally starts handling painting on mouseover event
      paintHandler(event);
      pixelCanvas.on('mouseover', 'td', paintHandler);

      // Stops painting on mouseup event
      $('body').one('mouseup', function stopPaintingHandler(event) {
        event.preventDefault();
        pixelCanvas.off('mouseover', 'td', paintHandler);
      });
    });
    
    // Creates image to download
    $('#create_image').on('click', function createImageFromTableHandler(event) {
      event.preventDefault();      
      
      // Helper variables (when using HTML inside svg there are problem with cell borders)
      const strokeWidth = 1;
      const correctedCellSize = cellSize - strokeWidth*3;
      const correctedWidth = cellSize*colsNumber+strokeWidth;
      const correctedHeight = cellSize*rowsNumber+strokeWidth;
      
      // Creates a canvas element
      const canvas = document.createElement('canvas');
      canvas.setAttribute("id", "canvas");
      canvas.setAttribute("width", correctedWidth);
      canvas.setAttribute("height", correctedHeight);     
      
      // Copy pixelCanvas element
      const pixelCanvasCopy =  pixelCanvas.clone(true);
      pixelCanvasCopy.css('border-collapse','collapse');
      pixelCanvasCopy.find('td').css({
        'width': correctedCellSize,
        'height': correctedCellSize
      });
      if(displayBorders) {
        pixelCanvasCopy.find('td').css('border', '1px solid '+ borderColor);
      }  
      
      //creates an saves image
      const ctx = canvas.getContext('2d');
      console.log(pixelCanvasCopy.prop('outerHTML'));
      const data = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="'+ correctedWidth +'" height="'+ correctedHeight +'">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml">' +
           pixelCanvasCopy.prop('outerHTML') +
           '</div>' +
           '</foreignObject>' +
           '</svg>';
      const img = new Image();
      const saveCanvas = document.getElementById('save');
      img.onload = function() {        
        ctx.drawImage(img, 0, 0);
        $('#save').attr('href', canvas.toDataURL('image/png'));
        saveCanvas.click();
      }; 
      img.src = data;
    });
    
    makeGrid(rowsNumber, colsNumber);
  })();
});
