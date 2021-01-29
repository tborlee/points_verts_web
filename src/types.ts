export enum OuiNon {
  true = "Oui",
  false = "Non",
}

export enum Activity {
  walk = "Marche",
  orientation = "Orientation",
}

export enum Status {
  OK = "OK",
  Modified = "Modifié",
  Cancelled = "Annulé",
}

export enum Province {
  BrabantWallon = "Brabant Wallon",
  HainautEst = "Hainaut Est",
  HainautOuest = "Hainaut Ouest",
  Liege = "Liège",
  Luxembourg = "Luxembourg",
  Namur = "Namur",
}

export type APIRecordFields = {
  velo: OuiNon;
  activite: Activity;
  orientiation: OuiNon;
  pmr: OuiNon;
  ndeg_pv: string;
  ravitaillement: OuiNon;
  gare: string;
  groupement: string;
  balade_guidee: OuiNon;
  entite: string;
  bewapp: OuiNon;
  id: number;
  "15km": OuiNon;
  vtt: OuiNon;
  latitude: number;
  ign: string;
  localite: string;
  province: Province;
  nom: string;
  statut: Status;
  lieu_de_rendez_vous: string;
  poussettes: OuiNon;
  infos_rendez_vous: string;
  date: string;
  prenom: string;
  longitude: number;
  "10km": OuiNon;
  gsm: string;
};

export type APIDate = {
  x: { year: number; month: number; day: number };
  walk_count: number;
};

export type APIRecord = {
  datasetid: string;
  recordid: string;
  distance?: number;
  fields: APIRecordFields;
};
