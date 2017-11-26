// iife for encapsulation
(function pixelArtMaker() {
  // Gets DOM elements
  const pixelCanvas = $('#pixel_canvas');
  const colorPicker = $('#color_picker');
  const backgroundColorPicker = $('#background_color_picker');
  const borderColorPicker = $('#border_color_picker');

  // Sets initial value
  let color = colorPicker.val();
  let backgroundColor = backgroundColorPicker.val();
  let borderColor = borderColorPicker.val();

  // Sets color value on colorPicker change
  colorPicker.on('change', function colorChangeHandler() {
    color = $(this).val();
  });

  /**
   * @description Creates grid
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
   * @description Changes color of the grid cell
   * @param {object} event
   */
  function paintHandler(event) {
    event.preventDefault();
    $(event.target).css('background-color', color);
  }

  /**
   * @description Converts rgb color to hex color
   * @param {string} rgb - rgb color
   * @return {string}
   */
  function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
  }

  $('#border_switcher').on('click', function cellBorderSwitchHandler() {
    pixelCanvas.find('td').toggleClass('bordered_cells');
});

  borderColorPicker.on('change', function borderColorChangeHandler() {
    borderColor = $(this).val();
    pixelCanvas.find('td').css('border-color', borderColor);
  });

  backgroundColorPicker.on('change', function backgroundVolorChangeHandler() {
    const oldBackgroundColor = backgroundColor;
    backgroundColor = $(this).val();
    pixelCanvas.find('td').each(function filterCellsWithOldBackground(index, el) {
      if (rgb2hex($(el).css('background-color')) === oldBackgroundColor) {
        $(el).css('background-color', backgroundColor);
      }
    });
  });

  $('#background_cleaner').on('click', function cellBackgroundCleanHandler() {
    pixelCanvas.find('td').css('background-color', backgroundColor);
  });

  $('#reset_painter').on('click', function resetPainter() {
    backgroundColor = '#ffffff';
    color = '#000000';
    borderColor = '#000000';
    colorPicker[0].value = color;
    backgroundColorPicker[0].value = backgroundColor;
    borderColorPicker[0].value = borderColor;
    pixelCanvas.find('td').css({
      'background-color': backgroundColor,
      'color': color,
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

  // When grid size is submitted, creates the grid based on entered values by calling makeGrid()
  $('.submit').on('click', function setDimensionsHandler(event) {
    event.preventDefault();
    const height = $('#input_height').val();
    const width = $('#input_width').val();

    makeGrid(height, width);
  });

  // Starts painting
  pixelCanvas.on('mousedown', 'td', function startPaintingHandler(event) {
    event.preventDefault();

    // Paints current cell and additionally handles painting on mouseover event
    paintHandler(event);
    pixelCanvas.on('mouseover', 'td', paintHandler);

    // Stops painting on mouseup event
    $('body').one('mouseup', function() {
      event.preventDefault();
      pixelCanvas.off('mouseover', 'td', paintHandler);
    });
  });
})();
