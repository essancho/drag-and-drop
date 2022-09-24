// types
// Dom Selectors
var boxes = document.querySelectorAll(".box");
var inventory = document.querySelector(".inventory");
var coordinates = {
    columnSpan: 0,
    previousBoxId: "",
    rowSpan: 0
};
// Helper Functions
var hasClass = function (elem, className) {
    return elem.classList.contains(className);
};
// Functions to delete boxes to create space for new item
function calculateRow(boxId) {
    if (boxId > 0 && boxId <= 17)
        return 1;
    if (boxId > 17 && boxId <= 34)
        return 2;
    if (boxId > 34 && boxId <= 51)
        return 3;
    if (boxId > 51 && boxId <= 68)
        return 4;
    if (boxId > 68 && boxId <= 85)
        return 5;
    if (boxId > 85 && boxId <= 102)
        return 6;
}
var handleRowDelete = function (boxId, row, x, y) {
    var numberOfCellsBefore = boxId - ((row - 1) * 17 + 1);
    var counter = row;
    for (var i = 0; i < y - 1; i++) {
        counter++;
        deleteAdditionalRows(counter, x, numberOfCellsBefore);
    }
};
var deleteAdditionalRows = function (row, x, cellsBefore) {
    var startingId = (row - 1) * 17 + 1 + cellsBefore;
    for (var i = startingId; i < startingId + x; i++) {
        var deleteBox = document.querySelector("#box-".concat(i));
        inventory.removeChild(deleteBox);
    }
};
var deleteBoxes = function (id, x, y) {
    var numberOfDeletedBoxes = x - 1;
    for (var i = id + 1; i <= id + numberOfDeletedBoxes; i++) {
        var deleteBox = document.querySelector("#box-".concat(i));
        inventory.removeChild(deleteBox);
    }
    var row = calculateRow(id);
    handleRowDelete(id, row, x, y);
};
// Resetting previously occupied boxes and restore deleted boxes
var resetPreviosBoxes = function (previousBox) {
    previousBox.classList.remove("occupied");
    previousBox.style.gridColumnEnd = "span 1";
    previousBox.style.gridRowEnd = "span 1";
};
var createNewBox = function (id) {
    var reMadeBox = document.createElement("div");
    reMadeBox.classList.add("box");
    reMadeBox.setAttribute("id", "box-".concat(id));
    reMadeBox.innerHTML = "<span>".concat(id, "<span>");
    return reMadeBox;
};
var setNewNumberOfBoxes = function (firstNum, secondNum) {
    var firstNumCheck = firstNum;
    for (var i = 0; i < coordinates.rowSpan; i++) {
        for (var i_1 = firstNum; i_1 < secondNum; i_1++) {
            if (i_1 === firstNumCheck)
                continue;
            var newBox = createNewBox(i_1);
            var box = document.querySelector("#box-".concat(secondNum));
            inventory.insertBefore(newBox, box);
        }
        firstNum += 17;
        secondNum += 17;
    }
};
var restoreBoxes = function () {
    var previousBox = document.querySelector("#".concat(coordinates.previousBoxId));
    var firstNum = parseInt(coordinates.previousBoxId.replace("box-", ""));
    var secondNum = firstNum + coordinates.columnSpan;
    resetPreviosBoxes(previousBox);
    setNewNumberOfBoxes(firstNum, secondNum);
};
var setStylingForElements = function (box, x, y) {
    box.style.gridColumnEnd = "span ".concat(x);
    box.style.gridRowEnd = "span ".concat(y);
    box.classList.add("occupied");
};
var createElement = function (id, x, y) {
    var box = document.querySelector("#box-".concat(id));
    if (!box) {
        alert("Нет такой ячейки");
        return;
    }
    if (box.classList.contains("occupied")) {
        alert("Эта ячейка занята");
        return;
    }
    var newBox = document.createElement("div");
    newBox.classList.add("draggable");
    newBox.classList.add("occupied");
    newBox.setAttribute("draggable", "true");
    deleteBoxes(id, x, y);
    setStylingForElements(box, x, y);
    box.appendChild(newBox);
};
var dragStart = function (e) {
    var inventoryItem = e.target;
    coordinates.columnSpan =
        +inventoryItem.parentElement.style.gridColumnEnd.replace("span", "");
    coordinates.rowSpan = +inventoryItem.parentElement.style.gridRowEnd.replace("span", "");
    if (hasClass(inventoryItem, "draggable")) {
        inventoryItem.classList.add("dragging");
        coordinates.previousBoxId = inventoryItem.parentElement.getAttribute("id");
    }
    restoreBoxes();
};
var dragOver = function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.target !== e.currentTarget) {
        var draggedInventoryItem = document.querySelector(".dragging");
        var inventorySlot = e.target;
        if (inventorySlot.classList.contains("box") &&
            !inventorySlot.classList.contains("occupied")) {
            inventorySlot.appendChild(draggedInventoryItem);
        }
    }
};
var dragLeave = function (e) {
    e.preventDefault();
    var inventorySlot = e.target;
    if (e.target !== e.currentTarget) {
        if (!inventorySlot.classList.contains("occupied") &&
            inventorySlot.classList.contains("box")) {
            resetPreviosBoxes(inventorySlot);
        }
    }
};
var dragEnd = function (e) {
    var inventoryItem = e.target;
    if (hasClass(inventoryItem, "draggable")) {
        inventoryItem.classList.remove("dragging");
        setStylingForElements(inventoryItem.parentElement, coordinates.columnSpan, coordinates.rowSpan);
        deleteBoxes(+inventoryItem.parentElement.getAttribute("id").replace("box-", ""), coordinates.columnSpan, coordinates.rowSpan);
    }
};
// Listeners
inventory.addEventListener("dragstart", dragStart, false);
inventory.addEventListener("dragover", dragOver, false);
inventory.addEventListener("dragleave", dragLeave, true);
inventory.addEventListener("dragend", dragEnd, false);
// For styling while dragging
boxes.forEach(function (box) {
    box.addEventListener("dragleave", function (e) {
        e.preventDefault();
        box.classList.remove("dragover");
    });
    box.addEventListener("dragend", function (e) {
        e.preventDefault();
        box.classList.remove("dragover");
    });
});
createElement(12, 3, 1);
createElement(25, 2, 3);
