import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = Number.parseInt(params.id);
    const userData = await request.json();

    // Solo permitir editar los campos permitidos
    const editableFields = ["nombre", "primerApell", "segundoApell", "numTel", "estado", "idRol"];
    const updateData: any = {};
    for (const field of editableFields) {
      if (userData[field] !== undefined) {
        // Manejar segundoApell especialmente para evitar cadenas vacías
        if (field === "segundoApell") {
          updateData[field] = userData[field] || undefined;
        } else {
          updateData[field] = userData[field];
        }
      }
    }

    // Validar que el rol exista y sea válido si se va a cambiar
    if (updateData.idRol !== undefined) {
      const Role = (await import("@/models/Role")).default;
      const validRoles = await Role.find({ nombreRol: { $in: ["Administrador", "Usuario"] } }).lean();
      const validRoleIds = validRoles.map(r => r._id);
      if (!validRoleIds.includes(updateData.idRol)) {
        return NextResponse.json({ error: "El rol seleccionado no es válido" }, { status: 400 });
      }
    }

    // Validar que el correo y número telefónico no estén repetidos en otros usuarios
    if (updateData.correo) {
      const existingUserByEmail = await User.findOne({ correo: updateData.correo, _id: { $ne: id } });
      if (existingUserByEmail) {
        return NextResponse.json({ error: "El correo electrónico ya está registrado en otro usuario" }, { status: 400 });
      }
    }
    if (updateData.numTel) {
      const existingUserByPhone = await User.findOne({ numTel: updateData.numTel, _id: { $ne: id } });
      if (existingUserByPhone) {
        return NextResponse.json({ error: "El número de teléfono ya está registrado en otro usuario" }, { status: 400 });
      }
    }

    const updatedUser = await User.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
      projection: { contrasena: 0 },
    }).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = Number.parseInt(params.id)

    const deletedUser = await User.findOneAndDelete({ _id: id })
    if (!deletedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}

