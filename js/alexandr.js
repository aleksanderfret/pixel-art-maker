// Global variables declaration
// By default, start with the color black
const colorPicker = $('#colorPicker');
var selectedColor = '#000000';
// By default, start with a height and width of 0
var gridHeight = 0;
var gridWidth = 0;
const mainCanvas = $('#pixel_canvas');
// Check if user is dragging mouse while clicked
var dragging = false;
// Global variable that will hold the index of the array that stores all the cells that have been changed during one action
var undoActionIndex = 0;
var undoCellIndex = 0;
var undo = [[]];
// Global variables that change the way in which the gallery saving function behaves
const gallery = $('.gallery');
var isGalleryEmpty = true;
// Global variable that holds the canvas of the gallery slot that was clicked
var galleryCanvasStored = '';
// Global variable that holds if the current canvas is saved in the gallery in case of a reconstruction
var continueWithDeletingCurrentCanvas = true;
// Global varaibles that holds the swatches container
const swatches = $('.swatches');
// Global variable that holds the visibility of the textarea necessary for importing
var isTextareaVisible = false;

// Snippet taken from http://wowmotty.blogspot.ro/2017/05/convert-rgba-output-to-hex-color.html
function convertRGBToHex(orig) {
  var a, isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (rgb && rgb[4] || "").trim(),
    hex = rgb ? "#" +
    (rgb[1] | 1 << 8).toString(16).slice(1) +
    (rgb[2] | 1 << 8).toString(16).slice(1) +
    (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
  if (alpha !== "") {
    isPercent = alpha.indexOf("%") > -1;
    a = parseFloat(alpha);
    if (!isPercent && a >= 0 && a <= 1) {
      a = Math.round(255 * a);
    } else if (isPercent && a >= 0 && a <= 100) {
      a = Math.round(255 * a / 100)
    } else {
      a = "";
    }
  }
  if (a) {
    hex += (a | 1 << 8).toString(16).slice(1);
  }
  return hex;
}

function makeGrid() {
  initializeCanvas();
  constructCanvas(mainCanvas, gridHeight, gridWidth);
};

function initializeCanvas () {
  // Delete previous canvas in case function is called multiple times
  $(mainCanvas).children().remove();
  // Reset visual cues for active tool
  $('.tool_icon').removeClass('active');
  // After canvas is created export button becomes available
  $('#export_button').removeAttr('disabled');
  // After canvas is created, remove canvas space header
  $('#canvas_header').remove();
  // Visual cues for paintbrush active
  $('.tool_icon[alt="Paint brush"]').toggleClass('active');
  // Initialize cursor when canvas was created
  $('.container').css('cursor', 'url(assets/icons/paintbrush.png) 0 32, auto');
}

// Function for multiple calling of a tool once activated
function useTool(cell, color, toolName) {
  let isCellAlreadyInArray = false;
  for (let index = 0; index < undo[undoActionIndex].length; index++) {
    if (undo[undoActionIndex][index].undoCell === cell) {
      isCellAlreadyInArray = true;
      break;
    }
  }
  if (!(isCellAlreadyInArray)) {
    let undoObject = {
      undoCell: '',
      cellPreviousColor: '',
      cellCurrentColor: ''
    };
    undoObject.undoCell = cell;
    undoObject.cellPreviousColor = $(cell).css('background-color');
    undoObject.cellCurrentColor = color;
    undo[undoActionIndex][undoCellIndex] = undoObject;
    undoCellIndex ++;
  };
  switch (toolName) {
    case 'Paint brush': colorCell(cell, color); break;
    case 'Eraser tool': colorCell(cell, ''); break;
    case 'Fill tool': fillCells(cell); break;
  };
};

// Function for the coloring of a clicked cell
function colorCell (cell, color) {
  $(cell).css('background-color', color);
  // $(cell).css('border', color);
};

// Function for filling a random area (BFS)
function fillCells (cell) {
  let color = $(cell).css('background-color');
  let area = [];
  let temporaryArray = [];
  temporaryArray.push(cell);
  area = findArea(temporaryArray, [], color);
  // Find the area delimited by a all the cells that have a different color compared to the initial clicked cell
  function findArea (cellsArray, cellsCheckedArray, color) {
    if (cellsArray.length === 0)
      return cellsCheckedArray;
    else {
      let currentCell = cellsArray[0];
      cellsArray.shift();
      if (!(cellsCheckedArray.includes(currentCell))) {
        cellsCheckedArray.push(currentCell);
        let neighbourCellsArray = [];
        neighbourCellsArray = findNeighbours(currentCell).slice();
        neighbourCellsArray.forEach(function(neighbourCell) {
          if ($(neighbourCell).css('background-color') === color) {
            cellsArray.push(neighbourCell);
          }
        });
      }
      return findArea(cellsArray, cellsCheckedArray, color);
    };
  };
  // Find all the neighbours that are 1 cell away in clockwise order starting from top
  function findNeighbours (cell) {
    let currentCellIndex = $(cell).attr('data-position');
    let neighbourCellsArray = [];
    // Up neighbour
    neighbourCellsArray[0] = $(cell).parent('tr').prev('tr').children('td').eq(currentCellIndex)[0];
    // Right neighbour
    neighbourCellsArray[1] = $(cell).next('td')[0];
    // Down neighbour
    neighbourCellsArray[2] = $(cell).parent('tr').next('tr').children('td').eq(currentCellIndex)[0];
    // Left neighbour
    neighbourCellsArray[3] = $(cell).prev('td')[0];
    return neighbourCellsArray;
  };
  // Lastly, color all the cells in the array of found cells that match
  area.forEach(function(cell) {
    useTool(cell, selectedColor, 'Paint brush');
  });
};

function undoActionIndexBehaviour() {
  undoCellIndex = 0;
  if (undoActionIndex < 5) {
    undoActionIndex ++;
    undo.push([]);
  } else {
    undo.shift();
    undo.push([]);
  }
}

function shiftRepresentation(container) {
  let containerSlots = Array.from($(container).children());
  let index = containerSlots.length - 1;
  for (let index = containerSlots.length - 1; index >= 0; index --) {
    $(containerSlots[index]).children().remove();
    if (index > 0) {
      $(containerSlots[index]).append($(containerSlots[index-1]).contents());
    }
  }
};

function reconstructCanvas() {
  if (continueWithDeletingCurrentCanvas === false) {
    $('.not_saved').css('visibility', 'visible');
  } else {
    let string = convertCanvasToString(galleryCanvasStored);
    initializeCanvas();
    parseStringToCanvas(string, mainCanvas);
  }
};

function convertCanvasToString (canvas) {
  let height = $(canvas).children('tr').length;
  let width = $(canvas).children('tr').first().children('td').length;
  let exportString = width + '|' + height + '|';
  for (let rowIndex = 0; rowIndex < height; rowIndex ++) {
    let currentRow = $(canvas).find('tr').eq(rowIndex);
    for (let columnIndex = 0; columnIndex < width; columnIndex ++) {
      let currentCell = '';
      let currentColor = '';
      currentCell = $(currentRow).find('td').eq(columnIndex);
      currentColor = $(currentCell).css('background-color');
      exportString += currentColor + '|';
    }
  }
  return exportString;
}

function constructCanvas (table, height, width) {
  for(let row = 0; row < height; row ++) {
      $(table).append('<tr data-position="' + row + '"></tr>');
    }
    for(let column = 0; column < width; column++) {
      $(table).children('tr').append('<td data-position="' + column + '"></td>');
    }
}

// table holds where the canvas should be reconstructed
function parseStringToCanvas (stringToParse, table) {
  let attributesArray = stringToParse.split('|');
  let height = attributesArray[1];
  let width = attributesArray[0];
  let numberOfCells = attributesArray.length - 3;
  if (numberOfCells != (width * height)) {
    alert('Import string is not correct.');
    return true;
  }
  constructCanvas(table, height, width);
  let readIndex = 2;
  for (let i = 0; i < height; i ++) {
    let currentRow = $(table).find('tr').eq(i);
    for (let j = 0; j < width; j ++) {
      let currentCell = $(currentRow).find('td').eq(j);
      let currentColor = attributesArray[readIndex];
      if (currentColor !== 'rgba(0, 0, 0, 0)') {
        colorCell(currentCell, currentColor);
      }
      readIndex ++;
    }
  }
}

$('button').click(function (event) {
  event.preventDefault();
  $('.popup').css('visibility', 'hidden');
});

// Select color event listener
$(colorPicker).change(function(event) {
  selectedColor = event.target.value;
  $('#colorString').text(selectedColor.toUpperCase());
  $('#colorString').css('background-color', selectedColor);
  // Once changed, add color to swatches
  let currentSwatchSlot = $('.swatch_slot')[0];
  shiftRepresentation(swatches);
  $(currentSwatchSlot).append('<div class="swatch_color"></div>');
  $(currentSwatchSlot).children('.swatch_color').css('background-color', selectedColor);
});

// When size is submitted by the user, call makeGrid()
$('#submit_button').click(function(event) {
  event.preventDefault();
  gridHeight = $('#input_height').val();
  gridWidth = $('#input_width').val();
  // Check if dimensions are not too big
  if (gridHeight > 45 || gridWidth > 45)  {
    // Delete previous canvas
    $('#canvas_header').remove();
    // Delete previous canvas
    $(mainCanvas).children().remove();
    $('.canvas_space').append('<p id="canvas_header">Requested canvas is too big. Please choose a dimension less than 45.</p>');
    // Stop function from executing the makeGrid call
    return true;
  }
  $('#get_height').text(gridHeight);
  $('#get_width').text(gridWidth);
  makeGrid();
});

$('.swatch_slot').on('click', function(event) {
  let swatchColor = $(this).children('.swatch_color').css('background-color');
  let convertedSwatchColor = convertRGBToHex(swatchColor);
  selectedColor = convertedSwatchColor;
  $(colorPicker).val(selectedColor);
  $('#colorString').text(selectedColor.toUpperCase());
  $('#colorString').css('background-color', selectedColor);
});

// Disable default cursor dragging behaviour for canvas
$(mainCanvas).on('dragstart', function(event) {
  event.preventDefault();
});

// Event listener for clicking on a cell
$(mainCanvas).on('mousedown', 'td', function(event) {
  // Mouse was clicked, make dragging possible
  dragging = true;
  useTool(event.target, selectedColor, $('.active').attr('alt'));
  if (isGalleryEmpty === false) {
    continueWithDeletingCurrentCanvas = false;
  }
});

// Event listener for releasing mouse
$(mainCanvas).on('mouseup', 'td', function(event) {
  // Mouse is no longer clicked, dragging is disabled once again
  dragging = false;
  // Undo will keep a history of 5 actions
  undoActionIndexBehaviour();
});

// Event listener for when mouse enters a cell AND dragging is allowed
$(mainCanvas).on('mouseenter', 'td', function(event) {
  let selectedCell = event.target;
  // If dragging is available then color cell
  if (dragging){
    useTool(event.target, selectedColor, $('.active').attr('alt'));
  }
  // Listen for updating current cell position
  let rowIndex = $(selectedCell).parent().attr('data-position');
  let columnIndex = $(selectedCell).attr('data-position');
  $('.cell_position').html(rowIndex + ' x ' + columnIndex);
});

// If cursor leaves table situation handling
$(mainCanvas).on('mouseleave', function() {
  // If cursor leaves table, reset cell position
  $('.cell_position').html('0 x 0');
  // If dragging and painting and cursor leaves canvas, modify undoActionIndex
  if (dragging) {
    undoActionIndexBehaviour();
  };
  // If cursor leaves table, dragging is disabled (solved bug)
  dragging = false;
});

// Event listener for switching to eraser tool
$('.tool_icon[alt="Eraser tool"]').on('click', function(event) {
  $('.tool_icon').removeClass('active');
  $(event.target).addClass('active');
  $('.container').css('cursor', 'url(assets/icons/eraser.png) 0 32, auto');
});

// Event listener for switching to paintbrush
$('.tool_icon[alt="Paint brush"]').on('click', function(event) {
  $('.tool_icon').removeClass('active');
  $(event.target).addClass('active');
  $('.container').css('cursor', 'url(assets/icons/paintbrush.png) 0 32, auto');
});

// Event listener for switching to fill tool
$('.tool_icon[alt="Fill tool"]').on('click', function(event) {
  $('.tool_icon').removeClass('active');
  $(event.target).addClass('active');
  $('.container').css('cursor', 'url(assets/icons/filltool.png) 0 32, auto');
});

// Event listener for triggering Fill canvas
$('.tool_icon[alt="Fill canvas"]').on('click', function(event) {
  let allCells = Array.from($('#pixel_canvas').find('td'));
  allCells.forEach(function(cell) {
    useTool(cell, selectedColor, 'Paint brush');
  });
  undoActionIndexBehaviour();
});

// Event listener for triggering Clear canvas
$('.tool_icon[alt="Clear canvas"]').on('click', function(event) {
  let allCells = Array.from($(mainCanvas).find('td'));
  allCells.forEach(function(cell) {
    useTool(cell, selectedColor, 'Eraser tool')
  });
  undoActionIndexBehaviour();
});

// Event listener for triggering an undo
$('.tool_icon[alt="Undo"]').on('click', function(event) {
  if (undoActionIndex > 0) {
    let cellsToBeChanged = undo[undoActionIndex - 1];
    cellsToBeChanged.forEach(function(object, index, array) {
      $(object.undoCell).css('background-color', object.cellPreviousColor);
    });
    cellsToBeChanged.splice(0, cellsToBeChanged.length);
    undo.pop();
    undoActionIndex --;
  }
});

// Event listener for saving a canvas in the gallery
$('.tool_icon[alt="Gallery"]').on('click', function() {
  continueWithDeletingCurrentCanvas = true;
  let currentGallerySlot = $('.save_slot')[0];
  if (isGalleryEmpty === false) {
    shiftRepresentation(gallery);
  } else {
    isGalleryEmpty = false;
    $(currentGallerySlot).children().remove();
  }
  $(currentGallerySlot).append('<table> </table>');
  let currentGallerySlotCanvas = $(currentGallerySlot).children('table');
  let string = convertCanvasToString(mainCanvas);
  parseStringToCanvas(string, currentGallerySlotCanvas);
});

$('.save_slot').on('click', function(event) {
    galleryCanvasStored = $(this).children('table');
    if (Array.from($(galleryCanvasStored).children()).length !== 0) {
      reconstructCanvas();
    }
});

$('.yes').on('click', function(event) {
  continueWithDeletingCurrentCanvas = true;
  reconstructCanvas();
});

// Export canvas by generating a string
$('#export_button').on('click', function(event) {
  event.preventDefault();
  $('#save_functionality').children('textarea').remove();
  $('#save_functionality').append('<textarea name="textarea" rows="5" cols="50" readonly="true"></textarea>');
  let string = '';
  string = convertCanvasToString(mainCanvas);
  $('#save_functionality').children('textarea').html(string);
});

// Import canvas by parsing a string
$('#import_button').on('click', function(event) {
  event.preventDefault();
  if (isTextareaVisible === false) {
    $('#save_functionality').children('textarea').remove();
    $('#save_functionality').append('<textarea name="textarea" rows="5" cols="50">Copy import string here and press the Import button again.</textarea>');
    isTextareaVisible = true;
  } else {
    let importString = $('#save_functionality').children('textarea').val();
    initializeCanvas();
    parseStringToCanvas(importString, mainCanvas);
    isTextareaVisible = false;
  }
});

$('#save_functionality').on('click', 'textarea', function(event) {
  $(event.target).select();
});

// getTxt = function (){
//   $('.text_code').css('visibility', 'visible');
//   $.ajax({
//     url:'text/html.txt',
//     success: function (data){
//       let dataHTML = '';
//       let target = $('.text_html');
//       dataHTML = data.replace(/</g,"&lt;").replace(/>/g,"&gt;").toString();
//       dataHTML = $.trim(dataHTML);
//       target.html(dataHTML);
//     }
//   });
//   $.ajax({
//     url:'text/css.txt',
//     success: function (data){
//       $('.text_css').html(data);
//     }
//   });
//   $.ajax({
//     url:'text/js.txt',
//     success: function (data){
//       $('.text_js').html(data);
//     }
//   });
// }

// $('.buttoncode').click(getTxt);
