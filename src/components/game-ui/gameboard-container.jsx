import { useGameStore } from "@/app/stores/game-store"
import { GameBoard } from "./gameboard";
import MapBuilder from "./map-builder-input";


export const GameboardContainer = ({ }) => {


    const {
        createMap,
        originalGameBoard,

    } = useGameStore();


    if (createMap) {
       return <MapBuilder />
    }

    if (originalGameBoard?.length === 0) {
        return <EmptyGameboard />
    }

    return (
        <GameBoard />
    )
}


const EmptyGameboard = ({ }) => {

    return (
        <div className="w-full h-[300px] border rounded-lg flex items-center justify-center">
            <div className="text-xl font-bold">Load a map to get started.</div>
        </div>
    )


}