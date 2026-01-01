import type { JSX } from "react/jsx-runtime"
import { BrowserRouter, useRoutes } from "react-router-dom"

// @ts-ignore internal module by vite-plugin-pages
import routes from "~react-pages"
import { Suspense } from "react"

function Routes(): JSX.Element | null {
    return useRoutes(routes)
}

export default function App(): JSX.Element {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </Suspense>
    )
}
