// iife for encapsulation
(function pixelArtMaker() {
  // Gets DOM elements
  const pixelCanvas = $('#pixel_canvas');
  const colorPicker = $('#color_picker');
  const backgroundColorPicker = $('#background_color_picker');
  const borderColorPicker = $('#border_color_picker');

  // Captures initial values from DOM elements
  const initialBrushColor = colorPicker.val();
  const initialBackgroundColor = backgroundColorPicker.val();
  const initialBorderColor = borderColorPicker.val();

  // Sets current values based on initial values
  let brushColor = initialBrushColor;
  let backgroundColor = initialBackgroundColor;
  let borderColor = initialBorderColor;
  let displayBorders = true;

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
    const height = $('#input_height').val();
    const width = $('#input_width').val();

    makeGrid(height, width);
  });

  // Starts painting
  pixelCanvas.on('mousedown', 'td', function startPaintingHandler(event) {
    event.preventDefault();

    // Paints current cell and additionally starts handling painting on mouseover event
    paintHandler(event);
    pixelCanvas.on('mouseover', 'td', paintHandler);

    // Stops painting on mouseup event
    $('body').one('mouseup', function stopPaintingHandler() {
      event.preventDefault();
      pixelCanvas.off('mouseover', 'td', paintHandler);
    });
  });
})();
