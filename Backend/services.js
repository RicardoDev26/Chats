import { message } from "telegram/client";

app.post('/api/registro', (req, res)=>{
    const { usuario } = req.body
    const userUuid = uuidv4();
    const userId = `${usuario}#${userUuid}`
    
    res.json({ user_id: userId, message: "Usuario creado con exito" })
});

app.post('/api/canales/crear', (req, res)=>{
    const { nombre_sala, userId } = req.body
    const sala_id = uuidv4();

    res.json({ sala_id: sala_id, message: "Canal creado con exito" })
});

app.post ('/api/canales/entrar', (req, res)=>{
    const { sala_id, user_id } = req.body

    res.json({ message: "Te has unido a una sala" })
});

app.get('/api/canales/:sala_id', (req, res)=>{
    const { sala_id } = req.params

    res.json({
        sala_id,
        nombre_sala: "Nombre del canal",
        members: [
            { user_id: "nombre_usuario#user-uuid", usuario: "nombre_usuario"}
        ]
    });
});

app.post('/api/canales/invitar',(req,res)=>{
    const { sala_id, user_id, invitado_id } = req.body

    res.json({ message: "Invitacion creada con exito." })
})

const PORT = process.env.PORT || 3001;
app.listen( PORT, ()=> console.log(`server corriendo en el puerto ${PORT}`));