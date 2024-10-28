'use client'
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from 'next/navigation'

const Navigation = () => {

    const pathname = usePathname()

    return (
        <div className="w-full bg-white border-b h-20 flex items-center">
            <div className="container mx-auto">

                <div className="flex gap-6">

                    <div className="text-lg font-bold">
                        Sokoban Solvers
                    </div>

                    <div className="flex gap-6 pl-12 items-center">
                        <Link href="/" className={cn(pathname === '/' && 'text-green-500 underline font-bold', 'hover:underline underline-offset-2')}>Game</Link>
                        <Link href="/about" className={cn(pathname === '/about' && 'text-green-500 underline font-bold', 'hover:underline underline-offset-2')}>About</Link>
                    </div>

                </div>
            </div>

        </div>
    )



}

export { Navigation }