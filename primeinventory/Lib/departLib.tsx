import { SetStateAction } from "react"

type fetchResponse = { status: string, data: [], statusCode: number }

export const getDepartment = async (setDepartments: SetStateAction<any>) => {
    try {
        let response = await fetch(`http://localhost:5000/api/v1/departments`)
        const res = await response.json()
        const { status, data, statusCode } = res
        if (status == "success" && statusCode == 200) {
            setDepartments(data)
        } else {
            setDepartments([])
        }
    } catch (err) {
        setDepartments([])
    }
}
