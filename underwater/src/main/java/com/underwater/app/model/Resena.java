package com.underwater.app.model;

import java.time.LocalDateTime;

// Clase embebida dentro de Producto — NO es @Document
public class Resena {
    private String        usuarioId;
    private String        nombreUsuario;
    private int           valoracion;   // 1-5
    private String        comentario;
    private LocalDateTime fechaResena;

    public Resena() {}

    public Resena(String usuarioId, String nombreUsuario, int valoracion, String comentario) {
        this.usuarioId     = usuarioId;
        this.nombreUsuario = nombreUsuario;
        this.valoracion    = valoracion;
        this.comentario    = comentario;
        this.fechaResena   = LocalDateTime.now();
    }

    public String        getUsuarioId()                   { return usuarioId; }
    public void          setUsuarioId(String u)            { this.usuarioId = u; }
    public String        getNombreUsuario()                { return nombreUsuario; }
    public void          setNombreUsuario(String n)        { this.nombreUsuario = n; }
    public int           getValoracion()                   { return valoracion; }
    public void          setValoracion(int v)              { this.valoracion = v; }
    public String        getComentario()                   { return comentario; }
    public void          setComentario(String c)           { this.comentario = c; }
    public LocalDateTime getFechaResena()                  { return fechaResena; }
    public void          setFechaResena(LocalDateTime f)   { this.fechaResena = f; }
}