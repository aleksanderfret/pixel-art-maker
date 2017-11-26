// iife for encapsulation
(function pixelArtMaker() {
  const colorPicker = $('#colorPicker');
  const pixelCanvas = $('#pixel_canvas');

  // Sets initial color value
  let color = colorPicker.val();

  // Sets color value on colorPicker change (to avoid checking color in every paintHandler call).
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
    pixelCanvas.find('td').addClass('borderedCells');
  }

  $('#borderSwitcher').on('click', function cellBorderSwitchHandler() {
    pixelCanvas.find('td').toggleClass('borderedCells');
});

  $('#backgroundCleaner').on('click', function cellBackgroundCleanHandler() {
    pixelCanvas.find('td').css('background-color', '#fff');
  });

  /**
   * @description Changes color of the grid cell
   * @param {object} event
   */
  function paintHandler(event) {
    event.preventDefault();
    $(event.target).css('background-color', color);
  }

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

  // When grid size is submitted, creates the grid based on entered values
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
