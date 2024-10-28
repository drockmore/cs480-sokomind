// bfsWorker.js
const boxes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'X'];
const storageSpots = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'S'];
const solvedStorageSpots = ['A.a', 'B.b', 'C.c', 'D.d', 'E.e', 'F.f', 'G.g', 'H.h', 'I.i', 'J.j', 'X.S'];
const emptySpots = [' ', ...storageSpots];
const directionsArr = ['up', 'down', 'left', 'right'];


/**
 * Web worker to solve dfs. This would freeze pretty quickly in the browser so it was moved to a web worker. 
 */
self.onmessage = function (event) {
    const { refGameboard, helpers } = event.data;


    /**
     * Initialize run state
     */

    let queue = []; /// active moves
    let history = new Set(); /// save history as a set to reduce memory usage
    let historyDirection = []; /// this is returned if a solution is found.
    let direction = 'left';


    /**
     * Initialize gameboards
     */
    const gameboard = structuredClone(refGameboard);
    const originalGameboard = structuredClone(refGameboard);
    const { storagePositions, solveableBlocks } = getSolvedBlockArray(gameboard);


    /**
     * Calculate estimated max iterations
     */
    const maxIterationEstimate = estimateMaxIterations(gameboard);
    self.postMessage({ message: 'iterationEstimate', value: maxIterationEstimate });


    let total = 0;
    let flag = true;
    const batchSize = 10000; /// control the amount of iterations between time out. Higher = more likely to freeze the worker. 


    /**
     * Add the initial gameboard to the queue.
     */
    queue.push({ gameboard: originalGameboard, direction, historyDirection });
    //queue.push(hashGameBoard(gameboard));



    function processBatch() {

        for (let j = 0; j < batchSize && flag; j++) {
            total++;

            /**
             * Get last move's gameboard
             */
            let current = queue.shift();
            
            /**
             * If the queue is empty. 
             */
            if (!current) {
                self.postMessage({ message: 'no solution' });
                flag = false;
                return;
            }


            /**
             * Dehash the gameboard 
             */
           // let gameboard = current //dehashGameBoard(current);
            let { gameboard, historyDirection } = current;
            


            /**
             * Check if the game is solved or not.
             */
            if (isSolved(solveableBlocks, gameboard)) {
                self.postMessage({ message: 'solved', value: {historyDirection: historyDirection, total: total} });
                flag = false;
                break;
            }


            /**
             * Get the next possible moves 
             */
            const possibleMoves = getPossibleMoves(gameboard, history, storagePositions);


            for (const move of possibleMoves) {
                if (!history.has(move.hashedMove)) {
                    queue.push({
                        gameboard: dehashGameBoard(move.hashedMove),
                        direction: move.direction,
                        historyDirection: [...historyDirection, move.direction],
                    });
                    history.add(move.hashedMove);
                }
            }


        }


        /**
         * If the flag is still true, send back a progress report
         */
        if (flag) {
            self.postMessage({ message: 'progress', value: total.toLocaleString() })
            setTimeout(processBatch, 500); // Yield control back to the browser
        }

        /**
         * If the flag is false, the run is done. 
         */
        if (!flag) {
            self.postMessage({ message: 'ended' });
        }
    }

    /**
     * Continue running if the flag is set. 
     */
    if (flag) {
        processBatch();
    }
};




/*************************
 * Move functions
 *************************/

/**
 * Utility function to get all possible moves 
 */
const getPossibleMoves = (gameboard, history) => {
    let possibleMoves = [];
    for (const direction of directionsArr) {
        let move = moveItem('R', direction, gameboard);
        if (move) {
            let hashedMove = hashGameBoard(move);
            if (!history.has(hashedMove)) {
                possibleMoves.push({ hashedMove, direction
                });
            }
        }
    }
    return possibleMoves;
};














const moveItem = (item, direction, gameboard) => {
    gameboard = structuredClone(gameboard); // Clone the gameboard

    let playerPosition = findBoardItemPosition(item, gameboard);
    let nextPosition = getNextPosition(direction, playerPosition, gameboard);

    // If the next position is out of bounds or not empty, return false
    if (isPositionOutOfBounds(nextPosition, gameboard)) return false;

    if (isPositionEmpty(nextPosition, gameboard)) {
        // Move player if next position is empty
        modifyItemPosition(item, playerPosition, nextPosition, gameboard);
        return gameboard;
    }

    // Check if the next position contains a movable box
    if (isPositionMoveable(nextPosition, gameboard)) {
        // Get the position after the box in the direction of movement
        const nextBoxPosition = getNextPosition(direction, nextPosition, gameboard);

        // If the position after the box is empty, move the box and then the player
        if (isPositionEmpty(nextBoxPosition, gameboard)) {
            const boxItem = findBoardItemByPosition(nextPosition, gameboard);

            // Move the box first
            modifyItemPosition(boxItem, nextPosition, nextBoxPosition, gameboard);

            // Now move the player into the box's old position
            modifyItemPosition(item, playerPosition, nextPosition, gameboard);

            return gameboard;
        }
    }

    // If none of the conditions are met, the move is not valid
    return false;
};

/*************************
 * End Move functions
 *************************/






/*************************
 * Position Functions
 *************************/

/**
 * Find the position of a board item.
 */
const findBoardItemPosition = (item, gameboard) => {
    for (let i = 0; i < gameboard.length; i++) {
        for (let j = 0; j < gameboard[i].length; j++) {
            /// split each item to remove storage spot
            if (gameboard[i][j].split('.')[0] === item.split('.')[0]) {
                return { x: j, y: i };
            }
        }
    }
}

/**
 * Get the next position coordinates based on the direction and the item coordinates.
 */
const getNextPosition = (direction, itemPosition, gameboard) => {

    const newPosition = { ...itemPosition };

    switch (direction) {
        case 'up':
            newPosition.y -= 1;
            break;
        case 'down':
            newPosition.y += 1;
            break;
        case 'left':
            newPosition.x -= 1;
            break;
        case 'right':
            newPosition.x += 1;
            break;
        default:
            break;
    }
    return newPosition;
}

/**
 * Returns true if position is out of bounds.
 * (It checks for array boundaries just in case but bounds refers to the walls for the player.)
 */
const isPositionOutOfBounds = (position, gameboard) => {

    if (position.x < 0 || position.y < 0) {
        return true;
    }

    if (position.x >= gameboard[0].length || position.y >= gameboard.length) {
        return true;
    }

    return gameboard[position.y][position.x] === 'O';

}

/**
 * Returns true if position is empty.
 * Empty spots include storage spaces.
 */
const isPositionEmpty = (position, gameboard) => {
    const positionItem = gameboard[position.y][position.x];
    return emptySpots.includes(positionItem);
}


/**
 * Returns true if position is moveable ( A box )
 */
const isPositionMoveable = (position, gameboard) => {
    let item = gameboard[position.y][position.x].split('.');
    return boxes.includes(item[0]);
}

/**
 * Returns the item at the specific position
 */
const findBoardItemByPosition = (position, gameboard) => {
    return gameboard[position.y][position.x];
}

/*************************
 * End Position Functions
 *************************/





/*************************
 * Helper functions
 *************************/

/**
 * Check if the game is solved.
 */
const isSolved = (solveableBlockArr, gameboard) => {

    for (let i = 0; i < gameboard.length; i++) {
        for (let j = 0; j < gameboard[i].length; j++) {

            let item = gameboard[i][j];

            if (item === ' ' || item === 'R' || item === 'O' || item === 'S' || item === 'X') { continue; }

            if (!solvedStorageSpots.includes(item)) return false;

        }
    }

    return true;


}

/**
 * Returns an array of solved blocks if they are in the respective storage space.
 * ex: ['A.a', 'B.b', ...]
 */
const getSolvedBlockArray = (gameboard) => {

    let solveableBlocks = [];
    let storagePositions = [];

    for (const row of gameboard) {
        for (const cell of row) {

            if (storageSpots.includes(cell)) {
                storagePositions.push({ block: cell, position: { x: cell, y: row } })
            }

            if (boxes.includes(cell)) {
                if (cell === 'S') {
                    solveableBlocks.push(`S.X`)
                } else {
                    solveableBlocks.push(`${cell}.${cell.toLowerCase()}`);
                }
            }
        }
    }

    return {
        solveableBlocks: solveableBlocks,
        storagePositions: storagePositions,
    }

}

/**
 * Returns the position of a storagespot. 
 */
const getStorageSpotForBox = (box, storagePositions) => {

    box = box.split('.')[0];
    const storageSpotLetter = box === 'X' ? 'S' : box.toLowerCase();
    const storagePositionItem = storagePositions.find((item) => item.block === storageSpotLetter);
    return storagePositionItem.position;
};
/*************************
 * End Helper functions
 *************************/





/*************************
 * Gameboard update functions
 *************************/

/**
 * This will update the user position on the map and take into account storage positions.
 * If the user is currently on a storage position the position item would look like this: 'R.a' where is the storage position.
 * If the user is moving to a storage position the position will be added to the user position.
 * If the user is moving away from a storage position the position will be restored.
 */
const modifyItemPosition = (item, currentPosition, nextPosition, gameboard) => {


    const currentPositionItem = findBoardItemByPosition(currentPosition, gameboard);
    const nextPositionItem = findBoardItemByPosition(nextPosition, gameboard);

    const currentPositionItemArr = currentPositionItem.split('.');

    if (item === 'R' && currentPositionItemArr[0] !== item) throw new Error('Invalid board modification for modifyItemPosition at find user position.');
    if (item !== 'R' && currentPositionItem !== item) throw new Error('Invalid board modification for modifyItemPosition at non player move.');


    gameboard[currentPosition.y][currentPosition.x] = currentPositionItemArr.length > 1 ? currentPositionItemArr[1] : ' ';
    gameboard[nextPosition.y][nextPosition.x] = nextPositionItem !== ' ' ? `${item.split('.')[0]}.${nextPositionItem}` : item;

}

/*************************
 * End Gameboard update functions
 *************************/





/*************************
 * Board hashing functions - partially generate with chatgpt 4o
 *************************/

// Function to "hash" (convert) the 2D gameboard to a string
function hashGameBoard(board) {
    return board.map(row => row.join('_')).join('|');  // Join rows with a delimiter like '|'
}

// Function to "dehash" (convert back) the string to a 2D gameboard array
function dehashGameBoard(hash) {
    return hash.split('|').map(row => row.split('_'));  // Split rows and then split individual characters
}
/*************************
 * End board hashing functions
 *************************/




/**
 * 
 * The functions below were generate by chatGPT 4o to estimate possible iterations.
 * 
 * 
 */

// Function to calculate factorial for combinations
const factorial = (n) => {
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};


// Function to calculate combinations (n choose k)
const combinations = (n, k) => {
    // If n is less than k, combinations should be 0
    if (n < k) return 0;

    // Safeguard against edge cases like 0 factorials and small values
    if (n === k || k === 0) return 1;

    return factorial(n) / (factorial(k) * factorial(n - k));
};

// Function to estimate maximum iterations
const estimateMaxIterations = (gameboard) => {



    let openTiles = 0;

    let numBoxes = 0;

    // Count the number of open tiles on the gameboard
    for (let row of gameboard) {
        for (let cell of row) {
            // Assuming ' ' represents an open tile
            if (emptySpots.includes(cell) || cell === 'R') {  // Add any other valid spots for boxes
                openTiles++;
            }

            if (boxes.includes(cell)) {
                numBoxes++;
            }
        }
    }

    // Number of possible player positions is open tiles minus the number of boxes
    let playerPositions = openTiles - numBoxes;

    // Calculate the number of box configurations using combinations
    let boxConfigurations = combinations(openTiles, numBoxes);

    // The maximum number of iterations is 4 directionsArr times the number of player positions times box configurations
    let maxIterations = 4 * playerPositions * boxConfigurations;

    return maxIterations.toLocaleString();
};
