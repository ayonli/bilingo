import type { JSX } from "react/jsx-runtime"
import { Suspense } from "react"
import { BrowserRouter, useRoutes } from "react-router-dom"

// @ts-ignore internal module by vite-plugin-pages
import routes from "~react-pages"
import { Layout } from "../components/index.ts"
import { AuthProvider } from "../contexts/AuthContext.tsx"

function Routes(): JSX.Element | null {
    return useRoutes(routes)
}

export default function App(): JSX.Element {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <BrowserRouter>
                <AuthProvider>
                    <Layout>
                        <Routes />
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
        </Suspense>
    )
}
