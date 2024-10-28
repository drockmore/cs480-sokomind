import { useGameStore } from "@/app/stores/game-store";
import { Button } from "../ui/button";
import { smallMapBenchmark } from "@/benchmarks/small";
import { mediumMapBenchmark } from "@/benchmarks/medium";
import { largeMapBenchmark } from "@/benchmarks/large";

export const GameActionsCard = ({ }) => {

    const {
        loadGameBoard,
    } = useGameStore();

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="grid grid-cols-3 gap-6 ">
                <Button size="sm" onClick={() => loadGameBoard(smallMapBenchmark)}>Load Small Map</Button>
                <Button size="sm" onClick={() => loadGameBoard(mediumMapBenchmark)}>Load Medium Map</Button>
                <Button size="sm" onClick={() => loadGameBoard(largeMapBenchmark)}>Load Large Map</Button>
            </div>
        </div>
    )



}