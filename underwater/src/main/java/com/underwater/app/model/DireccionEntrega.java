package com.underwater.app.model;

public class DireccionEntrega {
    private String nombre;
    private String linea;
    private String ciudad;
    private String departamento;
    private String telefono;

    public DireccionEntrega() {}

    public String getNombre()              { return nombre; }
    public void   setNombre(String n)       { this.nombre = n; }
    public String getLinea()               { return linea; }
    public void   setLinea(String l)        { this.linea = l; }
    public String getCiudad()              { return ciudad; }
    public void   setCiudad(String c)       { this.ciudad = c; }
    public String getDepartamento()        { return departamento; }
    public void   setDepartamento(String d) { this.departamento = d; }
    public String getTelefono()            { return telefono; }
    public void   setTelefono(String t)     { this.telefono = t; }
}
