export type TableLayout = {
  id: number;
  name: string;
  shape: "RECT" | "CIRCLE" | "SQUARE";
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "UNAVAILABLE";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity?: number;
  deposit?: number;
};

export type AreaLayout = {
  areaId: number;
  areaName: string;
  tables: TableLayout[];
};

export type FloorLayoutResponse = {
  floorId: number;
  floorName: string;
  areas: AreaLayout[];
};

export type LayoutSaveRequest = {
  areas: {
    areaId: number;
    objects: {
      id: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }[];
  }[];
};
