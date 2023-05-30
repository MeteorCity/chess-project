// initialize the board
let gameBoard = new Array(8);
for (let i = 0; i < 8; i++) {
   gameBoard[i] = new Array(8);
}

let squareList = document.querySelectorAll(".square");
let squareListList = [...squareList];
let pieceList = document.querySelectorAll(".square .pieces");
let boardList = [];

// initialize a variable to keep track of who's turn it is, even = white, odd = black
let turnCounter = 0

// add each square and piece to a list where each element is an object with two attributes, square and piece
// if no piece is on the square then piece is null otherwise the corresponding piece is put on square
for (let i = 0; i < 64; i++) {
   if (i < 16) {
       boardList.push({square: squareList[i], piece: pieceList[i]});
   } else if (i < 48) {
       boardList.push({square: squareList[i], piece: null});
   } else {
       boardList.push({square: squareList[i], piece: pieceList[i - 32]});
   }
}

// add each element to the board
boardList.forEach((value, index) => addToBoard(value, index));

function addToBoard(element, idx) {
   const row_num = Math.floor(idx/8);
   const col_num = idx - (row_num * 8);

   gameBoard[row_num][col_num] = element;
}

function isPiece(element) {
   return element.piece != null;
}

// checks if a square is movable to by checking if no piece or a capturable piece is on the square
// element1 represents the current clicked element, element2 represents the square being checked
function isMovable(element1, element2) {
   // if the square being moved to is not a piece and if when moved to it doesn't cause check
   if (!isPiece(element2) && checkFuture(element1, element2)) {
       return true;
   }

   // if square moved to is piece
   if (isPiece(element2)) {
       // if pieces are different colors and if when moved to it doesn't cause check
       if (element1.piece.id[0] != element2.piece.id[0] && checkFuture(element1, element2)) {
           return true
       }
   }

   // in all other cases return false
   return false;
}

// helper function to check whether after a piece moves the king is in check.
// returns false if after piece moves it is check. returns true if after piece moves it isn't check.
// element1 represents the current clicked element, element2 represents the square being checked
function checkFuture(element1, element2) {
    let element1Piece = element1.piece;
    let element2Piece = element2.piece;
    const moveToRowNum = getPieceNotation(element2).row;
    const moveToColNum = getPieceNotation(element2).col;
    const moveAwayRowNum = getPieceNotation(element1).row;
    const moveAwayColNum = getPieceNotation(element1).col;
    const turn = getPlayerTurn();
    let enPassantCaptured = null;
    
    // make the move on the 2d array board
    gameBoard[moveToRowNum][moveToColNum].piece = element1.piece;
    gameBoard[moveAwayRowNum][moveAwayColNum].piece = null;

    if (element2 === enPassant) {
        if (turn === "w") {
            enPassantCaptured = gameBoard[moveToRowNum + 1][moveToColNum].piece
            gameBoard[moveToRowNum + 1][moveToColNum].piece = null;
        } else {
            enPassantCaptured = gameBoard[moveToRowNum - 1][moveToColNum].piece
            gameBoard[moveToRowNum - 1][moveToColNum].piece = null;
        }
    }

    // update the attacked squares for the new board
    updateAttackedSquares();

    if (inCheck()) {
        // move pieces back to original positions
        gameBoard[moveToRowNum][moveToColNum].piece = element2Piece;
        gameBoard[moveAwayRowNum][moveAwayColNum].piece = element1Piece;

        if (element2 === enPassant) {
            if (turn === "w") {
                gameBoard[moveToRowNum + 1][moveToColNum].piece = enPassantCaptured;
            } else {
                gameBoard[moveToRowNum - 1][moveToColNum].piece = enPassantCaptured;
            }
        }

        // bring the attackedSquares list back to what it was originally
        updateAttackedSquares();

        // if the king was in check after moving the piece return false
        return false;
    }

    gameBoard[moveToRowNum][moveToColNum].piece = element2Piece;
    gameBoard[moveAwayRowNum][moveAwayColNum].piece = element1Piece;

    if (element2 === enPassant) {
        if (turn === "w") {
            gameBoard[moveToRowNum + 1][moveToColNum].piece = enPassantCaptured;
        } else {
            gameBoard[moveToRowNum - 1][moveToColNum].piece = enPassantCaptured;
        }
    }

    updateAttackedSquares();

    return true;
}

// gets the board notation based on the given element
function getPieceNotation(element) {
   for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
           if (gameBoard[row][col] == element) {
               const notation = { row, col };
               return notation;
           }
       }
   }
}

// gets the square of the piece based on the given piece ID
function getPieceFromID(elemID) {
   for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
           // checks if the piece is null, if so the conditional instantly evaluates to false
           // if the piece is not null, check if its ID is equal to the given piece ID
           if (gameBoard[row][col].piece && gameBoard[row][col].piece.id == elemID) {
               return gameBoard[row][col];
           }
       }
   }
}

// gets whose turn it is based on turnCounter
function getPlayerTurn() {
   if (turnCounter % 2 == 0) {
       return "w"
   } else {
       return "b"
   }
}

function getOppositePlayerTurn() {
    const turn = getPlayerTurn();
    if (turn === "w") {
      return "b";
    } else if (turn === "b") {
      return "w";
    }
}

// highlight the square clicked on if the square has a piece on it
boardList.forEach((value) =>
value.square.addEventListener("click", () => highlightPiece(value)));

// variable to check whether checkmate or stalemate has been achieved
let gameOver = false;

// variable to keep track of a currently selected piece
let selectedPiece1 = null;

// variable to check whether the same piece was clicked twice in a row
// in this case instead of removing highlight onMouseDown, remove onMouseUp
let removeOnMouseUp = false;

function highlightPiece(element) {
    if (!gameOver) {
       // if the current selected element equals the clicked element
       if (selectedPiece1 === element) {
            // remove the selected-piece class
            removeOnMouseUp = true;
            selectedPiece1 = null;
        }

       // if a current selected element exists and the clicked element is a piece
       // which has the same color as the currently selected element
       else if (selectedPiece1 && isPiece(element) && getPlayerTurn() === element.piece.id[0]) {
            selectedPiece1.square.classList.remove("selected-piece");
            element.square.classList.add("selected-piece");
            selectedPiece1 = element;
        }
      
       // if a current selected element exists and the clicked element is a piece which can be captured
       else if (selectedPiece1 && isPiece(element) && movableSquaresList.includes(element)) {
            selectedPiece1.square.classList.remove("selected-piece");
            selectedPiece1 = null;
        }

       // if a current selected element exists and the clicked element is a piece
       // which can't be captured and has the opposite color as the currently selected element
       else if (selectedPiece1 && isPiece(element) && getPlayerTurn() != element.piece.id[0]) {
            selectedPiece1.square.classList.remove("selected-piece");
            selectedPiece1 = null;
        }
      
       // if there is no currently selected element and the clicked element is a piece of the correct turn
       else if (isPiece(element) && getPlayerTurn() === element.piece.id[0]) {
            element.square.classList.add("selected-piece");
            selectedPiece1 = element;
        }

       // if there is no currently selected element and the clicked element is a piece of the incorrect turn
       else if (isPiece(element) && getPlayerTurn() != element.piece.id[0]) {
            return;
        }

       // if a currently selected element exists yet the clicked element has no piece on it
       else if (selectedPiece1) {
            selectedPiece1.square.classList.remove("selected-piece");
            selectedPiece1 = null;
        }
    }
}

// show the movable squares of the piece clicked on
boardList.forEach((value, index) =>
value.square.addEventListener("click", () => highlightMovableSquares(value, index)));

// initialize a list to keep track of the legal moves for the piece
let movableSquaresList = []

// variable to keep track of a currently selected piece
let selectedPiece2 = null;

// removes movable-square class from every element in list and makes list empty
function removeMovableSquares() {
   for (const movableSquare of movableSquaresList) {
       movableSquare.square.classList.remove("movable-square");
   }
   movableSquaresList = [];
}

// add highlight to movable squares when a piece is clicked
function highlightMovableSquares(element, idx) {
   if (!gameOver) {
       // if the square clicked on has a piece on it and it can't be captured
       if (isPiece(element) && !movableSquaresList.includes(element)) {
           removeMovableSquares();
           const elementID = element.piece.id;

           // if the player clicks a piece that isn't of the same color of whose turn it is
           if (getPlayerTurn() != elementID[0]) {
               selectedPiece2 = null;
           } else {
               // if the piece selected is the same piece as the currently selected piece
               if (selectedPiece2 === element) {
                    movableMoves(element);
                   selectedPiece2 = null;
               } else {
                   movableMoves(element);
                   selectedPiece2 = element;
               }
           }
       } else if (movableSquaresList.includes(element)) {
           movePiece(selectedPiece2, idx);
           removeMovableSquares();
           selectedPiece2 = null;
       } else { // this is the case for the clicked square not being a piece and can't be moved to
           removeMovableSquares();
           selectedPiece2 = null;
       }
   }
}

// add draggability feature
boardList.forEach((value, index) =>
value.square.addEventListener("mousedown", (event) => drag(value, index, event)));

function drag(element, elemIdx, event) {
    event.preventDefault();

    if (!gameOver) {
        highlightPiece(element);
        highlightMovableSquares(element, elemIdx);

        const piece = element.piece;

        // if it's a piece that has been clicked and the piece is of the correct turn
        if (piece && getPlayerTurn() === piece.id[0]) {
            let parentSquare = piece.parentNode;

            parentSquare.removeChild(piece);
            document.body.appendChild(piece);

            if (isBoardRotated) {
                piece.style.transform = "rotate(0deg)";
            }
        
            let newLeft = event.clientX - piece.offsetWidth / 2;
            let newTop = event.clientY - piece.offsetHeight / 2;
            let shiftX = event.clientX - parentSquare.getBoundingClientRect().left - piece.offsetWidth / 2;
            let shiftY = event.clientY - parentSquare.getBoundingClientRect().top -  piece.offsetHeight / 2;
        
        
            piece.style.left = (parentSquare.getBoundingClientRect().left + shiftX) + "px";
            piece.style.top = (parentSquare.getBoundingClientRect().top + shiftY) + "px";

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);


            function onMouseMove(event) {
                newLeft = event.clientX - piece.offsetWidth / 2;
                newTop = event.clientY - piece.offsetHeight / 2;
        
                piece.style.left = newLeft + "px";
                piece.style.top = newTop + "px";
            }

            function onMouseUp(event) {
                const pieceCenterX = piece.getBoundingClientRect().left + piece.offsetWidth / 2;
                const pieceCenterY = piece.getBoundingClientRect().top + piece.offsetHeight / 2;

                const squareObj = getSquareBelowDraggedPiece(pieceCenterX, pieceCenterY);
                if (squareObj) {
                    // if it's dropped over a movable square
                    if (movableSquaresList.includes(squareObj)) {
                        piece.style.left = "0px";
                        piece.style.top = "0px";

                        const moveToIdx = getIndexBySquare(squareObj.square);

                        removeMovableSquares();
                        parentSquare.classList.remove("selected-piece");
                        parentSquare.appendChild(piece);

                        movePiece(element, moveToIdx);
                        
                        parentSquare = squareObj.square;
                    } else if (squareObj === element) { // if it's dropped back over the original square
                        // put piece back in center of square where it was originally
                        parentSquare.appendChild(piece);
                        piece.style.left = "0px";
                        piece.style.top = "0px";

                        // removes the highlights onmouseup
                        if (removeOnMouseUp) {
                            removeMovableSquares();
                            parentSquare.classList.remove("selected-piece");
                        }

                    } else { // if it's dropped over a square it can't move to that isn't the original square
                        // put piece back in center of square where it was originally
                        parentSquare.appendChild(piece);
                        piece.style.left = "0px";
                        piece.style.top = "0px";
                        removeMovableSquares();
                        parentSquare.classList.remove("selected-piece");

                        // reset piece selection such that no pieces are currently selected
                        selectedPiece1 = null;
                        selectedPiece2 = null;
                    }
                } else {
                    parentSquare.appendChild(piece);
                    removeMovableSquares();
                    parentSquare.classList.remove("selected-piece");

                    // put piece back in center of square where it was originally
                    piece.style.left = "0px";
                    piece.style.top = "0px";
                }

                if (isBoardRotated) {
                    piece.style.transform = "rotate(180deg)";
                }

                removeOnMouseUp = false;

                document.removeEventListener("mouseup", onMouseUp);
                document.removeEventListener("mousemove", onMouseMove);
            }

        }
    }
}

// function which returns the square element below the dragged piece. if no element, returns null
function getSquareBelowDraggedPiece(xCoord, yCoord) {
    for (const squareObj of boardList) {
        squarePart = squareObj.square;
        if (xCoord > squarePart.getBoundingClientRect().left &&
        xCoord < squarePart.getBoundingClientRect().left + squarePart.offsetWidth &&
        yCoord > squarePart.getBoundingClientRect().top &&
        yCoord < squarePart.getBoundingClientRect().top + squarePart.offsetHeight) {
            return squareObj;
        }
    }

    return null;
}

// initialize variables to see if kings and rooks have moved for castling
let whiteKingHasMoved = false;
let blackKingHasMoved = false;
let rookw1HasMoved = false;
let rookw2HasMoved = false;
let rookb1HasMoved = false;
let rookb2HasMoved = false;


// gets all the squares the passed in rook element is currently attacking including same color pieces
function getRookMoves(element) {
   notation = getPieceNotation(element);
   row_num = notation.row;
   col_num = notation.col;
   let moves = []

   // fill in above rook
   for (let i = row_num - 1; i >= 0; i--) {
       // check if a piece is in the way
       moves.push(gameBoard[i][col_num]);
       if (isPiece(gameBoard[i][col_num])) {
           break
       }
   }

   // fill in below rook
   for (let i = row_num + 1; i < 8; i++) {
       // check if a piece is in the way
       moves.push(gameBoard[i][col_num]);
       if (isPiece(gameBoard[i][col_num])) {
           break
       }
   }

   // fill in left of rook
   for (let j = col_num - 1; j >= 0; j--) {
       moves.push(gameBoard[row_num][j])
       if (isPiece(gameBoard[row_num][j])) {
           break;
       }
   }

   // fill in right of rook
   for (let j = col_num + 1; j < 8; j++) {
       moves.push(gameBoard[row_num][j])
       if (isPiece(gameBoard[row_num][j])) {
           break;
       }
   }
  
   return moves;
}

function getKnightMoves(element) {
   const notation = getPieceNotation(element);
   const row_num = notation.row;
   const col_num = notation.col;
   let moves = []
   let filteredMoves = []

   try {
       // start here and work clockwise around knight move circle
       moves.push(gameBoard[row_num + 1][col_num - 2]);
   } catch(e) {/* ignore out-of-bounds-errors */}

   try {
       moves.push(gameBoard[row_num - 1][col_num - 2]);
   } catch(e) {}

   try {
       moves.push(gameBoard[row_num - 2][col_num - 1]);
   } catch(e) {}

   try {
       moves.push(gameBoard[row_num - 2][col_num + 1]);
   } catch(e) {}

   try {
       moves.push(gameBoard[row_num - 1][col_num + 2]);
   } catch(e) {}

   try {
       moves.push(gameBoard[row_num + 1][col_num + 2])
   } catch(e) {}

   try {
       moves.push(gameBoard[row_num + 2][col_num + 1])
   } catch(e) {/* ignore out-of-bounds-errors */}

   try {
       moves.push(gameBoard[row_num + 2][col_num - 1])
   } catch(e) {/* ignore out-of-bounds-errors */}

   // remove undefined in list
   for (const move of moves) {
       if (move) {
           filteredMoves.push(move);
       }
   }

   return filteredMoves;
}

function getBishopMoves(element) {
   const notation = getPieceNotation(element);
   const row_num = notation.row;
   const col_num = notation.col;
   let moves = [];
   let filteredMoves = [];

   // up-left diagonal
   for (let i = 1; i < 8; i++) {
       try {
           moves.push(gameBoard[row_num - i][col_num - i]);
           if (isPiece(gameBoard[row_num - i][col_num - i])) {
               break;
           }
       } catch(e) {/* ignore out-of-bounds-errors */}
   }

   // up-right diagonal
   for (let i = 1; i < 8; i++) {
       try {
           moves.push(gameBoard[row_num - i][col_num + i]);
           if (isPiece(gameBoard[row_num - i][col_num + i])) {
               break;
           }
       } catch(e) {}
   }

   // down-left diagonal
   for (let i = 1; i < 8; i++) {
       try {
           moves.push(gameBoard[row_num + i][col_num - i]);
           if (isPiece(gameBoard[row_num + i][col_num - i])) {
               break;
           }
       } catch(e) {}
   }

   // down-right diagonal
   for (let i = 1; i < 8; i++) {
       try {
           moves.push(gameBoard[row_num + i][col_num + i]);
           if (isPiece(gameBoard[row_num + i][col_num + i])) {
               break;
           }
       } catch(e) {}
   }

   // remove undefined in list
   for (const move of moves) {
       if (move) {
           filteredMoves.push(move);
       }
   }

   return filteredMoves;
}

function getQueenMoves(element) {
   const rookMoves = getRookMoves(element);
   const bishopMoves = getBishopMoves(element);
   let moves = rookMoves.concat(bishopMoves);

   return moves;
}

function getNormalKingMoves(element) {
   const notation = getPieceNotation(element);
   const row_num = notation.row;
   const col_num = notation.col;
   let moves = [];
   let filteredMoves = [];

   // Loop over the rows and columns around the king
   for (let i = row_num - 1; i <= row_num + 1; i++) {
       for (let j = col_num - 1; j <= col_num + 1; j++) {
           try {
               // Add all squares that aren't the king
               if ((i != row_num || j != col_num)) {
                   moves.push(gameBoard[i][j]);
               }
           } catch (e) {
               // Ignore out of bounds error
           }
       }
   }

   // remove undefined in list
   for (const move of moves) {
       if (move) {
           filteredMoves.push(move);
       }
   }

   return filteredMoves;
}

function getCastleKingMoves(element) {
    const notation = getPieceNotation(element);
    const row_num = notation.row;
    const col_num = notation.col;
    kingColor = element.piece.id[0]
    let moves = [];

    // rules of castling: king and rook haven't moved, no pieces between king and rook
    // can't castle through check, can't castle in check, can't castle into check, rook hasn't been captured
    if (kingColor === "w") {
        // left rook
        if (!whiteKingHasMoved && !rookw1HasMoved && !isPiece(gameBoard[row_num][col_num - 1])
        && !isPiece(gameBoard[row_num][col_num - 2]) && !isPiece(gameBoard[row_num][col_num - 3])
        && !inCheck() && !inAttSquares(gameBoard[row_num][col_num - 1])
        && !inAttSquares(gameBoard[row_num][col_num - 2]) && isPiece(gameBoard[row_num][0])
        && gameBoard[row_num][0].piece.id[1] == "r") {
            moves.push(gameBoard[row_num][col_num - 2]);
        }

        // right rook
        if (!whiteKingHasMoved && !rookw2HasMoved && !isPiece(gameBoard[row_num][col_num + 1])
        && !isPiece(gameBoard[row_num][col_num + 2]) && !inCheck() 
        && !inAttSquares(gameBoard[row_num][col_num + 1]) && !inAttSquares(gameBoard[row_num][col_num + 2])
        && isPiece(gameBoard[row_num][7]) && gameBoard[row_num][7].piece.id[1] == "r") {
            moves.push(gameBoard[row_num][col_num + 2]);
        }
    }

    if (kingColor === "b") {
        // left rook
        if (!blackKingHasMoved && !rookb1HasMoved && !isPiece(gameBoard[row_num][col_num - 1])
        && !isPiece(gameBoard[row_num][col_num - 2]) && !isPiece(gameBoard[row_num][col_num - 3])
        && !inCheck() && !inAttSquares(gameBoard[row_num][col_num - 1])
        && !inAttSquares(gameBoard[row_num][col_num - 2]) && isPiece(gameBoard[row_num][0])
        && gameBoard[row_num][0].piece.id[1] == "r") {
            moves.push(gameBoard[row_num][col_num - 2]);
        }

        // right rook
        if (!blackKingHasMoved && !rookb2HasMoved && !isPiece(gameBoard[row_num][col_num + 1])
        && !isPiece(gameBoard[row_num][col_num + 2]) && !inCheck() 
        && !inAttSquares(gameBoard[row_num][col_num + 1])
        && !inAttSquares(gameBoard[row_num][col_num + 2]) && isPiece(gameBoard[row_num][7])
        && gameBoard[row_num][7].piece.id[1] == "r") {
            moves.push(gameBoard[row_num][col_num + 2]);
        }
    }

    return moves;
}

function getKingMoves(element) {
    let normalMoves = getNormalKingMoves(element);
    let castleMoves = getCastleKingMoves(element);
    let moves = normalMoves.concat(castleMoves);

    return moves;
}

function getNormalPawnMoves(element) {
   const notation = getPieceNotation(element);
   const row_num = notation.row;
   const col_num = notation.col;
   const elemID = element.piece.id;
   let moves = [];

   // white pawn
   if (elemID.substring(0, 2) === "wp") {
       // pawn moves up one
       moves.push(gameBoard[row_num - 1][col_num]);
       if (isPiece(gameBoard[row_num - 1][col_num])) {
           return moves;
       } else {
           if (row_num === 6) {
               moves.push(gameBoard[row_num - 2][col_num]);
           }
       }
   }

   // black pawn
   else {
       moves.push(gameBoard[row_num + 1][col_num])
       if (isPiece(gameBoard[row_num + 1][col_num])) {
           return moves;
       } else {
           if (row_num === 1) {
               moves.push(gameBoard[row_num + 2][col_num]);
           }
       }
   }

   return moves;
}

function getAttackPawnMoves(element) {
   const notation = getPieceNotation(element);
   const row_num = notation.row;
   const col_num = notation.col;
   const elemID = element.piece.id;
   let moves = [];
   let filteredMoves = [];

   // white pawn
   if (elemID.substring(0, 2) === "wp") {
       try {
           moves.push(gameBoard[row_num - 1][col_num - 1])
       } catch(e) {/* ignore out of bounds error */}

       try {
           moves.push(gameBoard[row_num - 1][col_num + 1])
       } catch(e) {}
   }

   // black pawn
   else {
       try {
           moves.push(gameBoard[row_num + 1][col_num - 1])
       } catch(e) {}

       try {
           moves.push(gameBoard[row_num + 1][col_num + 1])
       } catch(e) {}
   }

   // remove undefined in list
   for (const move of moves) {
       if (move) {
           filteredMoves.push(move);
       }
   }

   return filteredMoves;
}

// create an en passant variable. it will be equal to the square of enPassant
let enPassant = null;

function getEnPassantMove(element) {
    // move since there is only one possible en passant move
    let move = null;

     // check if piece is pawn and lastPieceMoved starts as null so check if a piece has moved yet
    if (element.piece.id[1] === "p" && lastPieceMoved) {
        const lastPieceColor = lastPieceMoved.piece.id[0];
        const lastPieceNotation = getPieceNotation(lastPieceMoved);
        const lastPieceRow = lastPieceNotation.row;
        const lastPieceCol = lastPieceNotation.col;

        // check rules of en passant: pawn to the left or right of pawn, pawn just moved two squares there
        if (pawnMovedTwo && (element === gameBoard[lastPieceRow][lastPieceCol - 1]
            || element === gameBoard[lastPieceRow][lastPieceCol + 1])) {
            if (lastPieceColor === "w") {
                move = gameBoard[lastPieceRow + 1][lastPieceCol];
                enPassant = gameBoard[lastPieceRow + 1][lastPieceCol];
            } else {
                move = gameBoard[lastPieceRow - 1][lastPieceCol];
                enPassant = gameBoard[lastPieceRow - 1][lastPieceCol];
            }
        } else {
            enPassant = null;
        }
    }

    return move;
}

function getPawnMoves(element) {
   let normalMoves = getNormalPawnMoves(element);
   let attackMoves = getAttackPawnMoves(element);
   let filteredNormalMoves = [];
   let filteredAttackMoves = [];

   for (const move of normalMoves) {
       if (!isPiece(move)) {
           filteredNormalMoves.push(move);
       }
   }

   // check if a piece is on the square and whether it can be captured
   for (const move of attackMoves) {
       if (isPiece(move) && element.piece.id[0] != move.piece.id[0]) {
           filteredAttackMoves.push(move);
       }
    }

   let moves = filteredNormalMoves.concat(filteredAttackMoves);

   return moves;
}

// gets all the movable moves and puts the class "movable-square" on them
function movableMoves(element) {
   const pieceID = element.piece.id[1];
   let moves = [];

   if (pieceID === "r") {
       moves = getRookMoves(element);
   } else if (pieceID === "n") {
       moves = getKnightMoves(element);
   } else if (pieceID === "b") {
       moves = getBishopMoves(element);
   } else if (pieceID === "q") {
       moves = getQueenMoves(element);
   } else if (pieceID === "k") {
       moves = getKingMoves(element);
   } else {
       moves = getPawnMoves(element);
   }

    for (const move of moves) {
       if (isMovable(element, move)) {
           move.square.classList.add("movable-square");
           movableSquaresList.push(move);
       }
    }

    // add an en passant move if it exists
    const enPassantMove = getEnPassantMove(element);

    if (enPassantMove) {
        if (isMovable(element, enPassantMove)) {
            enPassantMove.square.classList.add("movable-square");
            movableSquaresList.push(enPassantMove);
        }
    }
}

// helper function which given an index in squareList returns the board notation of that element
function getNotationByIdx(index) {
   const row_num = Math.floor(index/8);
   const col_num = index - (row_num * 8);
  
   return { row_num, col_num };
}

function getElemByIdx(index) {
    notation = getNotationByIdx(index);
    const row = notation.row_num;
    const col = notation.col_num;

    return gameBoard[row][col];
}
 
function getIndexBySquare(square) {
    return squareListList.indexOf(square);
} 

// variable to keep track of where the king was in check
let oldKingSquare = null;

// variable to keep track of last piece moved
let lastPieceMoved = null;

// variable to see whether a pawn moved twice in the last turn
let pawnMovedTwo = false;

// variable to see how many moves have been played since a pawn was pushed or a piece was captured
let fiftyMove = 0;

// variable to check if a draw has been offered this turn yet
let drawOffered = false;

// get the empty paragraph elements from html
const result = document.querySelector(".result");
const whoWins = document.querySelector(".who-wins");

// get draw button elements from html
const accept = document.querySelector(".accept-button");
const decline = document.querySelector(".decline-button");

// variable to check whether the draw declined message should disappear. true is it should
let removeDrawDeclined = false;

// variable to check if the board has been rotated or not
let isBoardRotated = false;

// variable to check whether the button play random moves has been clicked
let clickedRandom = false;

// variable to keep track of the board states for three move repetition
// start by initializing the starting position as a key and giving it a value of one occurence
const initialBoardState = JSON.stringify(gameBoard)

let boardStates = {
    [initialBoardState]: 1
}

// function which moves the pieces from one spot to another
function movePiece(element, idx) {
    const moveToRowNum = getNotationByIdx(idx).row_num;
    const moveToColNum = getNotationByIdx(idx).col_num;
    const moveAwayRowNum = getPieceNotation(element).row;
    const moveAwayColNum = getPieceNotation(element).col;
    const colDifference = moveAwayColNum - moveToColNum;
    const rowDifference = moveAwayRowNum - moveToRowNum;
    const moveToSquare = gameBoard[moveToRowNum][moveToColNum];
    const moveAwaySquare = gameBoard[moveAwayRowNum][moveAwayColNum];
    const pieceID = element.piece.id
    const turn = getPlayerTurn();

    if (pieceID === "wr1") {
        rookw1HasMoved = true;
    } if (pieceID === "wr2") {
        rookw2HasMoved = true;
    } if (pieceID === "br1") {
        rookb1HasMoved = true;
    } if (pieceID === "br2") {
        rookb2HasMoved = true;
    } if (pieceID === "wk") {
        whiteKingHasMoved = true;
    } if (pieceID === "bk") {
        blackKingHasMoved = true;
    }

    if (removeDrawDeclined) {
        result.innerText = "";
        drawOffered = false;
        accept.style.display = "none";
        decline.style.display = "none";
        removeDrawDeclined = false;
    }

    // if the opposite player of the one who offered a draw is making a move
    if (drawOffered && turn != result.innerText[0].toLowerCase()) {
        result.innerText = "Draw offer declined";
        accept.style.display = "none";
        decline.style.display = "none";
        drawOffered = false;
        removeDrawDeclined = true;
    }

    // check if a pawn is moving two squares
    if (pieceID[1] === "p" && Math.abs(rowDifference) === 2) {
        pawnMovedTwo = true;
    } else {
        pawnMovedTwo = false;
    }

    // if pawn doesn't push or a piece isn't taken increment the fifty move rule counter
    if (isPiece(moveToSquare) || pieceID[1] === "p") {
        fiftyMove = 0;
    } else {
        fiftyMove++;
    }

   // checks whether a piece is being captured and removes the captured piece from html file
    if (isPiece(moveToSquare)) {
        moveToSquare.square.removeChild(moveToSquare.piece);
    }

    // remove the piece taken from en passant if the player is doing en passant
    if (moveToSquare === enPassant) {
        if (turn === "w") {
            gameBoard[moveToRowNum + 1][moveToColNum].square.removeChild(gameBoard[moveToRowNum + 1][moveToColNum].piece);
            gameBoard[moveToRowNum + 1][moveToColNum].piece = null;
        } else {
            gameBoard[moveToRowNum - 1][moveToColNum].square.removeChild(gameBoard[moveToRowNum - 1][moveToColNum].piece);
            gameBoard[moveToRowNum - 1][moveToColNum].piece = null;
        }
        enPassant = null;
    }

   // changes the location of the piece in the html file
   moveToSquare.square.appendChild(element.piece);

   // change the location of the piece in the 2d array
   moveToSquare.piece = element.piece;
   moveAwaySquare.piece = null;


    if (pieceID[1] === "k") {
        // kingside castle
        if (colDifference === -2) {
            gameBoard[moveAwayRowNum][moveAwayColNum + 1].square.appendChild(gameBoard[moveAwayRowNum][7].piece);
            gameBoard[moveAwayRowNum][moveAwayColNum + 1].piece = gameBoard[moveAwayRowNum][7].piece
            gameBoard[moveAwayRowNum][7].piece = null;
        }
        // queenside castle
        else if (colDifference === 2) {
            gameBoard[moveAwayRowNum][moveAwayColNum - 1].square.appendChild(gameBoard[moveAwayRowNum][0].piece);
            gameBoard[moveAwayRowNum][moveAwayColNum - 1].piece = gameBoard[moveAwayRowNum][0].piece
            gameBoard[moveAwayRowNum][0].piece = null;
        }
    }

    // check if pawn is promoting
    if ((pieceID.substring(0, 2) === "wp" && moveAwayRowNum === 1) || (pieceID.substring(0, 2) === "bp" && moveAwayRowNum === 6)) {
        const promotionOptions = document.querySelectorAll(".promotion-option")
        for (const option of promotionOptions) {
            option.style.display = "inline-block";
        }

        // initializes the promotions and when the button is pressed returns true
        initializePromotion(idx);
    }

    // updates what the last moved piece is 
    lastPieceMoved = moveToSquare;

   // remove the "in-check" class for the square where the king was in check
   if (oldKingSquare) {
       oldKingSquare.square.classList.remove("in-check");
   }

   turnCounter++;

   // checkmate is checked after turnCounter is incremented so if after incrementing it's white's turn
   // then black would have checkmated white on the previous turn
  
   // check for stuff
   updateAndCheck();

    if (getPlayerTurn() === "b" && clickedRandom && !gameOver) {
        playRandomMove();
    }
}

// variable to keep track of the currently attacked squares. each element will be an object mapping
// ID: elementID, and attackedSquare: movableSquare
let attackedSquares = []

// function to update the attackedSquare list after each turn
function updateAttackedSquares() {
   attackedSquares = [];

   for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
           const element = gameBoard[row][col];
           // if the square being checked has a piece on it and if the ID doesn't match the player turn such
           // that after the turnCounter is incremented the attacked squares represents opposing pieces
           if (element.piece && element.piece.id[0] != getPlayerTurn()) {
               const pieceID = element.piece.id[1];
               const fullPieceID = element.piece.id

               if (pieceID === "r") {
                   const rookMoves = getRookMoves(element);
                   for (const move of rookMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               } else if (pieceID === "n") {
                   const knightMoves = getKnightMoves(element);
                   for (const move of knightMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               } else if (pieceID === "b") {
                   const bishopMoves = getBishopMoves(element);
                   for (const move of bishopMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               } else if (pieceID === "q") {
                   const queenMoves = getQueenMoves(element);
                   for (const move of queenMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               } else if (pieceID === "k") {
                   const kingMoves = getKingMoves(element);
                   for (const move of kingMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               } else if (pieceID === "p") {
                   const pawnMoves = getAttackPawnMoves(element);
                   for (const move of pawnMoves) {
                       attackedSquares.push({ID: fullPieceID, attackedSquare: move});
                   }
               }
           }
       }
   }
}

// helper function to see if king is in check.
function inCheck() {
   const kingSquare = getKingSquare();

   for (const ID_square_object of attackedSquares) {
       // if a piece is attacking the king and that piece doesn't have the same color as the king
       if (ID_square_object.attackedSquare === kingSquare &&
           ID_square_object.ID[0] != kingSquare.piece.id[0]) {
           return true;
       }
   }
   return false;
}

// helper function to find the location of the king. returns the square the king is on
function getKingSquare() {
   const turn = getPlayerTurn();
   return getPieceFromID(`${turn}k`);
}

// helper function to see if a piece is movable. returns true if is movable. returns false if can't be moved
function isPieceMovable(element) {
   const pieceID = element.piece.id[1];
   let moves = [];

   if (pieceID === "r") {
       moves = getRookMoves(element);
   } else if (pieceID === "n") {
       moves = getKnightMoves(element);
   } else if (pieceID === "b") {
       moves = getBishopMoves(element);
   } else if (pieceID === "q") {
       moves = getQueenMoves(element);
   } else if (pieceID === "k") {
       moves = getKingMoves(element);
   } else {
       moves = getPawnMoves(element);
   }

   for (const move of moves) {
       if (isMovable(element, move)) {
           return true;
       }
   }
   return false;
}

// helper function to see if it's checkmate. returns false if not checkmate. returns true if is.
function isCheckmate() {
   for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
           const element = gameBoard[row][col];
           // if the square being checked has a piece on it and if the ID matches the player turn
           if (element.piece && element.piece.id[0] === getPlayerTurn()) {
               if (isPieceMovable(element)) {
                   return false;
               }
           }
       }
   }


   if (inCheck()) {
       return true; //checkmate
   } else {
       return false; //stalemate
   }
}

// helper function to see if it's stalemate. returns false if not stalemate. returns true if is.
function isStalemate() {
   for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
           const element = gameBoard[row][col];
           // if the square being checked has a piece on it and if the ID matches the player turn
           if (element.piece && element.piece.id[0] === getPlayerTurn()) {
               if (isPieceMovable(element)) {
                   return false;
               }
           }
       }
   }


   if (!inCheck()) {
       return true; //stalemate
   } else {
       return false; //checkmate
   }
}

// helper function to see if the element passed in is in attackedSquares. returns true if is
function inAttSquares(element) {
    for (const ID_square_object of attackedSquares) {
        if (ID_square_object.attackedSquare === element) {
            return true;
        }
    }

    return false;
}

// initialize counters to see how many pieces there are on the board for each color
// this is so when we promote to a piece we can add a unique ID to the piece. value is piece number + 1
const counters = {
    wqCounter: 2,
    wrCounter: 3,
    wbCounter: 3,
    wnCounter: 3,
    bqCounter: 2,
    brCounter: 3,
    bbCounter: 3,
    bnCounter: 3
}

function initializePromotion(idx) {
    const turn = getPlayerTurn();
    const moveToRowNum = getNotationByIdx(idx).row_num;
    const moveToColNum = getNotationByIdx(idx).col_num;
    const promotionSquare = gameBoard[moveToRowNum][moveToColNum];
    let playerTurn = "white";

    if (turn === "b") {
        playerTurn = "black"
    }

    if (turn === "b" && clickedRandom) {
        promotionSquare.square.removeChild(promotionSquare.piece);
        const randomChoice = Math.floor(Math.random() * 4);

        if (randomChoice === 0) {
            const addPieceID = "bqCounter";

            // increment the counter of the piece whose ID was just added
            counters["bqCounter"] += 1;

            const queenImage = new Image();
            queenImage.id = addPieceID
            queenImage.src = `icons/${playerTurn}-queen.svg`;
            queenImage.className = ("pieces");

            if (isBoardRotated) {
                queenImage.style.transform = "rotate(180deg)";
            }

            // add the image to the html file
            promotionSquare.square.appendChild(queenImage);

            // add the piece to the gameBoard
            promotionSquare.piece = queenImage;
        } else if (randomChoice === 1) {
            const addPieceID = "brCounter";

            // increment the counter of the piece whose ID was just added
            counters["brCounter"] += 1;

            const rookImage = new Image();
            rookImage.id = addPieceID
            rookImage.src = `icons/${playerTurn}-rook.svg`;
            rookImage.className = ("pieces");

            if (isBoardRotated) {
                rookImage.style.transform = "rotate(180deg)";
            }

            promotionSquare.square.appendChild(rookImage);
            promotionSquare.piece = rookImage;
        } else if (randomChoice === 2) {
            const addPieceID = "bbCounter";

            // increment the counter of the piece whose ID was just added
            counters["bbCounter"] += 1;

            const bishopImage = new Image();
            bishopImage.id = addPieceID
            bishopImage.src = `icons/${playerTurn}-bishop.svg`;
            bishopImage.className = ("pieces");

            if (isBoardRotated) {
                bishopImage.style.transform = "rotate(180deg)";
            }

            promotionSquare.square.appendChild(bishopImage);
            promotionSquare.piece = bishopImage;
        } else {
            const addPieceID = "bnCounter";

            // increment the counter of the piece whose ID was just added
            counters["bnCounter"] += 1;

            const knightImage = new Image();
            knightImage.id = addPieceID
            knightImage.src = `icons/${playerTurn}-knight.svg`;
            knightImage.className = ("pieces");

            if (isBoardRotated) {
                knightImage.style.transform = "rotate(180deg)";
            }

            promotionSquare.square.appendChild(knightImage);
            promotionSquare.piece = knightImage;
        }

        return;
    } else {
        const promotionContainer = document.querySelector(".piece-promotion");

        // add text to the paragraph element
        const whichPiece = document.querySelector(".piece-promotion-text");
        whichPiece.innerText = "Which piece do you want to promote to?";
    
        // create all the buttons
        const queenButton = document.createElement("button");
        queenButton.innerText = "Queen";
        queenButton.className = "promotion-buttons";
    
        const rookButton = document.createElement("button");
        rookButton.innerText = "Rook";
        rookButton.className = "promotion-buttons";
    
        const bishopButton = document.createElement("button");
        bishopButton.innerText = "Bishop";
        bishopButton.className = "promotion-buttons";
    
        const knightButton = document.createElement("button");
        knightButton.innerText = "Knight";
        knightButton.className = "promotion-buttons";
    
        // get all the buttons in an array
        const promotionButtons = [queenButton, rookButton, bishopButton, knightButton];
    
        // add the buttons as a child element of the piece-promotion div
        promotionButtons.forEach(value => {
            promotionContainer.appendChild(value);
        });
    
        gameOver = true;
    
        // add onlick attribute
        queenButton.addEventListener("click", function makePromotionQueen() {
            // find which ID needs to be added to the promoted piece
            const firstPart = `${turn}q`;
            const counterVariableName = `${firstPart}Counter`;
            const addPieceID = `${firstPart}${counters[counterVariableName]}`;
    
            // increment the counter of the piece whose ID was just added
            counters[counterVariableName] += 1;
    
            // remove the pawn that's on the promotion square
    
            promotionSquare.square.removeChild(promotionSquare.piece);
    
            // create an image of the new piece to be added
            const queenImage = new Image();
            queenImage.id = addPieceID
            queenImage.src = `icons/${playerTurn}-queen.svg`;
            queenImage.className = ("pieces");
    
            if (isBoardRotated) {
                queenImage.style.transform = "rotate(180deg)";
            }
    
            // add the image to the html file
            promotionSquare.square.appendChild(queenImage);
    
            // add the piece to the gameBoard
            promotionSquare.piece = queenImage;
    
            // hide the paragraph
            whichPiece.innerHTML = "";
    
            // remove the buttons
            promotionButtons.forEach(value => {
                promotionContainer.removeChild(value);
            });
    
            gameOver = false;
            if (clickedRandom) {
                playRandomMove();
            }
    
            updateAndCheck();
        });
        
        rookButton.addEventListener("click", function makePromotionRook() {
            const firstPart = `${turn}r`;
            const counterVariableName = `${firstPart}Counter`;
            const addPieceID = `${firstPart}${counters[counterVariableName]}`;
    
            counters[counterVariableName] += 1;
    
            promotionSquare.square.removeChild(promotionSquare.piece);
            const rookImage = new Image();
            rookImage.id = addPieceID
            rookImage.src = `icons/${playerTurn}-rook.svg`;
            rookImage.className = ("pieces");
    
            if (isBoardRotated) {
                rookImage.style.transform = "rotate(180deg)";
            }
    
            promotionSquare.square.appendChild(rookImage);
    
            promotionSquare.piece = rookImage;
    
            whichPiece.innerHTML = "";
    
            promotionButtons.forEach(value => {
                promotionContainer.removeChild(value);
            });
    
            gameOver = false;
            if (clickedRandom) {
                playRandomMove();
            }
    
            updateAndCheck();
        });
    
        bishopButton.addEventListener("click", function makePromotionBishop() {
            const firstPart = `${turn}b`;
            const counterVariableName = `${firstPart}Counter`;
            const addPieceID = `${firstPart}${counters[counterVariableName]}`;
    
            counters[counterVariableName] += 1;
    
            promotionSquare.square.removeChild(promotionSquare.piece);
            const bishopImage = new Image();
            bishopImage.id = addPieceID;
            bishopImage.src = `icons/${playerTurn}-bishop.svg`;
            bishopImage.className = ("pieces");
    
            if (isBoardRotated) {
                bishopImage.style.transform = "rotate(180deg)";
            }
    
            promotionSquare.square.appendChild(bishopImage);
    
            promotionSquare.piece = bishopImage;
    
            whichPiece.innerHTML = "";
    
            promotionButtons.forEach(value => {
                promotionContainer.removeChild(value);
            });
    
            gameOver = false;
            if (clickedRandom) {
                playRandomMove();
            }
    
            updateAndCheck();
        });
    
        knightButton.addEventListener("click", function makePromotionKnight() {
            const firstPart = `${turn}n`;
            const counterVariableName = `${firstPart}Counter`;
            const addPieceID = `${firstPart}${counters[counterVariableName]}`;
    
            counters[counterVariableName] += 1;
    
            promotionSquare.square.removeChild(promotionSquare.piece);
            const knightImage = new Image();
            knightImage.id = addPieceID
            knightImage.src = `icons/${playerTurn}-knight.svg`;
            knightImage.className = ("pieces");
    
            if (isBoardRotated) {
                knightImage.style.transform = "rotate(180deg)"
            }
    
            promotionSquare.square.appendChild(knightImage);
            
            promotionSquare.piece = knightImage;
    
            whichPiece.innerHTML = "";
    
            promotionButtons.forEach(value => {
                promotionContainer.removeChild(value);
            });
    
            gameOver = false;
            if (clickedRandom) {
                playRandomMove();
            }
    
            updateAndCheck();
        });
    }
}

// updates attacked squares and checks if the king is in checkmate, stalemate, or check
function updateAndCheck() {
    const boardStateKey = JSON.stringify(gameBoard);

    // update the boardState array
    if (boardStates.hasOwnProperty(boardStateKey)) {
        boardStates[boardStateKey] += 1;
    } else {
        boardStates[boardStateKey] = 1;
    }

    updateAttackedSquares();

    if (insufficientMaterial()) {
        gameOver = true;
        displayDraw();
    }

    if (isThreeMove()) {
        gameOver = true;
        displayDraw();
    }

    if (isFiftyMove()) {
        gameOver = true;
        displayDraw();
    }

   if (isCheckmate()) {
       gameOver = true;
       if (getPlayerTurn() === "w") {
           displayBlackWin();
       } else {
           displayWhiteWin();
       }
   }

   if (isStalemate()) {
       gameOver = true;
       displayDraw();
   }

   // highlights the square of the king if the king is in check
   const kingSquare = getKingSquare();

   // add the class "in-check" to the king
   if (inCheck()) {
       kingSquare.square.classList.add("in-check");
       oldKingSquare = kingSquare;
   } else {
       oldKingSquare = null;
   }
}

// a function to check if there is insufficient material to checkmate. returns true if insufficient
function insufficientMaterial() {
    // array to represent all the squares that have pieces on them
    let pieces = [];
    let bishops = [];
    let bishopClass1 = null;
    let bishopClass2 = null;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isPiece(gameBoard[row][col])) {
                pieces.push(gameBoard[row][col]);
            }
        }
    }

    // 4 pieces where both bishops are of the same color
    if (pieces.length === 4) {
        for (const pieza of pieces) {
            if (pieza.piece.id[1] === "b") {
                bishops.push(pieza);
            }
        }

        if (bishops.length === 2 && bishops[0].piece.id[0] != bishops[1].piece.id[0]) {
            bishopClass1 = bishops[0].square.classList.contains("light-square");
            bishopClass2 = bishops[1].square.classList.contains("light-square");

            if (bishopClass1 === bishopClass2) {
                return true;
            }
        }
    }

    // 3 pieces including kings and one is bishop or knight
    if (pieces.length === 3) {
        for (const pieza of pieces) {
            if (pieza.piece.id[1] === "b" || pieza.piece.id[1] === "n") {
                return true;
            }
        }
    }

    // only kings
    if (pieces.length === 2) {
        return true;
    }

    return false;
}

// a function to check if the fifty move rule has been satisfied. returns true if it has
function isFiftyMove() {
    if (fiftyMove === 100) {
        return true;
    }
}

// a function to check if a position has been repeated three times. returns true if it has
function isThreeMove() {
    if (Object.values(boardStates).includes(3)) {
        return true;
    }
}

// use an object to code three move repetition. store the board position after each move as a key
// and then use a value counter to count occurences of that position



// this part of the code focuses on external features outside of the actual chess game; i.e.: clock

let canResign = true;

function resign() {
    if (!gameOver && canResign) {
        const turn = getPlayerTurn();
        let playerTurn = "White";
        let otherPlayerTurn = "Black";

        if (turn === "b") {
            playerTurn = "Black";
            otherPlayerTurn = "White";
        }

        // game ends
        gameOver = true;

        if (playerTurn === "White") {
            result.innerText = "0 - 1";
        } else {
            result.innerText = "1 - 0";
        }

        whoWins.innerText = `${playerTurn} resigns, ${otherPlayerTurn} wins!`
    }
}

// finish function later
function offerDraw() {
    if (!gameOver && !drawOffered && !clickedRandom) {
        canResign = false;
        drawOffered = true;
        const turn = getPlayerTurn();
        let playerTurn = "White";

        if (turn === "b") {
            playerTurn = "Black";
        }

        result.innerText = `${playerTurn} offers a draw`;

        accept.style.display = "inline-block"
        decline.style.display = "inline-block";

        accept.addEventListener("click", function acceptDraw() {
            result.innerText = "1/2 - 1/2";
            whoWins.innerText = "Draw";
            accept.style.display = "none";
            decline.style.display = "none";

            // remove highlight on squares if a piece is currently selected
            removeMovableSquares();
            if (selectedPiece1) {
                selectedPiece1.square.classList.remove("selected-piece");
            }
            gameOver = true;
        });

        decline.addEventListener("click", function declineDraw() {
            result.innerText = "Draw offer declined";
            accept.style.display = "none";
            decline.style.display = "none";
            canResign = true;
            gameOver = false;
            drawOffered = false;
            removeDrawDeclined = true;
        });
    }
}

function displayWhiteWin() {
    result.innerText = "1 - 0";
    whoWins.innerText = "White Wins!";
}

function displayBlackWin() {
    result.innerText = "0 - 1";
    whoWins.innerText = "Black Wins!";
}

function displayDraw() {
    result.innerText = "1/2 - 1/2";
    whoWins.innerText = "Draw";
}

function rotateBoard() {
    pieceList = document.querySelectorAll(".square .pieces");
    board = document.querySelector(".board");
    numbers = document.querySelectorAll(".numbers");
    letters = document.querySelectorAll(".letters");

    if (isBoardRotated) {
        board.style.transform = "rotate(0deg)";
        pieceList.forEach(value => value.style.transform = "rotate(0deg)");
        numbers.forEach(value => value.style.transform = "rotate(0deg)");
        letters.forEach(value => value.style.transform = "rotate(0deg)");
        isBoardRotated = false;
    } else {
        board.style.transform = "rotate(180deg)";
        pieceList.forEach(value => value.style.transform = "rotate(180deg)");
        numbers.forEach(value => value.style.transform = "rotate(180deg)");
        letters.forEach(value => value.style.transform = "rotate(180deg)");
        isBoardRotated = true;
    }
}

function playRandomMove() {
    if (getPlayerTurn() === "b") {
        const possibleMoves = getAllPossibleMoves();
        const outerRandomNum = Math.floor(Math.random() * possibleMoves.length);
        const innerRandomNum =  Math.floor(Math.random() * possibleMoves[outerRandomNum].movable.length);
        const randomMoveElem = possibleMoves[outerRandomNum].movable[innerRandomNum];
        const moveToIdx = getIndexBySquare(randomMoveElem.square);
    
        movePiece(possibleMoves[outerRandomNum].elem, moveToIdx);
    }
}

// returns a list of all of black's possible moves
function getAllPossibleMoves() {
    let possibleMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const element = gameBoard[row][col]
            // if there's a piece and that piece is black
            if (element.piece && element.piece.id[0] === "b") {
                movableMoves(element);
                // if the piece can move
                if (movableSquaresList.length != 0) {
                    possibleMoves.push({elem: element, movable: movableSquaresList});
                }
                removeMovableSquares();
            }
        }
    }

    return possibleMoves;
}

function flipRandom() {
    clickedRandom = !clickedRandom;
}


// to do: finish offer draw and displaying results when game is over, add the game to local storage
// so when you refresh the position is still there, add three move repetition and 50 move rule,
// add clock, display notation after each move, add drag feature, add back button to go back moves,
// add a rematch button maybe, add reset board button maybe, add sound effect to piece movements