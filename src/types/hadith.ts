
export interface HadithInfo {
  id: number;
  name: string;
  title: string;
  text: string;
  source: string;
}

export interface HadithDetail {
  id: number;
  arab?: string;
  indo?: string;
  judul?: string;
  contents?: {
    arab?: string;
    id?: string;
  };
}

export interface HadithSource {
  id: string;
  name: string;
  range: number;
  endpoint: string;
  hasRandomEndpoint: boolean;
}
