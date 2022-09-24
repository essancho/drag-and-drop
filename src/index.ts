// types

type BoxIdType = number;
type XAxisType = number;
type YAxisType = number;

interface ICoordinates {
  columnSpan: number;
  rowSpan: number;
  previousBoxId: string;
}

// Dom Selectors

const boxes: NodeListOf<HTMLDivElement> = document.querySelectorAll(".box");
const inventory: HTMLDivElement = document.querySelector(".inventory");

const coordinates: ICoordinates = {
  columnSpan: 0,
  previousBoxId: "",
  rowSpan: 0,
};

// Helper Functions
const hasClass = (elem: HTMLDivElement, className: string): boolean => {
  return elem.classList.contains(className);
};

// Functions to delete boxes to create space for new item

function calculateRow(boxId: number): number {
  if (boxId > 0 && boxId <= 17) return 1;
  if (boxId > 17 && boxId <= 34) return 2;
  if (boxId > 34 && boxId <= 51) return 3;
  if (boxId > 51 && boxId <= 68) return 4;
  if (boxId > 68 && boxId <= 85) return 5;
  if (boxId > 85 && boxId <= 102) return 6;
}

const handleRowDelete = (
  boxId: BoxIdType,
  row: number,
  x: XAxisType,
  y: YAxisType
): void => {
  const numberOfCellsBefore = boxId - ((row - 1) * 17 + 1);
  let counter = row;
  for (let i = 0; i < y - 1; i++) {
    counter++;
    deleteAdditionalRows(counter, x, numberOfCellsBefore);
  }
};

const deleteAdditionalRows = (
  row: number,
  x: XAxisType,
  cellsBefore: number
): void => {
  const startingId = (row - 1) * 17 + 1 + cellsBefore;
  for (let i = startingId; i < startingId + x; i++) {
    const deleteBox = document.querySelector(`#box-${i}`);
    inventory.removeChild(deleteBox);
  }
};

const deleteBoxes = (id: BoxIdType, x: XAxisType, y: YAxisType): void => {
  const numberOfDeletedBoxes = x - 1;
  for (let i = id + 1; i <= id + numberOfDeletedBoxes; i++) {
    const deleteBox = document.querySelector(`#box-${i}`);
    inventory.removeChild(deleteBox);
  }
  let row = calculateRow(id);
  handleRowDelete(id, row, x, y);
};

// Resetting previously occupied boxes and restore deleted boxes

const resetPreviosBoxes = (previousBox: HTMLDivElement): void => {
  previousBox.classList.remove("occupied");
  previousBox.style.gridColumnEnd = "span 1";
  previousBox.style.gridRowEnd = "span 1";
};

const createNewBox = (id: number): HTMLDivElement => {
  const reMadeBox: HTMLDivElement = document.createElement("div");
  reMadeBox.classList.add("box");
  reMadeBox.setAttribute("id", `box-${id}`);
  reMadeBox.innerHTML = `<span>${id}<span>`;
  return reMadeBox;
};

const setNewNumberOfBoxes = (firstNum: number, secondNum: number): void => {
  let firstNumCheck: number = firstNum;
  for (let i = 0; i < coordinates.rowSpan; i++) {
    for (let i = firstNum; i < secondNum; i++) {
      if (i === firstNumCheck) continue;
      const newBox = createNewBox(i);
      const box = document.querySelector(`#box-${secondNum}`);
      inventory.insertBefore(newBox, box);
    }
    firstNum += 17;
    secondNum += 17;
  }
};

const restoreBoxes = () => {
  const previousBox: HTMLDivElement = document.querySelector(
    `#${coordinates.previousBoxId}`
  );
  let firstNum = parseInt(coordinates.previousBoxId.replace("box-", ""));
  let secondNum = firstNum + coordinates.columnSpan;
  resetPreviosBoxes(previousBox);
  setNewNumberOfBoxes(firstNum, secondNum);
};

const setStylingForElements = (
  box: HTMLDivElement,
  x: XAxisType,
  y: YAxisType
) => {
  box.style.gridColumnEnd = `span ${x}`;
  box.style.gridRowEnd = `span ${y}`;
  box.classList.add("occupied");
};

const createElement = (id: BoxIdType, x: XAxisType, y: YAxisType) => {
  const box: HTMLDivElement = document.querySelector(`#box-${id}`);

  if (!box) {
    alert("Нет такой ячейки");
    return;
  }
  if (box.classList.contains("occupied")) {
    alert("Эта ячейка занята");
    return;
  }
  const newBox: HTMLDivElement = document.createElement("div");
  newBox.classList.add("draggable");
  newBox.classList.add("occupied");
  newBox.setAttribute("draggable", "true");
  deleteBoxes(id, x, y);
  setStylingForElements(box, x, y);
  box.appendChild(newBox);
};

const dragStart = (e: DragEvent) => {
  const inventoryItem = e.target as HTMLDivElement;
  coordinates.columnSpan =
    +inventoryItem.parentElement.style.gridColumnEnd.replace("span", "");
  coordinates.rowSpan = +inventoryItem.parentElement.style.gridRowEnd.replace(
    "span",
    ""
  );

  if (hasClass(inventoryItem, "draggable")) {
    inventoryItem.classList.add("dragging");
    coordinates.previousBoxId = inventoryItem.parentElement.getAttribute("id");
  }

  restoreBoxes();
};

const dragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  if (e.target !== e.currentTarget) {
    const draggedInventoryItem: HTMLDivElement =
      document.querySelector(".dragging");
    const inventorySlot = e.target as HTMLDivElement;

    if (
      inventorySlot.classList.contains("box") &&
      !inventorySlot.classList.contains("occupied")
    ) {
      inventorySlot.appendChild(draggedInventoryItem);
    }
  }
};

const dragLeave = (e: DragEvent) => {
  e.preventDefault();

  const inventorySlot = e.target as HTMLDivElement;
  if (e.target !== e.currentTarget) {
    if (
      !inventorySlot.classList.contains("occupied") &&
      inventorySlot.classList.contains("box")
    ) {
      resetPreviosBoxes(inventorySlot);
    }
  }
};

const dragEnd = (e: DragEvent) => {
  const inventoryItem = e.target as HTMLDivElement;
  if (hasClass(inventoryItem, "draggable")) {
    inventoryItem.classList.remove("dragging");
    setStylingForElements(
      inventoryItem.parentElement as HTMLDivElement,
      coordinates.columnSpan,
      coordinates.rowSpan
    );
    deleteBoxes(
      +inventoryItem.parentElement.getAttribute("id").replace("box-", ""),
      coordinates.columnSpan,
      coordinates.rowSpan
    );
  }
};

// Listeners

inventory.addEventListener("dragstart", dragStart, false);
inventory.addEventListener("dragover", dragOver, false);
inventory.addEventListener("dragleave", dragLeave, true);
inventory.addEventListener("dragend", dragEnd, false);

// For styling while dragging

boxes.forEach((box) => {
  box.addEventListener("dragleave", (e) => {
    e.preventDefault();
    box.classList.remove("dragover");
  });
  box.addEventListener("dragend", (e) => {
    e.preventDefault();
    box.classList.remove("dragover");
  });
});

createElement(12, 3, 1);
createElement(25, 2, 3);
