import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Role from "@/models/Role"

export async function GET() {
  try {
    await connectDB()

    const roles = await Role.find({}).lean()
    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error al obtener roles:", error)
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 })
  }
}
