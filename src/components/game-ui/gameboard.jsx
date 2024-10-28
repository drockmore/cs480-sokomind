'use client'

import {  blockImageMap, blockItemsImageMap, blockStorageImageMap } from "@/app/constants";
import { useGameStore } from "@/app/stores/game-store";
import Image from "next/image";


export const GameBoard = ({ }) => {

    const {
        gameboard,
        playerPosition,
        blockPositions,
        storageBlockCells,
    } = useGameStore();

    return (
        <div className="p-12 w-full  border rounded flex justify-center">
            <div className="flex">
                <div className=" overflow-hidden rounded border w-fit">

                    {gameboard?.map((row, i) => (
                        <div
                            key={i}
                            className="flex bg-repeat relative"
                            style={{ backgroundImage: `url(${blockItemsImageMap.floor})`, backgroundSize: '128px 128px' }}
                        >
                            {row.map((cell, j) => {
                                const position = { x: j, y: i };
                                const block = blockPositions.find((block) => block.x === position.x && block.y === position.y);
                                const storageBlock = storageBlockCells.find((block) => block.x === position.x && block.y === position.y);
                                const isPlayerPosition = playerPosition.x === position.x && playerPosition.y === position.y;

                                return (
                                    <div key={j} className="relative h-[50px] overflow-hidden relative">

                                        {cell === 'O' ? <Image src={blockItemsImageMap.brick} alt="wall" width={50} height={50} />
                                            : <Image src={blockItemsImageMap.blank} alt="floor" width={50} height={50} />}


                                        <div className="absolute z-50 top-0">
                                            {isPlayerPosition && (
                                                <Image
                                                    src={blockItemsImageMap.user}
                                                    alt="Robot"
                                                    width={50}
                                                    height={50}
                                                />
                                            )}
                                        </div>

                                        <div className="absolute z-30 top-0">
                                            {storageBlock?.type && (
                                                <Image
                                                    src={blockStorageImageMap[storageBlock.type]}
                                                    alt="Storage"
                                                    width={50}
                                                    height={50}
                                                />
                                            )}
                                        </div>

                                        <div className="absolute z-30 top-0">
                                            {block?.type && (
                                                <Image
                                                    src={blockImageMap[block.type]}
                                                    alt="blocks"
                                                    width={50}
                                                    height={50}
                                                />
                                            )}

                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}