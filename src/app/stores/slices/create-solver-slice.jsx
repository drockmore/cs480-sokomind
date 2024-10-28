export const CreateSolverSlice = (set, get) => ({


    runState: {
        iterations: 0,
        status: 'Not started',
        maxIterations: 0,
        solution: [],
        solver: '',
    },


    setRunState: (key, value) => set((state) => ({
        runState: {
            ...state.runState,
            [key]: value
        }
    })),

    resetRunState: () => set((state) => ({
        runState: {
            iterations: 0,
            status: 'Not started',
            maxIterations: 0,
            solution: [],
            solver: ''
        }
    }))


})