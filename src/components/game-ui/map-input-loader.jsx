import { useState } from 'react';
import { Button } from '../ui/button';
import { useGameStore } from '@/app/stores/game-store';

const MapInputLoader = () => {


    const { loadGameBoard } = useGameStore();


    const [input, setInput] = useState('');
    const [parsedArray, setParsedArray] = useState([]);

    const [error, setError] = useState(false)

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const parseGameboard = () => {
        const array = input
            .split('\n')            // Split the input by newline to get each row
            .filter((row) => row)    // Remove any empty rows
            .map((row) => row.split('')); // Split each row into characters
        setParsedArray(array);

        try {
            loadGameBoard(array);
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-xl">

            <div className="">
                <div className="space-y-2 mb-4">
                    <div className="font-bold">Add a gameboard</div>
                    <p>Create or Paste a gameboard below and press the &quot;Parse Gameboard&quot; button to parse and load the gameboard.</p>


                    {error && (
                        <div className="bg-red-50 border-red-100 text-red-700 p-4 rounded border">
                            <div className="text-lg">Error</div>
                            <div>There was an error parsing the gameboard. Please check the gameboard and try again.</div>
                        </div>
                    )}
                </div>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Paste your gameboard here"
                    className='w-full border rounded'
                    rows={10}
                    cols={30}
                />




            </div>
            <Button onClick={parseGameboard}>Parse Gameboard</Button>

            {parsedArray.length > 0 && (
                <div className="pt-6">
                    <div className="text-lg font-bold">Parsed Result:</div>
                    <div className="bg-slate-50 border rounded mt-4 p-2">
                        {parsedArray.map((row, index) => (
                            <div key={index} className="flex justify-center">
                                {row.map((cell, index) => (
                                    <div className="w-8" key={index}>
                                        {index === 0 && '['}
                                        &apos;{cell === ' ' ? ' ' : cell}&apos;
                                        {index === row.length - 1 ? ']' : ','}

                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export { MapInputLoader };
