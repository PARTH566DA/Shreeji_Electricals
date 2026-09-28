package com.shreeji.solar.model;

/** Gujarat electricity distribution companies (DISCOMs). */
public enum Discom {
    MGVCL("Madhya Gujarat Vij Company Ltd", "Central Gujarat (Vadodara, Anand, Nadiad, Godhra)"),
    DGVCL("Dakshin Gujarat Vij Company Ltd", "South Gujarat (Surat, Navsari, Valsad, Bharuch)"),
    UGVCL("Uttar Gujarat Vij Company Ltd", "North Gujarat (Mehsana, Banaskantha, Sabarkantha, Gandhinagar)"),
    PGVCL("Paschim Gujarat Vij Company Ltd", "West/Saurashtra-Kutch (Rajkot, Jamnagar, Bhavnagar, Junagadh)");

    private final String fullName;
    private final String area;

    Discom(String fullName, String area) {
        this.fullName = fullName;
        this.area = area;
    }

    public String getCode() { return name(); }
    public String getName() { return fullName; }
    public String getArea() { return area; }
}
