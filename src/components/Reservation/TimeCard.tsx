'use client'

import Link from "next/link";

export default function TimeCard({time}: {time: string}) {
        return (
            <div className="px-12 py-6 border-2 border-primary rounded-xl shadow-md 
                            font-bold text-2xl hover:cursor-pointer
                            hover:shadow-2xl">
                {time}:00
            </div>
        );
    }