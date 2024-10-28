'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import { useGameStore } from '@/app/stores/game-store'
import { Loader } from 'lucide-react'
import { Alert, AlertTitle } from '../ui/alert'
import { blockImageMap, blockStorageImageMap } from '@/app/constants'

const ITEMS = [' ', 'O', 'R', 'a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E', 'S', 'X'];

const blocks = ['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const storageBlocks = ['S', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];


const allBlockImages = {...blockImageMap, blockStorageImageMap};



export default function MapBuilder() {

    const {
        loadGameBoard,
        dimensions, setDimensions,
        board, setBoard,
        step, setStep,
    } = useGameStore();



    const [loading, setLoading] = useState(false);


    const handleDimensionChange = (dim, value) => {
        const numValue = parseInt(value, 10)
        setDimensions({ ...dimensions, [dim]: isNaN(numValue) ? 0 : numValue })
    }

    const createBoard = () => {

        setLoading(true);

        if (dimensions.x > 0 && dimensions.y > 0) {

            let tempBoard = [];

            for (let y = 0; y < dimensions.y; y++) {

                let tempY = [];

                for (let x = 0; x < dimensions.x; x++) {

                    if (y === 0 || y === dimensions.y - 1) {
                        tempY.push('O');
                        continue;
                    }

                    if (x === 0) {
                        tempY.push('O');
                        continue;
                    }

                    if (x === dimensions.x - 1) {
                        tempY.push('O');
                        continue;
                    }

                    tempY.push(' ');

                }

                tempBoard.push(tempY);

            }

            console.log(tempBoard)
            setBoard(tempBoard);
            setLoading(false);
            setStep(2)
        }
    }

    const handleItemSelect = (y, x, value) => {
        const newBoard = [...board]
        newBoard[y][x] = value
        setBoard(newBoard)
    }


    const handleLoadMap = () => {
        loadGameBoard(board);
    }

    return (
        <div className="w-full bg-white rounded-lg shadow mx-auto p-4 space-y-4">
            <h2 className="text-2xl font-bold text-center">Game Board Builder</h2>

       

            {step === 1 && (
                <div className="space-y-4 flex justify-center">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="x-dimension" className="w-24">X Dimension:</Label>
                            <Input
                                id="x-dimension"
                                type="number"
                                min="1"
                                value={dimensions.x}
                                onChange={(e) => handleDimensionChange('x', e.target.value)}
                                className="w-24"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="y-dimension" className="w-24">Y Dimension:</Label>
                            <Input
                                id="y-dimension"
                                type="number"
                                min="1"
                                value={dimensions.y}
                                onChange={(e) => handleDimensionChange('y', e.target.value)}
                                className="w-24"
                            />
                        </div>
                        <Button className="w-full flex gap-2" onClick={createBoard} disabled={dimensions.x <= 0 || dimensions.y <= 0}>
                            Create Board
                            {loading && <Loader className="w-4 h-4 animate-spin" />}
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">



                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${dimensions.x}, minmax(0, 1fr))` }}>
                        {board.map((row, y) => (
                            row.map((cell, x) => (

                                <Select key={`${y}-${x}`} onValueChange={(value) => handleItemSelect(y, x, value)} defaultValue={cell}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ITEMS.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item === ' ' ? 'Blank Tile' : item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ))
                        ))}
                    </div>

                    <Button onClick={handleLoadMap} className="w-full">Add Custom Map To Game</Button>

                    <Alert>
                        <div className="font-bold">Click the "Create Custom Map" button again if this map needs to be editted.</div>
                    </Alert>


                    <div className="border rounded p-2 bg-gray-50">
                        <h3 className="text-lg font-semibold mb-2">Board Preview:</h3>
                        <div className="font-mono whitespace-pre" aria-live="polite">
                            {/* {board.map((row, index) => (
                <div key={index}>{row.join('')}</div>
              ))} */}
                            <MapPreview gameboard={board} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



const MapPreview = ({ gameboard }) => {




    return (
        <div className="grid">


            <div className=" overflow-hidden rounded border w-fit">

                {gameboard?.map((row, i) => (

                    <div
                        key={i}
                        className="flex bg-repeat relative"
                        style={{ backgroundImage: `url('/floor.png')`, backgroundSize: '128px 128px' }}
                    >
                        {row.map((cell, j) => {

                            const isBlock = blocks.includes(cell);
                            const isStorage = blocks.includes(cell);

                            return (
                                <div key={j} className="relative h-[50px] overflow-hidden relative">

                                    {cell === 'O' ? <Image src="/brick-2.png?v=2" alt="wall" width={50} height={50} />
                                        : <Image src="/empty-spot.png" alt="floor" width={50} height={50} />}


                                    {cell !== 'O' && cell !== ' ' && (
                                        <div className="absolute z-30 top-0">

                                            <Image
                                                src={allBlockImages[cell]}
                                                alt="Map preview block"
                                                width={50}
                                                height={50}
                                            />
                                        </div>
                                    )}

                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="">


                {JSON.stringify(gameboard, null, 2)}


            </div>
        </div>
    )



}