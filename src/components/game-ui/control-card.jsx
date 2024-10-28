'use client'
import { useGameStore } from "@/app/stores/game-store";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, InfoIcon, LoaderPinwheel, Undo } from "lucide-react";




export const ControlCard = ({ }) => {

  const {
    movePlayer,
    undoMove,
    resetGame
  } = useGameStore();



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


  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-3">
          <div />
          <Button size="icon" variant="outline" onClick={() => handleManualPlayerMove('up')}><ChevronUp className="w-4 h-4 text-blue-500" /></Button>
          <div />
          <Button size="icon" variant="outline" onClick={() => handleManualPlayerMove('left')}><ChevronLeft className="w-4 h-4 text-blue-500" /></Button>
          <div />
          <Button size="icon" variant="outline" onClick={() => handleManualPlayerMove('right')}><ChevronRight className="w-4 h-4 text-blue-500" /></Button>
          <div />
          <Button size="icon" variant="outline" onClick={() => handleManualPlayerMove('down')}><ChevronDown className="w-4 h-4 text-blue-500" /></Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 w-full space-y-6">
        <Button variant="outline" className="flex gap-2 w-full" onClick={() => undoMove()}><Undo className="w-4 h-4" /> Undo Move</Button>
        <Button className="w-full" variant="outline" onClick={resetGame}>Reset Game</Button>
      </div>


    </div>
  )


}