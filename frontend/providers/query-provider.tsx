'use client'

import { ReactNode, useState } from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"

export default function QueryProvider({children}: {children: ReactNode}){
    const [client] = useState(() =>  new QueryClient({
        defaultOptions:{
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
                retry: false,
            }
        }
    }))
    return(
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    )
}