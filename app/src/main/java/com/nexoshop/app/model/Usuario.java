package com.nexoshop.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

// ============================================================
// MODELO: Usuario — coleccion "usuarios", BD "usuario"
//
// Campos reales en MongoDB:
//   nombre, correo, telefono, direccion, password, rol, activo
//
// El campo "correo" en MongoDB se mapea al atributo "email"
// usando @Field("correo") para mantener compatibilidad con
// el resto del codigo Java.
// ============================================================
@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    private String nombre;

    @Indexed(unique = true)
    @Field("correo")
    private String email;

    private String telefono;

    private String direccion;

    private String password;

    private String rol;

    private boolean activo;

    private LocalDateTime fechaRegistro;

    private DatosEmpresa empresa;

    public Usuario() {}

    // Constructor COMPRADOR
    public Usuario(String nombre, String email, String telefono, String password) {
        this.nombre        = nombre;
        this.email         = email;
        this.telefono      = telefono;
        this.password      = password;
        this.rol           = "COMPRADOR";
        this.activo        = true;
        this.fechaRegistro = LocalDateTime.now();
    }

    // Constructor VENDEDOR
    public Usuario(String nombre, String email, String telefono, String password, DatosEmpresa empresa) {
        this.nombre        = nombre;
        this.email         = email;
        this.telefono      = telefono;
        this.password      = password;
        this.rol           = "VENDEDOR";
        this.activo        = false;
        this.empresa       = empresa;
        this.fechaRegistro = LocalDateTime.now();
    }

    // Clase interna empresa (solo VENDEDOR)
    public static class DatosEmpresa {
        private String nombre;
        private String nit;
        private String ciudad;

        public DatosEmpresa() {}

        public DatosEmpresa(String nombre, String nit, String ciudad) {
            this.nombre = nombre;
            this.nit    = nit;
            this.ciudad = ciudad;
        }

        public String getNombre()              { return nombre; }
        public void   setNombre(String n)      { this.nombre = n; }
        public String getNit()                 { return nit; }
        public void   setNit(String n)         { this.nit = n; }
        public String getCiudad()              { return ciudad; }
        public void   setCiudad(String c)      { this.ciudad = c; }
    }

    // Getters y Setters
    public String getId()                          { return id; }
    public void   setId(String id)                 { this.id = id; }
    public String getNombre()                      { return nombre; }
    public void   setNombre(String n)              { this.nombre = n; }
    public String getEmail()                       { return email; }
    public void   setEmail(String e)               { this.email = e; }
    public String getTelefono()                    { return telefono; }
    public void   setTelefono(String t)            { this.telefono = t; }
    public String getDireccion()                   { return direccion; }
    public void   setDireccion(String d)           { this.direccion = d; }
    public String getPassword()                    { return password; }
    public void   setPassword(String p)            { this.password = p; }
    public String getRol()                         { return rol; }
    public void   setRol(String r)                 { this.rol = r; }
    public boolean isActivo()                      { return activo; }
    public void    setActivo(boolean a)            { this.activo = a; }
    public LocalDateTime getFechaRegistro()        { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime f)  { this.fechaRegistro = f; }
    public DatosEmpresa getEmpresa()               { return empresa; }
    public void setEmpresa(DatosEmpresa e)         { this.empresa = e; }
}
