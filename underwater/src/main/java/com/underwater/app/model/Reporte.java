package com.underwater.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "reportes")
public class Reporte {

    @Id private String id;

    private String tipo;          // PRODUCTO | USUARIO | PEDIDO | OTRO
    private String asunto;
    private String descripcion;
    private String estado;        // PENDIENTE | REVISADO | RESUELTO

    private String usuarioId;
    private String usuarioNombre;
    private String usuarioEmail;
    private String usuarioRol;    // COMPRADOR | VENDEDOR

    private String entidadId;     // ID del producto/pedido reportado (opcional)
    private String entidadNombre; // Nombre del producto/pedido (opcional)

    private String respuestaAdmin;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaRespuesta;

    public Reporte() {}

    public String getId()                             { return id; }
    public void   setId(String id)                    { this.id = id; }
    public String getTipo()                           { return tipo; }
    public void   setTipo(String t)                   { this.tipo = t; }
    public String getAsunto()                         { return asunto; }
    public void   setAsunto(String a)                 { this.asunto = a; }
    public String getDescripcion()                    { return descripcion; }
    public void   setDescripcion(String d)            { this.descripcion = d; }
    public String getEstado()                         { return estado; }
    public void   setEstado(String e)                 { this.estado = e; }
    public String getUsuarioId()                      { return usuarioId; }
    public void   setUsuarioId(String u)              { this.usuarioId = u; }
    public String getUsuarioNombre()                  { return usuarioNombre; }
    public void   setUsuarioNombre(String u)          { this.usuarioNombre = u; }
    public String getUsuarioEmail()                   { return usuarioEmail; }
    public void   setUsuarioEmail(String u)           { this.usuarioEmail = u; }
    public String getUsuarioRol()                     { return usuarioRol; }
    public void   setUsuarioRol(String u)             { this.usuarioRol = u; }
    public String getEntidadId()                      { return entidadId; }
    public void   setEntidadId(String e)              { this.entidadId = e; }
    public String getEntidadNombre()                  { return entidadNombre; }
    public void   setEntidadNombre(String e)          { this.entidadNombre = e; }
    public String getRespuestaAdmin()                 { return respuestaAdmin; }
    public void   setRespuestaAdmin(String r)         { this.respuestaAdmin = r; }
    public LocalDateTime getFechaCreacion()           { return fechaCreacion; }
    public void   setFechaCreacion(LocalDateTime f)   { this.fechaCreacion = f; }
    public LocalDateTime getFechaRespuesta()          { return fechaRespuesta; }
    public void   setFechaRespuesta(LocalDateTime f)  { this.fechaRespuesta = f; }
}
