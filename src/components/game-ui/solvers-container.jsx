'use client'

import { useState } from "react";
import { Button } from "../ui/button";
import { useGameStore } from "@/app/stores/game-store";
import { InfoIcon, LoaderPinwheel } from "lucide-react";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const workers = {
    'bfs': {
        worker: '/workers/bfsWorker.js',
        title: 'Breadth First Search',
    },

    'dfs': {
        worker: '/workers/dfsWorker.js',
        title: 'Depth First Search',
    },

    'gbfs': {
        worker: '/workers/gbfsWorker.js',
        title: 'Greedy Best First Search'
    },

    'A*': {
        worker: '/workers/aSearchWorker.js',
        title: 'A* Search'
    },
    'custom': {
        worker: '/workers/customHeuristicWorker.js',
        title: 'Custom Heuristic Search'
    }
}

export const SolversContainer = ({ }) => {

    /// shared state
    const {
        movePlayer,
        originalGameBoard,
        runState,
        setRunState,
        resetRunState,
        resetGame,
    } = useGameStore();

    /// state for the worker
    const [worker, setWorker] = useState(null);

    /// update shared state
    const handleUpdate = (key, value) => {
        setRunState(key, value);
    }

    /**
     * Function to run the web worker and select the correct worker based on the solver.
     */
    const startWorker = (worker) => {

        /// reset run state
        resetRunState();

        // Initialize the worker 
        const newWorker = new Worker(workers[worker].worker);

        // update the worker used
        handleUpdate('solver', worker);

        // update the status to working
        handleUpdate('status', 'working');

        // Handle messages from the worker
        newWorker.onmessage = function (event) {
            const { message, value } = event.data;


            /// get the estimated iterations
            if (message === 'iterationEstimate') {
                handleUpdate('maxIterations', value);
            }

            /// get the current iterations completed
            if (message === 'progress') {
                handleUpdate('iterations', value)
            }

            /// if a solution is found.
            if (message === 'solved') {
                handleUpdate('status', 'solved');
                handleUpdate('solution', value.historyDirection);
                handleUpdate('iterations', value.total);
                newWorker.terminate();  // Stop the worker after solution is found
                setWorker(null);
            }

            /// no solution found
            if (message === 'no solution') {
                handleUpdate('status', 'Could not solve.');
                newWorker.terminate();
                setWorker(null);
            }

            /// worker ended without triggering no solution or solution
            if (message === 'ended') {
                handleUpdate('status', 'ended unknown')
                newWorker.terminate();
                setWorker(null);
            }
        };

        /**
         * Handle errors within the worker
         */
        newWorker.onerror = function (errorEvent) {
            handleUpdate('status', 'error')
            newWorker.terminate();
            setWorker(null);
            console.error('Worker error:', errorEvent); // check the console to get the error
        };


        // Start the worker with the gameboard data
        newWorker.postMessage({ refGameboard: originalGameBoard });

        // Store the worker instance in state 
        setWorker(newWorker);
    };




    const solveWithSolution = async () => {
        resetGame();
        for (const direction of runState.solution) {
            handleManualPlayerMove(direction);
            await sleep(100)
        }

    };


    const handleManualPlayerMove = (direction) => {
        const payload = {
            direction: direction, /// up | down | left | right
            useCurrentPlayerPosition: true, /// true | false
            newPlayerPosition: { x: 0, y: 0 }, /// x, y
            useDefaultNextPosition: true, /// true | false
            nextPosition: { x: 0, y: 0 }, /// x, y
        }

        movePlayer(payload);

    }


    if (originalGameBoard?.length === 0) {
        return (
            <div>
                <div className="w-full bg-white p-6 rounded-lg shadow-lg">
                    <InfoIcon className="w-10 h-10 text-blue-500 mx-auto" />
                    <div className="text-xl mt-6 font-bold text-center">
                        Load a gameboard to run a solver.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-xl font-bold mb-6">Solvers: </div>
                {!worker && (
                    <div className="grid gap-6">
                        
                        <Button onClick={() => startWorker('bfs')}>Run BFS</Button>

                        <Button onClick={() => startWorker('dfs')}>Run DFS</Button>

                        <Button onClick={() => startWorker('gbfs')}>Run GBFS</Button>

                        <Button onClick={() => startWorker('A*')}>Run A*</Button>

                        <Button onClick={() => startWorker('custom')}>Custom Heuristic</Button>

                        
                    </div>
                )}

                {worker && (
                    <Button
                        onClick={() => {
                            worker.terminate(); // Terminate the worker
                            setWorker(null); // Clear the worker from state
                            handleUpdate('status', 'Terminated'); /// update worker status
                        }}
                    >
                        Stop Worker
                    </Button>
                )}
            </div>






            {runState.solver && (
                <div className="bg-white p-6 rounded-lg shadow-lg">

                    <div className="text-xl font-bold">
                        {workers[runState.solver].title}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <div className="font-bold">Status:</div>
                        <div className="flex items-center gap-2">
                            {runState.status}
                            {runState.status === 'working' && <LoaderPinwheel className="w-4 h-4 animate-spin text-blue-500" />}
                        </div>
                    </div>


                    <div className="flex gap-2 mt-4">
                        <div className="font-bold">Cost:</div>
                        <div className="flex items-center gap-2">
                            {runState.iterations}
                        </div>
                    </div>
                    <div className="text-xs italic flex gap-2 items-center">
                        <InfoIcon className="w-3 h-3" /> 500ms delay between iteration updates.
                    </div>

                    <div className="flex gap-2 mt-4">
                        <div className="font-bold">Max Moves:</div>
                        <div className="flex items-center gap-2">
                            {runState.maxIterations}
                        </div>


                    </div>
                    <div className="text-xs italic flex gap-2 items-center">
                        <InfoIcon className="w-3 h-3" /> Estimated max moves based on boxes and free spaces.
                    </div>

                </div>
            )}


            {runState?.solution?.length === 0 && (

                <div>
                    <div className="w-full bg-white p-6 rounded-lg shadow-lg">
                        <InfoIcon className="w-10 h-10 text-blue-500 mx-auto" />
                        <div className="text-xl mt-6 font-bold text-center">
                            No solution available.
                        </div>
                        <div className="text-center">If a solution is found, it will be displayed here.</div>
                    </div>
                </div>


            )}

            {runState?.solution?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">


                    <div className="flex justify-between items-center mb-4 ">
                        <div className="font-bold">Solution: ({runState.solution.length} moves)</div>
                        <Button onClick={solveWithSolution} >Run solution</Button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-4 border rounded">
                        <pre className="whitespace-pre-wrap break-words overflow-auto">
                            {JSON.stringify(runState.solution)}

                        </pre>
                    </div>
                </div>
            )}







        </div>
    )










}