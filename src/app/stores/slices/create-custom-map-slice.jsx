export const createCustomMapSlice = (set, get) => ({

    createMap: false,
    toggleCreateMap: () => set((state) => ({ createMap: !state.createMap })),

    dimensions: {x: 5, y: 5 },
    setDimensions: (value) => set({dimensions: value}),

    board: [],
    setBoard: (value) => set({board: value}),

    step: 1,
    setStep: (value) => set({step: value})

})