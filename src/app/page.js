/**
 * Game board page
 */

'use client'

import { ControlCard } from "@/components/game-ui/control-card";
import { GameActionsCard } from "@/components/game-ui/game-actions-card";
import { GameboardContainer } from "@/components/game-ui/gameboard-container";
import { SolversContainer } from "@/components/game-ui/solvers-container";
import { MapInputLoader } from "@/components/game-ui/map-input-loader";


export default function Home() {


  return (
    <div className="h-screen container mx-auto">
      <div className="grid grid-cols-3 mt-32 w-full gap-12">
        <div className="w-full grid gap-6 col-span-2">
          <div>
            <GameboardContainer />
            <div className="w-full grid grid-cols-3 gap-12 mt-6">
              <ControlCard />
              <div className="col-span-2">
                <GameActionsCard />
              </div>
            </div>
          </div>
        </div>


        <div className="w-full">
          <SolversContainer />
          <MapInputLoader />
        </div>


      </div>




    </div >
  );
}

