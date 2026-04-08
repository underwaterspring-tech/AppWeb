package com.nexoshop.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// ============================================================
// MODELO: Admin — coleccion "admins", BD "admin"
//
// Campos reales en MongoDB:
//   nombre, Correo (C mayuscula), password, direccion
// ============================================================
@Document(collection = "admins")
public class Admin {

    @Id
    private String id;

    private String nombre;

    // En MongoDB el campo se llama "Correo" con C mayuscula
    private String Correo;

    private String password;

    private String direccion;

    public Admin() {}

    public String getId()                  { return id; }
    public void   setId(String id)         { this.id = id; }
    public String getNombre()              { return nombre; }
    public void   setNombre(String n)      { this.nombre = n; }
    public String getCorreo()              { return Correo; }
    public void   setCorreo(String c)      { this.Correo = c; }
    public String getPassword()            { return password; }
    public void   setPassword(String p)    { this.password = p; }
    public String getDireccion()           { return direccion; }
    public void   setDireccion(String d)   { this.direccion = d; }
}
