import { type JSX, useEffect } from "react"
import { getUser } from "../api/user"

export default function UserIndexPage(): JSX.Element {
    useEffect(() => {
        ;(async () => {
            const { ok, value: user, error } = await getUser("the@ayon.li")
            if (ok) {
                console.log("Fetched user:", user)
                return user
            } else {
                throw new Error(error)
            }
        })()
    }, [])

    return <div>User Index Page</div>
}
