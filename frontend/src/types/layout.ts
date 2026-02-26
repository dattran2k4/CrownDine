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

export type FloorRequest = {
  name: string;
};

export type AreaRequest = {
  name: string;
  description?: string;
};

export type TableRequest = {
  name: string;
  capacity?: number;
  shape: "RECT" | "CIRCLE" | "SQUARE";
  deposit?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotation?: number;
};
