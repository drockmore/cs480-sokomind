'use client'

const benchmarkData = [
  {
    mapSize: "Small Map",
    algorithms: [
      { name: "BFS", cost: 376, moves: 21 },
      { name: "DFS", cost: 142, moves: 39 },
      { name: "GBFS", cost: 67, moves: 21 },
      { name: "A*", cost: 67, moves: 21 },
      { name: "Custom Heuristic", cost: 96, moves: 21 },
    ],
  },
  {
    mapSize: "Medium Map",
    algorithms: [
      { name: "BFS", cost: '524,776', moves: 21 },
      { name: "DFS", cost: <span className="text-red-500">33.55m+</span>, moves: 'Unknown' },
      { name: "GBFS", cost: 87, moves: '24' },
      { name: "A*", cost: 90, moves: 24 },
      { name: "Custom Heuristic", cost: 83, moves: 24 },
    ],
  },
  {
    mapSize: "Large Map",
    algorithms: [
      { name: "BFS", cost: 376, moves: 21 },
      { name: "DFS", cost: <span className="text-red-500">20m+</span>, moves: 'Unknown' },
      { name: "GBFS", cost: '380,637', moves: '89' },
      { name: "A*", cost: '331,918', moves: '89' },
      { name: "Custom Heuristic", cost: '1,340,510', moves: 99 },
    ],
  },
];

export default function InfoPage({ }) {



  return (
    <div className="w-[1000px] mx-auto  mt-32 gap-12">
      <div className="">
        <div className="bg-white p-6 shadow-lg rounded-lg" >
          <div className="text-2xl font-bold mb-4">
            Custom Heuristic:
          </div>
          <p>
        
            The custom heuristic is a combination of the manhattan distance and the BFS algorithm.
            The heuristic will use BFS to determine if there exists a valid path to the target. 
            If a path is not available, the heuristic will return a high penalty value to avoid those paths.<br/><br/>

            This heuristic is much slower but appears to be more optimal compared to other heuristics where more boxes are added to the gameboard. 



          </p>

        </div>
      </div>


      <div className="space-y-8 mt-12">
        {benchmarkData.map((benchmark, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold bg-primary text-primary-foreground p-4">
              {benchmark.mapSize} Benchmark
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Algorithm</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmark.algorithms.map((algo, algoIndex) => (
                    <tr key={algoIndex} className={algoIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-medium">{algo.name}</td>
                      <td className="px-6 py-4">{algo.cost}</td>
                      <td className="px-6 py-4">{algo.moves} moves</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[200px]"></div>

    </div>
  )


}