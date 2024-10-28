import { create } from "zustand";
import { createCustomMapSlice } from "./slices/create-custom-map-slice";
import { CreateSolverSlice } from "./slices/create-solver-slice";


/**
 *  Game store
 * 
 *  * A lot of the functions are not used as they were originally made for the solvers 
 *  * but no longer used for efficiency and web worker usage. 
 * 
 */



const safeBlockCells = ['S', ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const blockMap = ['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const storageBlockCellMap = ['S', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const directions = ['up', 'down', 'left', 'right'];


export const useGameStore = create((set, get) => ({

    ...createCustomMapSlice(set, get),
    ...CreateSolverSlice(set, get),

    /// generic set state
    setState: (key, value) => set({ [key]: value }),

    cost: 0,
    incrementCost: () => set((state) => ({ cost: state.cost + 1 })),
    moves: 0,
    incrementMoves: () => set((state) => ({ moves: state.moves + 1 })),

    gameWinable: true,


    /// game state - keep track of all move history
    history: [],


    /// original game state    
    originalGameBoard: [],  /// original unparsed game board
    blockPositions: [], /// position of all blocks
    initialBlockPositions: [], /// the original block positions
    gamboardLengthX: 0,
    gameboardLengthY: 0,

    /// active game state
    parsedGameBoard: [], /// original parsed game board
    gameboard: [], /// active game board
    storageBlockCells: [], /// position of all storage cells
    boxDistances: [], /// manhattan heuristic distance between boxes

    initialPlayerPosition: { x: 0, y: 0 },
    playerPosition: { x: 0, y: 0 },
    setPlayerPosition: (x, y) => set({ playerPosition: { x: x, y: y } }),



    loadGameBoard: (gameboard) => set((state) => {

        let tempGameBoard = structuredClone(gameboard);

        const gameData = {
            originalGameBoard: gameboard,
            createMap: false,
            blockPositions: [],
            boxDistances: [],
            initialBlockPositions: [],
            parsedGameBoard: [],
            gameboard: tempGameBoard,
            storageBlockCells: [],
            initialPlayerPosition: { x: 0, y: 0 },
            playerPosition: { x: 0, y: 0 },

            gameboardLengthX: gameboard[0].length,
            gameboardLengthY: gameboard.length,





        };

        /// ensure only one player
        let playerCount = 0;



        for (let y = 0; y < gameboard.length; y++) {
            for (let x = 0; x < gameboard[y].length; x++) {

                if (gameData.gameboardLengthX !== gameboard[y].length) { throw new Error('Invalid gameboard. An X has unequal value.'); }

                const cell = gameboard[y][x];

                /// load player data
                if (cell === 'R') {
                    if (playerCount > 1) { throw new Error('Only one player is allowed!'); };
                    gameData.playerPosition = { x: x, y: y };
                    gameData.initialPlayerPosition = { x: x, y: y };
                    tempGameBoard[y][x] = ' ';
                    playerCount++;
                }

                /// load block data
                if (blockMap.includes(cell)) {
                    gameData.blockPositions.push({ x: x, y: y, type: cell });
                    gameData.initialBlockPositions.push({ x: x, y: y, type: cell });
                    tempGameBoard[y][x] = ' ';
                }

                if (storageBlockCellMap.includes(cell)) {
                    gameData.storageBlockCells.push({ x: x, y: y, type: cell });
                }
            }
        }

        gameData['boxDistances'] = calculateDistances(gameData.blockPositions, gameData.storageBlockCells);

        return gameData;
    }),


    resetGame: () => {

        const { originalGameBoard, loadGameBoard } = get();

        loadGameBoard(originalGameBoard)
    },



 
    movePlayer: (payload) => {


        const { playerPosition, boxDistances, gameSolvable, getNextPosition, getCellType, validateMove, blockPositions, setState, incrementCost, incrementMoves } = get();


        let newBlockPositions = blockPositions;
        let newBoxDistances = [];
        let nextPlayerPosition = {};


        incrementCost();

        /// trigger for if a block needs to be moved
        const blockMove = { required: false, nextPosition: {}, nextCellType: '', isValid: false };

        /// track moves
        const { direction, useCurrentPlayerPosition, newPlayerPosition, useDefaultNextPosition, nextPosition } = payload;

        const returnData = {
            userMoved: false, /// if the user moved
            blockPositions: blockPositions,
            playerPosition: playerPosition,



            /////

            blockMoved: false,
            blockTypeMoved: '',
            originalPlayerCords: { x: playerPosition.x, y: playerPosition.y },
            newPlayerCords: { x: playerPosition.x, y: playerPosition.y },
            reason: '',
            direction: direction,
            invertDirection: invertDirection(direction),
            boxDistances: boxDistances,
            gameSolvable: true,
        }


        nextPlayerPosition = getNextPosition(playerPosition, direction);
        const nextCellType = getCellType(nextPlayerPosition);

        // If block move is required
        if (blockMap.includes(nextCellType)) {
            blockMove.required = true;
            blockMove.nextPosition = getNextPosition(nextPlayerPosition, direction);
            blockMove.nextCellType = getCellType(blockMove.nextPosition);
            blockMove.isValid = validateMove(blockMove.nextPosition, blockMove.nextCellType);
        }


        if (!blockMove.required && !validateMove(nextPlayerPosition, nextCellType)) {
            returnData.reason = 'Invalid user move';
            return returnData;
        }


        // return if block move is invalid
        if (blockMove.required && !blockMove.isValid) {
            returnData.reason = 'Invalid block move';
            return returnData;
        }


        /**
         * Beyond this point, the user move is valid and the block move is valid
         */
        if (blockMove.required) {
            newBlockPositions = blockPositions.map((block) => {
                if (block.x === nextPlayerPosition.x && block.y === nextPlayerPosition.y) {
                    return { ...block, x: blockMove.nextPosition.x, y: blockMove.nextPosition.y };
                }
                return block;
            });

            setState('blockPositions', newBlockPositions);

            newBoxDistances = calculateDistances(newBlockPositions, get().storageBlockCells);
            setState('boxDistances', newBoxDistances);

            returnData.boxDistances = newBoxDistances;
            returnData.blockMoved = true;
            returnData.blockTypeMoved = nextCellType;
            returnData.gameSolvable = gameSolvable(newBlockPositions);


            returnData.blockPositions = newBlockPositions;

        };


        /// update player position
        setState('playerPosition', nextPlayerPosition);

        /// update return data with new player move data
        returnData.userMoved = true;
        returnData.newPlayerCords = { x: nextPlayerPosition.x, y: nextPlayerPosition.y };

        /// increment valid moves
        incrementMoves();


        /// update history
        const history = JSON.stringify({
            blockPositions: newBlockPositions,
            playerPosition: nextPlayerPosition,
            boxDistances: returnData.boxDistances,
        });

        setState('history', [...get().history, history]);

        return returnData;

    },


    undoMove: () => {
        const { history, cost, moves, playerPosition, resetGame } = get();

        const newHistory = [...history];

        if (history.length === 0) { return resetGame(); }


        let lastMove = JSON.parse(newHistory.pop());

        if (lastMove.playerPosition.x === playerPosition.x && lastMove.playerPosition.y === playerPosition.y) {
            lastMove = JSON.parse(newHistory.pop());
        }

        set({
            blockPositions: lastMove.blockPositions,
            playerPosition: lastMove.playerPosition,
            boxDistances: lastMove.boxDistances,
            history: newHistory,
            cost: cost + 1,
            moves: moves + 1,
        });

    },





    getNextPosition: (playerPosition, direction) => {
        switch (direction) {
            case 'up':
                return { x: playerPosition.x, y: playerPosition.y - 1 };
            case 'down':
                return { x: playerPosition.x, y: playerPosition.y + 1 };
            case 'left':
                return { x: playerPosition.x - 1, y: playerPosition.y };
            case 'right':
                return { x: playerPosition.x + 1, y: playerPosition.y };
            default:
                return { x: playerPosition.x, y: playerPosition.y };
        }
    },



    getCellType: (position) => {

        const { gameboard, blockPositions, storageBlockCells } = get();
        const defaultCell = gameboard[position.y][position.x];

        console.log("DEFAULT CELL", blockPositions)
        if (defaultCell === 'O') { return defaultCell; }

        const block = blockPositions.find((block) => block.x === position.x && block.y === position.y);
        if (block?.type) { return block.type; }

        const storageBlock = storageBlockCells.find((block) => block.x === position.x && block.y === position.y);
        if (storageBlock?.type) { return storageBlock.type; }

        if (defaultCell === ' ') { return defaultCell; }


        throw new Error(`Unknown cell type! ${defaultCell}`);

    },


    validateMove: (position, cellType) => {
        /// handle simple moves
        if (cellType === 'O') { return false; }
        if (safeBlockCells.includes(cellType)) { return true; }
    },


    gameSolvable: (blockPositions) => {
        const { getNextPosition, getCellType, validateMove, setState } = get(); // Assuming get() retrieves the current game state


        for (const block of blockPositions) {

            let invalidCount = 0;

            for (const direction of directions) {
                const nextPosition = getNextPosition(block, direction);
                const nextCellType = getCellType(nextPosition);
                if (!validateMove(nextPosition, nextCellType)) {
                    invalidCount++;
                }
            }

            if (invalidCount === 3) {
                set({ gameWinable: false });
                return false;
            }

        }

        return true;
    }







}));



const invertDirection = (direction) => {

    switch (direction) {
        case 'up':
            return 'down';
        case 'down':
            return 'up';
        case 'left':
            return 'right';
        case 'right':
            return 'left';
        default:
            return direction;
    }


}



const calculateDistances = (blockPositions, storageBlockCells) => {

    let distancesData = [];


    for (const block of blockPositions) {

        const storageBlock = block.type === 'X' ? storageBlockCells.find((storageBlock) => storageBlock.type === 'S') :
            storageBlockCells.find((storageBlock) => storageBlock.type === block.type.toLowerCase());

        const distanceData = {

            blockPosition: { x: block.x, y: block.y },
            blockType: block.type,
            storageType: storageBlock.type,
            manhattanDistance: calculateManhattanDistance(block, storageBlock),
        }
        distancesData.push(distanceData);
    }

    return distancesData;
}

export const calculateManhattanDistance = (coords1, coords2) => {
    return Math.abs(coords1.x - coords2.x) + Math.abs(coords1.y - coords2.y);
}


