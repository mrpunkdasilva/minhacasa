export enum AssetCategory {
  APPLIANCE = "Eletrodoméstico",
  ELECTRONICS = "Eletrônicos",
  FURNITURE = "Móveis",
  HVAC = "Ar-Condicionado/Ventilação",
  PLUMBING = "Hidráulica",
  ELECTRICAL = "Elétrica",
  STRUCTURE = "Estrutura",
}

export enum SystemType {
  ELECTRICAL = "Sistema Elétrico",
  PLUMBING = "Sistema Hidráulico",
  GAS = "Sistema de Gás",
  NETWORK = "Rede e Internet",
  SECURITY = "Segurança",
}

export enum UtilityType {
  WATER = "Água",
  ELECTRICITY = "Luz",
  GAS = "Gás",
}

export enum MaintenanceFrequency {
  MONTHLY = "Mensal",
  QUARTERLY = "Trimestral",
  SEMI_ANNUAL = "Semestral",
  ANNUAL = "Anual",
  BI_ANNUAL = "Bienal",
  ONCE = "Uma vez",
}

export enum MaintenanceStatus {
  OK = "ok",
  WARNING = "warning",
  OVERDUE = "overdue",
}

export enum UtilityUnit {
  KWH = "kWh",
  M3 = "m³",
  UNIT = "un",
}
